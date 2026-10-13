import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_TOURNAMENTS, INITIAL_PLAYERS, INITIAL_MATCHES } from '@/lib/initialData';
import { Tournament, MatchEvent, Player } from '@/types/sports';

// In-memory global store on the Next.js server (shared across all devices visiting the deployment)
interface GlobalSportState {
  tournaments: Tournament[];
  matches: MatchEvent[];
  players: Player[];
  lastUpdated: number;
}

// Global variable in Node.js server environment so it persists across requests on the server instance
const globalState: GlobalSportState = (global as any).__sportmaster_state || {
  tournaments: INITIAL_TOURNAMENTS,
  matches: INITIAL_MATCHES,
  players: INITIAL_PLAYERS,
  lastUpdated: Date.now(),
};

(global as any).__sportmaster_state = globalState;

export async function GET() {
  try {
    // If Supabase is configured via env, optionally attempt to pull from Supabase table if it exists
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/sportmaster_sync?id=eq.global_state&select=*`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: 'no-store',
        });

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0 && rows[0].tournaments) {
            const row = rows[0];
            return NextResponse.json({
              tournaments: row.tournaments || globalState.tournaments,
              matches: row.matches || globalState.matches,
              players: row.players || globalState.players,
              lastUpdated: new Date(row.updated_at || Date.now()).getTime(),
              source: 'supabase',
            });
          }
        }
      } catch (err) {
        console.warn('Supabase fetch fallback to server in-memory store:', err);
      }
    }

    return NextResponse.json({
      tournaments: globalState.tournaments,
      matches: globalState.matches,
      players: globalState.players,
      lastUpdated: globalState.lastUpdated,
      source: 'server_memory',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching global sync state' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournaments, matches, players, clientTimestamp } = body;

    const now = Date.now();

    if (Array.isArray(tournaments)) {
      globalState.tournaments = tournaments;
    }
    if (Array.isArray(matches)) {
      globalState.matches = matches;
    }
    if (Array.isArray(players)) {
      globalState.players = players;
    }

    globalState.lastUpdated = clientTimestamp ? Math.max(clientTimestamp, now) : now;

    // If Supabase is configured, also persist to Supabase public.sportmaster_sync table
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/sportmaster_sync`, {
          method: 'POST',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            id: 'global_state',
            updated_at: new Date().toISOString(),
            tournaments: globalState.tournaments,
            matches: globalState.matches,
            players: globalState.players,
          }),
        });
      } catch (err) {
        console.warn('Error saving to Supabase table from API route:', err);
      }
    }

    return NextResponse.json({
      success: true,
      lastUpdated: globalState.lastUpdated,
      tournamentsCount: globalState.tournaments.length,
      matchesCount: globalState.matches.length,
      playersCount: globalState.players.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error saving global sync state' },
      { status: 500 }
    );
  }
}
