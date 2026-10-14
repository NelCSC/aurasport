import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TOURNAMENTS, INITIAL_PLAYERS, INITIAL_MATCHES } from '@/lib/initialData';
import { Tournament, MatchEvent, Player } from '@/types/sports';

interface SpaceSportState {
  tournaments: Tournament[];
  matches: MatchEvent[];
  players: Player[];
  lastUpdated: number;
  dataVersion: number;
}

// In-memory cache keyed by spaceId (e.g. 'global_state', 'space_admin_copaperu_com')
const multiSpaceStore: Record<string, SpaceSportState> =
  (global as any).__sportmaster_multi_spaces || {};
(global as any).__sportmaster_multi_spaces = multiSpaceStore;

function getInitialStateForSpace(spaceId: string): SpaceSportState {
  if (spaceId === 'global_state') {
    return {
      tournaments: INITIAL_TOURNAMENTS,
      matches: INITIAL_MATCHES,
      players: INITIAL_PLAYERS,
      lastUpdated: Date.now(),
      dataVersion: 1,
    };
  }

  // For a custom admin space, create a personalized initial tournament structure
  const adminName = spaceId.replace(/^space_/, '').replace(/^admin_/, '');
  const cleanTitle = adminName
    .split('_')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');

  const personalizedTournaments: Tournament[] = [
    {
      ...INITIAL_TOURNAMENTS[0],
      id: `torneo-${adminName || 'propio'}-futbol`,
      name: `Copa Apertura ${cleanTitle || 'Oficial'}`,
    },
    {
      ...INITIAL_TOURNAMENTS[1],
      id: `torneo-${adminName || 'propio'}-voley`,
      name: `Liga Vóley ${cleanTitle || 'Oficial'}`,
    },
  ];

  return {
    tournaments: personalizedTournaments,
    matches: INITIAL_MATCHES,
    players: INITIAL_PLAYERS,
    lastUpdated: Date.now(),
    dataVersion: 1,
  };
}

/**
 * Helper to get the best Supabase Key (prefer Service Role for full writes, fallback to Anon)
 */
function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const key = serviceKey || anonKey;

  const isConfigured = Boolean(url && key && !url.includes('your-project-id'));
  return { url, key, isConfigured };
}

/**
 * Seed Supabase table with initial tournaments for a specific space
 */
