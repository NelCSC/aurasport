import { Tournament, MatchEvent, Player } from '@/types/sports';
import { supabase } from '@/lib/supabaseClient';

export interface AppSyncData {
  tournaments: Tournament[];
  matches: MatchEvent[];
  players: Player[];
  lastUpdated?: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const BROADCAST_CHANNEL_NAME = 'sportmaster_cross_device_sync';
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported or error:', e);
  }
}

/**
 * Fetch the latest global state from the server cloud endpoint (/api/sync)
 */
export async function fetchGlobalCloudState(): Promise<AppSyncData | null> {
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Cloud sync error HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      tournaments: data.tournaments || [],
      matches: data.matches || [],
      players: data.players || [],
      lastUpdated: data.lastUpdated || Date.now(),
    };
  } catch (err) {
    console.warn('fetchGlobalCloudState failed:', err);
    return null;
  }
}

/**
 * Push updated tournaments, matches, or players to cloud server & Supabase
 */
export async function pushGlobalCloudState(state: {
  tournaments?: Tournament[];
  matches?: MatchEvent[];
  players?: Player[];
}): Promise<boolean> {
  try {
    const clientTimestamp = Date.now();

    // 1. Notify other local tabs/windows immediately via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'STATE_UPDATED',
        timestamp: clientTimestamp,
        payload: state,
      });
    }

    // 2. Push to server API route so all other devices (Mobile, PC, etc.) see it
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tournaments: state.tournaments,
        matches: state.matches,
        players: state.players,
        clientTimestamp,
      }),
    });

    if (!res.ok) {
      console.warn('pushGlobalCloudState server responded with status', res.status);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('pushGlobalCloudState failed:', err);
    return false;
  }
}

/**
 * Subscribes to real-time updates from other devices/tabs via:
 * 1. BroadcastChannel (instant within device)
 * 2. Window focus & visibilitychange (instant on tab return or screen unlock)
 * 3. Polling interval (every 5 seconds)
 * 4. Supabase Realtime channel (if Supabase is active)
 */
export function subscribeToRealtimeSync(
  onUpdate: (data: AppSyncData) => void,
  getLastKnownTimestamp: () => number
): () => void {
  let isSubscribed = true;

  // Handle local BroadcastChannel messages
  const handleBroadcastMessage = (event: MessageEvent) => {
    if (!isSubscribed) return;
    if (event.data && event.data.type === 'STATE_UPDATED') {
      const payload = event.data.payload;
      if (payload) {
        onUpdate({
          tournaments: payload.tournaments,
          matches: payload.matches,
          players: payload.players,
          lastUpdated: event.data.timestamp || Date.now(),
        });
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Poll cloud server for cross-device updates (Mobile <-> PC)
  const checkForCloudUpdates = async () => {
    if (!isSubscribed) return;
    try {
      const cloudData = await fetchGlobalCloudState();
      if (!cloudData) return;

      const currentTimestamp = getLastKnownTimestamp();
      if (cloudData.lastUpdated && cloudData.lastUpdated > currentTimestamp) {
        onUpdate(cloudData);
      }
    } catch (e) {
      console.warn('Cloud poll check error:', e);
    }
  };

  // Re-check whenever the user switches back to the tab or mobile screen turns on
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkForCloudUpdates();
    }
  };

  const handleWindowFocus = () => {
    checkForCloudUpdates();
  };

  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
  }

  // Periodic heartbeat poll every 5 seconds for background cross-device sync
  const pollTimer = setInterval(checkForCloudUpdates, 5000);

  // Supabase Realtime channel subscription if Supabase is active
  let supabaseChannel: any = null;
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('sportmaster-global-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sportmaster_sync' },
          (payload: any) => {
            if (!isSubscribed) return;
            const record = payload.new || payload.record;
            if (record && record.tournaments) {
              onUpdate({
                tournaments: record.tournaments || [],
                matches: record.matches || [],
                players: record.players || [],
                lastUpdated: new Date(record.updated_at || Date.now()).getTime(),
              });
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Could not initialize Supabase Realtime channel:', err);
    }
  }

  // Cleanup function
  return () => {
    isSubscribed = false;
    clearInterval(pollTimer);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    }
    if (supabaseChannel && supabase) {
      try {
        supabase.removeChannel(supabaseChannel);
      } catch (e) {
        console.warn('Error removing Supabase channel:', e);
      }
    }
  };
}
