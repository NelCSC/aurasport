import { Tournament, MatchEvent, Player } from '@/types/sports';
import { supabase } from '@/lib/supabaseClient';
import { AdminSpaceInfo, getSpaceDisplayName } from '@/lib/spaceManager';

export interface AppSyncData {
  tournaments: Tournament[];
  matches: MatchEvent[];
  players: Player[];
  lastUpdated?: number;
  dataVersion?: number;
  spaceId?: string;
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
 * Fetch the latest state for a specific Admin Space from the cloud endpoint (/api/sync)
 */
export async function fetchGlobalCloudState(spaceId: string = 'global_state'): Promise<AppSyncData | null> {
  const cleanSpace = spaceId.trim() || 'global_state';

  try {
    const res = await fetch(`/api/sync?spaceId=${encodeURIComponent(cleanSpace)}`, {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && (Array.isArray(data.tournaments) || Array.isArray(data.matches))) {
        return {
          spaceId: data.spaceId || cleanSpace,
          tournaments: data.tournaments || [],
          matches: data.matches || [],
          players: data.players || [],
          lastUpdated: data.lastUpdated || Date.now(),
          dataVersion: data.dataVersion || 1,
        };
      }
    }
  } catch (err) {
    console.warn(`fetchGlobalCloudState failed for space ${cleanSpace}, attempting direct Supabase query:`, err);
  }

  // Direct Supabase query fallback
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('sportmaster_sync')
        .select('*')
        .eq('id', cleanSpace)
        .single();

      if (!error && data && Array.isArray(data.tournaments)) {
        return {
          spaceId: cleanSpace,
          tournaments: data.tournaments || [],
          matches: data.matches || [],
          players: data.players || [],
          lastUpdated: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
          dataVersion: 1,
        };
      }
    } catch (e) {
      console.warn('Direct Supabase fetch error:', e);
    }
  }

  return null;
}

/**
 * Fetch all registered admin spaces from Supabase so spectators can browse leagues
 */
export async function fetchAvailableAdminSpaces(): Promise<AdminSpaceInfo[]> {
  try {
    const res = await fetch('/api/sync?listSpaces=true', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.spaces)) {
        return json.spaces.map((s: any) => ({
          id: s.id,
          name: getSpaceDisplayName(s.id),
          adminEmail: s.id.replace(/^space_/, '').replace(/_/g, '.'),
          tournamentsCount: s.tournamentsCount || 0,
          matchesCount: s.matchesCount || 0,
          playersCount: s.playersCount || 0,
          lastUpdated: s.updated_at,
        }));
      }
    }
  } catch (e) {
    console.warn('Could not fetch available admin spaces:', e);
  }

  return [
    {
      id: 'global_state',
      name: 'Liga Central (Global)',
      adminEmail: 'admin@aurasport.com',
      tournamentsCount: 2,
      matchesCount: 3,
      playersCount: 8,
    },
  ];
}

/**
 * Push updated tournaments, matches, or players to cloud server & Supabase for a specific Admin Space
 */
export async function pushGlobalCloudState(
  state: {
    tournaments?: Tournament[];
    matches?: MatchEvent[];
    players?: Player[];
  },
  spaceId: string = 'global_state'
): Promise<boolean> {
  const cleanSpace = spaceId.trim() || 'global_state';

  try {
    const clientTimestamp = Date.now();

    // 1. Notify other local tabs/windows immediately via BroadcastChannel
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'STATE_UPDATED',
        spaceId: cleanSpace,
        timestamp: clientTimestamp,
        payload: state,
      });
    }

    // 2. Direct client Supabase upsert (instant direct write to database)
    if (supabase && (state.tournaments || state.matches || state.players)) {
      try {
        const payload: Record<string, any> = {
          id: cleanSpace,
          updated_at: new Date(clientTimestamp).toISOString(),
        };
        if (state.tournaments) payload.tournaments = state.tournaments;
        if (state.matches) payload.matches = state.matches;
        if (state.players) payload.players = state.players;

        supabase
          .from('sportmaster_sync')
          .upsert(payload, { onConflict: 'id' })
          .then(({ error }) => {
            if (error) console.warn('Direct client Supabase upsert notice:', error.message);
          });
      } catch (err) {
        console.warn('Direct client Supabase error:', err);
      }
    }

    // 3. Push to server API route so all other devices (Mobile, PC, etc.) receive it
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        spaceId: cleanSpace,
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
 * Subscribes to real-time updates from other devices/tabs for a specific space
 */
export function subscribeToRealtimeSync(
  onUpdate: (data: AppSyncData) => void,
  getCurrentSnapshot: () => {
    lastTimestamp: number;
    tournamentsCount: number;
    matchesCount: number;
    playersCount: number;
    dataVersion: number;
  },
  getActiveSpaceId: () => string = () => 'global_state'
): () => void {
  let isSubscribed = true;
  let isChecking = false;

  // Handle local BroadcastChannel messages
  const handleBroadcastMessage = (event: MessageEvent) => {
    if (!isSubscribed) return;
    if (event.data && event.data.type === 'STATE_UPDATED') {
      const msgSpaceId = event.data.spaceId || 'global_state';
      const currentSpaceId = getActiveSpaceId();

      // Only apply if it targets the currently active space
      if (msgSpaceId === currentSpaceId) {
        const payload = event.data.payload;
        if (payload) {
          onUpdate({
            spaceId: msgSpaceId,
            tournaments: payload.tournaments,
            matches: payload.matches,
            players: payload.players,
            lastUpdated: event.data.timestamp || Date.now(),
          });
        }
      }
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  // Poll cloud server for cross-device updates (Mobile <-> PC)
  const checkForCloudUpdates = async () => {
    if (!isSubscribed || isChecking) return;
    isChecking = true;

    try {
      const currentSpaceId = getActiveSpaceId();
      const cloudData = await fetchGlobalCloudState(currentSpaceId);
      if (!cloudData || !isSubscribed) return;

      const current = getCurrentSnapshot();

      const versionChanged =
        cloudData.dataVersion !== undefined && cloudData.dataVersion > current.dataVersion;
      const timestampChanged =
        cloudData.lastUpdated !== undefined && cloudData.lastUpdated > current.lastTimestamp + 1000;
      const countChanged =
        cloudData.tournaments.length !== current.tournamentsCount ||
        cloudData.matches.length !== current.matchesCount ||
        cloudData.players.length !== current.playersCount;

      if (versionChanged || timestampChanged || countChanged) {
        onUpdate(cloudData);
      }
    } catch (e) {
      console.warn('Cloud poll check error:', e);
    } finally {
      isChecking = false;
    }
  };

  // Re-check on tab return / screen unlock
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

  // Periodic heartbeat poll every 4 seconds for instant cross-device sync
  const pollTimer = setInterval(checkForCloudUpdates, 4000);

  // Supabase Realtime channel
  let supabaseChannel: any = null;
  if (supabase) {
    try {
      supabaseChannel = supabase
        .channel('sportmaster-multi-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sportmaster_sync' },
          (payload: any) => {
            if (!isSubscribed) return;
            const record = payload.new || payload.record;
            const currentSpaceId = getActiveSpaceId();

            if (record && record.id === currentSpaceId && record.tournaments) {
              onUpdate({
                spaceId: record.id,
                tournaments: record.tournaments || [],
                matches: record.matches || [],
                players: record.players || [],
                lastUpdated: new Date(record.updated_at || Date.now()).getTime(),
                dataVersion: record.data_version,
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