async function seedSupabaseSpaceIfNeeded(
  url: string,
  key: string,
  spaceId: string,
  initialData: SpaceSportState
) {
  try {
    await fetch(`${url}/rest/v1/sportmaster_sync`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: spaceId,
        updated_at: new Date().toISOString(),
        tournaments: initialData.tournaments,
        matches: initialData.matches,
        players: initialData.players,
      }),
    });
  } catch (e) {
    console.warn(`Could not auto-seed Supabase space ${spaceId}:`, e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spaceId = (searchParams.get('spaceId') || searchParams.get('space') || 'global_state').trim();
    const listSpaces = searchParams.get('listSpaces') === 'true';

    const { url: supabaseUrl, key: supabaseKey, isConfigured } = getSupabaseConfig();

    // Option: List all registered admin spaces in Supabase so followers can browse leagues
    if (listSpaces) {
      if (isConfigured) {
        try {
          const res = await fetch(
            `${supabaseUrl}/rest/v1/sportmaster_sync?select=id,updated_at,tournaments,matches,players`,
            {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
              cache: 'no-store',
            }
          );

          if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows)) {
              const spaces = rows.map((r: any) => ({
                id: r.id,
                updated_at: r.updated_at,
                tournamentsCount: Array.isArray(r.tournaments) ? r.tournaments.length : 0,
                matchesCount: Array.isArray(r.matches) ? r.matches.length : 0,
                playersCount: Array.isArray(r.players) ? r.players.length : 0,
                tournaments: Array.isArray(r.tournaments)
                  ? r.tournaments.map((t: any) => ({ id: t.id, name: t.name, sport: t.sport }))
                  : [],
              }));
              return NextResponse.json({ spaces });
            }
          }
        } catch (err) {
          console.warn('Error listing spaces from Supabase:', err);
        }
      }

      // Fallback spaces list from memory
      const memSpaces = Object.keys(multiSpaceStore).map((id) => ({
        id,
        updated_at: new Date(multiSpaceStore[id].lastUpdated).toISOString(),
        tournamentsCount: multiSpaceStore[id].tournaments.length,
        matchesCount: multiSpaceStore[id].matches.length,
        playersCount: multiSpaceStore[id].players.length,
      }));
      return NextResponse.json({ spaces: memSpaces.length > 0 ? memSpaces : [{ id: 'global_state', tournamentsCount: 2 }] });
    }

    // 1. Primary: Pull specific space from Supabase PostgreSQL table
    if (isConfigured) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/sportmaster_sync?id=eq.${encodeURIComponent(spaceId)}&select=*`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            cache: 'no-store',
          }
        );

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0]) {
            const row = rows[0];

            if (Array.isArray(row.tournaments)) {
              const state: SpaceSportState = {
                tournaments: row.tournaments,
                matches: Array.isArray(row.matches) ? row.matches : [],
                players: Array.isArray(row.players) ? row.players : [],
                lastUpdated: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
                dataVersion: ((multiSpaceStore[spaceId]?.dataVersion || 1) + 1),
              };
              multiSpaceStore[spaceId] = state;

              return NextResponse.json({
                spaceId,
                tournaments: state.tournaments,
                matches: state.matches,
                players: state.players,
                lastUpdated: state.lastUpdated,
                dataVersion: state.dataVersion,
                source: 'supabase',
              });
            }
          } else {
            // Space does not exist yet in Supabase. Initialize it for this admin.
            const initial = getInitialStateForSpace(spaceId);
            multiSpaceStore[spaceId] = initial;
            await seedSupabaseSpaceIfNeeded(supabaseUrl, supabaseKey, spaceId, initial);

            return NextResponse.json({
              spaceId,
              tournaments: initial.tournaments,
              matches: initial.matches,
              players: initial.players,
              lastUpdated: initial.lastUpdated,
              dataVersion: initial.dataVersion,
              source: 'supabase_initialized',
            });
          }
        }
      } catch (err) {
        console.warn(`Supabase fetch error for space ${spaceId}, using local fallback:`, err);
      }
    }

    // 2. Fallback: in-memory store
    if (!multiSpaceStore[spaceId]) {
      multiSpaceStore[spaceId] = getInitialStateForSpace(spaceId);
    }
    const current = multiSpaceStore[spaceId];

    return NextResponse.json({
      spaceId,
      tournaments: current.tournaments,
      matches: current.matches,
      players: current.players,
      lastUpdated: current.lastUpdated,
      dataVersion: current.dataVersion,
      source: 'server_memory',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching sync state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      spaceId: rawSpaceId,
      tournaments,
      matches,
      players,
      clientTimestamp,
    } = body;

    const spaceId = (rawSpaceId || 'global_state').trim();
    const now = Date.now();

    if (!multiSpaceStore[spaceId]) {
      multiSpaceStore[spaceId] = getInitialStateForSpace(spaceId);
    }

    const current = multiSpaceStore[spaceId];

    if (Array.isArray(tournaments)) {
      current.tournaments = tournaments;
    }
    if (Array.isArray(matches)) {
      current.matches = matches;
    }
    if (Array.isArray(players)) {
      current.players = players;
    }

    current.lastUpdated = clientTimestamp ? Math.max(clientTimestamp, now) : now;
    current.dataVersion = (current.dataVersion || 1) + 1;

    // Persist to Supabase public.sportmaster_sync table under this specific spaceId
    const { url: supabaseUrl, key: supabaseKey, isConfigured } = getSupabaseConfig();

    if (isConfigured) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/sportmaster_sync`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            id: spaceId,
            updated_at: new Date(current.lastUpdated).toISOString(),
            tournaments: current.tournaments,
            matches: current.matches,
            players: current.players,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn('Supabase upsert warning for space', spaceId, response.status, errText);
        }
      } catch (err) {
        console.warn('Error saving space to Supabase from API route:', err);
      }
    }

    return NextResponse.json({
      success: true,
      spaceId,
      lastUpdated: current.lastUpdated,
      dataVersion: current.dataVersion,
      tournamentsCount: current.tournaments.length,
      matchesCount: current.matches.length,
      playersCount: current.players.length,
    });
  } catch (error: any) {
    console.error('Error in /api/sync POST:', error);
    return NextResponse.json(
      { error: error?.message || 'Error saving space sync state' },
      { status: 500 }
    );
  }
}
