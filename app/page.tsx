'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SportType, UserRole, Player, Tournament, MatchEvent, TacticalSlot } from '@/types/sports';
import {
  INITIAL_TOURNAMENTS,
  INITIAL_PLAYERS,
  INITIAL_MATCHES,
} from '@/lib/initialData';
import { Header } from '@/components/Header';
import { DashboardOverview } from '@/components/DashboardOverview';
import { TacticalBoard } from '@/components/TacticalBoard';
import { PlayerRosterManager } from '@/components/PlayerRosterManager';
import { TournamentManager } from '@/components/TournamentManager';
import { MatchResultRecorderModal } from '@/components/MatchResultRecorderModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { SpaceSelectorModal } from '@/components/SpaceSelectorModal';
import {
  fetchGlobalCloudState,
  pushGlobalCloudState,
  subscribeToRealtimeSync,
  SyncStatus,
  AppSyncData,
} from '@/lib/syncManager';
import { getSpaceIdFromEmail } from '@/lib/spaceManager';
import { MessageCircle, Facebook, Mail } from 'lucide-react';

export default function Home() {
  // Global App States - Default to public 'spectator' (Consistent across SSR & Client)
  const [currentSport, setCurrentSport] = useState<SportType>('futbol');
  const [userRole, setUserRole] = useState<UserRole>('spectator');
  const [adminEmail, setAdminEmail] = useState<string>('admin@aurasport.com');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTacticalMatchId, setSelectedTacticalMatchId] = useState<string | null>(null);

  // Multi-Admin Space Isolation - Default to 'global_state'
  const [activeSpaceId, setActiveSpaceId] = useState<string>('global_state');
  const activeSpaceIdRef = useRef<string>('global_state');
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);

  // Multi-Device Cloud Real-time Sync States
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<number>(0);
  const lastSyncTimestampRef = useRef<number>(0);

  // Helper to detect if a player array contains the central demo mock dataset
  const isDemoMockPlayers = (playersList?: Player[]): boolean => {
    if (!Array.isArray(playersList) || playersList.length === 0) return false;
    return playersList.some((p) => p.id === 'p-fut-1' || p.id === 'p-vol-1');
  };

  // Master Data States - Consistent initial server and client render
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);

  // Synchronized refs to avoid stale closures during multi-device synchronization
  const tournamentsRef = useRef(tournaments);
  const matchesRef = useRef(matches);
  const playersRef = useRef(players);
  const dataVersionRef = useRef(1);

  useEffect(() => {
    tournamentsRef.current = tournaments;
    matchesRef.current = matches;
    playersRef.current = players;
  }, [tournaments, matches, players]);

  useEffect(() => {
    activeSpaceIdRef.current = activeSpaceId;
  }, [activeSpaceId]);

  // Modals
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [recordingMatch, setRecordingMatch] = useState<MatchEvent | null>(null);

  const handleOpenTacticalForMatch = (matchId?: string) => {
    if (matchId) {
      setSelectedTacticalMatchId(matchId);
    }
    setActiveTab('tactical');
  };

  /**
   * Load data for a specific space from Cloud (Supabase) and local cache
   */
  const loadSpaceData = useCallback(async (targetSpaceId: string) => {
    setSyncStatus('syncing');

    // 1. Try local cache for this space first
    try {
      const cached = localStorage.getItem(`sportmaster_cache_${targetSpaceId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.tournaments)) setTournaments(parsed.tournaments);
        if (Array.isArray(parsed.matches)) setMatches(parsed.matches);
        if (Array.isArray(parsed.players)) {
          // If this is a custom admin space, purge mock demo players if present
          if (targetSpaceId !== 'global_state' && isDemoMockPlayers(parsed.players)) {
            setPlayers([]);
          } else {
            setPlayers(parsed.players);
          }
        }
      } else {
        if (targetSpaceId !== 'global_state') {
          setPlayers([]);
          setMatches([]);
        }
      }
    } catch (e) {
      console.warn('Error reading local cache for space', targetSpaceId, e);
    }

    // 2. Fetch fresh data from Supabase /api/sync
    try {
      const cloudData = await fetchGlobalCloudState(targetSpaceId);
      if (cloudData) {
        if (Array.isArray(cloudData.tournaments)) {
          setTournaments(cloudData.tournaments);
        }
        if (Array.isArray(cloudData.matches)) {
          setMatches(cloudData.matches);
        }
        if (Array.isArray(cloudData.players)) {
          const sanitizedPlayers =
            targetSpaceId !== 'global_state' && isDemoMockPlayers(cloudData.players)
              ? []
              : cloudData.players;
          setPlayers(sanitizedPlayers);
        }
        if (cloudData.dataVersion) {
          dataVersionRef.current = cloudData.dataVersion;
        }
        if (cloudData.lastUpdated) {
          lastSyncTimestampRef.current = cloudData.lastUpdated;
          setLastSyncTimestamp(cloudData.lastUpdated);
        }

        // Cache locally for instant loading
        try {
          localStorage.setItem(
            `sportmaster_cache_${targetSpaceId}`,
            JSON.stringify({
              tournaments: cloudData.tournaments,
              matches: cloudData.matches,
              players:
                targetSpaceId !== 'global_state' && isDemoMockPlayers(cloudData.players)
                  ? []
                  : cloudData.players,
              lastUpdated: cloudData.lastUpdated,
            })
          );
        } catch (e) {
          console.warn('Could not cache space in localStorage', e);
        }

        setSyncStatus('synced');
      } else {
        setSyncStatus('synced');
      }
    } catch (err) {
      console.warn(`Error loading space ${targetSpaceId}:`, err);
      setSyncStatus('idle');
    }
  }, []);

  /**
   * Handle space change (e.g. from SpaceSelector or URL param)
   */
  const handleSelectSpace = (newSpaceId: string) => {
    const clean = newSpaceId.trim() || 'global_state';
    setActiveSpaceId(clean);
    activeSpaceIdRef.current = clean;

    // Update URL query string without reloading page
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (clean === 'global_state') {
        url.searchParams.delete('space');
        url.searchParams.delete('admin');
      } else {
        url.searchParams.set('space', clean);
      }
      window.history.replaceState({}, '', url.toString());
      try {
        localStorage.setItem('sportmaster_active_space', clean);
      } catch (e) {
        console.warn('Could not store active space', e);
      }
    }

    loadSpaceData(clean);
  };

  // 1. Initial Mount: restore client session & query params safely post-hydration
  useEffect(() => {
    let isSubscribed = true;
    let unsubscribeRealtime: (() => void) | null = null;

    // Use a zero-delay timer so this executes strictly after hydration completes
    const initTimer = setTimeout(() => {
      if (!isSubscribed) return;

      let targetSpace = 'global_state';
      let detectedRole: UserRole = 'spectator';
      let detectedEmail = 'admin@aurasport.com';

      // Check URL parameters for direct follower links (?space=... or ?admin=...)
      const params = new URLSearchParams(window.location.search);
      const urlSpace = params.get('space');
      const urlAdmin = params.get('admin');

      if (urlSpace) {
        targetSpace = urlSpace.trim();
      } else if (urlAdmin) {
        targetSpace = getSpaceIdFromEmail(urlAdmin);
      } else {
        try {
          const savedSpace = localStorage.getItem('sportmaster_active_space');
          if (savedSpace) targetSpace = savedSpace;
        } catch (e) {
          console.warn('Error reading saved space', e);
        }
      }

      // Check saved admin session
      try {
        const savedSession = localStorage.getItem('sportmaster_admin_session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          if (session.email) {
            detectedEmail = session.email;
            detectedRole = 'admin';
            if (!urlSpace && !urlAdmin) {
              targetSpace = getSpaceIdFromEmail(session.email);
            }
          }
        }
      } catch (e) {
        console.warn('Could not load saved admin session', e);
      }

      setAdminEmail(detectedEmail);
      setUserRole(detectedRole);
      setActiveSpaceId(targetSpace);
      activeSpaceIdRef.current = targetSpace;

      loadSpaceData(targetSpace);

      // Subscribe to cross-device real-time updates for active space
      unsubscribeRealtime = subscribeToRealtimeSync(
        (updatedData: AppSyncData) => {
          setSyncStatus('syncing');
          if (Array.isArray(updatedData.tournaments)) {
            setTournaments(updatedData.tournaments);
          }
          if (Array.isArray(updatedData.matches)) {
            setMatches(updatedData.matches);
          }
          if (Array.isArray(updatedData.players)) {
            const sanitized =
              activeSpaceIdRef.current !== 'global_state' && isDemoMockPlayers(updatedData.players)
                ? []
                : updatedData.players;
            setPlayers(sanitized);
          }
          if (updatedData.dataVersion) {
            dataVersionRef.current = updatedData.dataVersion;
          }
          if (updatedData.lastUpdated) {
            lastSyncTimestampRef.current = updatedData.lastUpdated;
            setLastSyncTimestamp(updatedData.lastUpdated);
          }
          setSyncStatus('synced');
        },
        () => ({
          lastTimestamp: lastSyncTimestampRef.current,
          tournamentsCount: tournamentsRef.current.length,
          matchesCount: matchesRef.current.length,
          playersCount: playersRef.current.length,
          dataVersion: dataVersionRef.current,
        }),
        () => activeSpaceIdRef.current
      );
    }, 0);

    return () => {
      isSubscribed = false;
      clearTimeout(initTimer);
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, [loadSpaceData]);

  // Admin Authentication handlers
  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setUserRole('admin');

    // Switch to this admin's dedicated, persistent space
    const adminSpace = getSpaceIdFromEmail(email);
    handleSelectSpace(adminSpace);
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('sportmaster_admin_session');
    } catch (e) {
      console.warn('Could not remove admin session', e);
    }
    setUserRole('spectator');
  };

  /**
   * Save state locally and push to Cloud under the active space
   */
  const saveStateToStorage = (
    newPlayers?: Player[],
    newMatches?: MatchEvent[],
    newTournaments?: Tournament[]
  ) => {
    const finalPlayers = newPlayers || playersRef.current;
    const finalMatches = newMatches || matchesRef.current;
    const finalTournaments = newTournaments || tournamentsRef.current;
    const spaceId = activeSpaceIdRef.current;

    try {
      localStorage.setItem(
        `sportmaster_cache_${spaceId}`,
        JSON.stringify({
          tournaments: finalTournaments,
          matches: finalMatches,
          players: finalPlayers,
          lastUpdated: Date.now(),
        })
      );
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    // Push updates to Supabase scoped to this admin space
    setSyncStatus('syncing');
    const now = Date.now();
    lastSyncTimestampRef.current = now;
    dataVersionRef.current += 1;
    setLastSyncTimestamp(now);

    pushGlobalCloudState(
      {
        players: finalPlayers,
        matches: finalMatches,
        tournaments: finalTournaments,
      },
      spaceId
    ).then((ok) => {
      setSyncStatus(ok ? 'synced' : 'idle');
    });
  };

  // Player Handlers
  const handleAddPlayer = (newPlayer: Player) => {
    const updated = [newPlayer, ...players];
    setPlayers(updated);
    saveStateToStorage(updated);
  };

  const handleUpdatePlayer = (updatedPlayer: Player) => {
    const updated = players.map((p) => (p.id === updatedPlayer.id ? updatedPlayer : p));
    setPlayers(updated);
    saveStateToStorage(updated);
  };

  const handleDeletePlayer = (playerId: string) => {
    const updated = players.filter((p) => p.id !== playerId);
    setPlayers(updated);
    saveStateToStorage(updated);
  };

  // Match / Result Handlers
  const handleSaveMatchResult = (updatedMatch: MatchEvent) => {
    const updatedMatches = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    setMatches(updatedMatches);

    // Update player performance statistics automatically
    let updatedPlayers = [...players];

    if (updatedMatch.sport === 'futbol' && updatedMatch.score?.scorers) {
      updatedMatch.score.scorers.forEach((sc) => {
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === sc.playerId
            ? { ...p, stats: { ...p.stats, goals: p.stats.goals + 1 } }
            : p
        );
      });
    }

    if (updatedMatch.mvpPlayerId) {
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === updatedMatch.mvpPlayerId
          ? { ...p, stats: { ...p.stats, mvpCount: p.stats.mvpCount + 1 } }
          : p
      );
    }

    if (updatedMatch.status === 'finished') {
      const homeWon =
        updatedMatch.sport === 'futbol'
          ? (updatedMatch.score?.homeGoals ?? 0) > (updatedMatch.score?.awayGoals ?? 0)
          : (updatedMatch.score?.homeSets ?? 0) > (updatedMatch.score?.awaySets ?? 0);

      const awayWon =
        updatedMatch.sport === 'futbol'
          ? (updatedMatch.score?.awayGoals ?? 0) > (updatedMatch.score?.homeGoals ?? 0)
          : (updatedMatch.score?.awaySets ?? 0) > (updatedMatch.score?.homeSets ?? 0);

      const homePIds = updatedMatch.homePlayerIds || [];
      const awayPIds = updatedMatch.awayPlayerIds || [];

      updatedPlayers = updatedPlayers.map((p) => {
        if (homePIds.includes(p.id)) {
          return {
            ...p,
            stats: {
              ...p.stats,
              matchesPlayed: p.stats.matchesPlayed + 1,
              matchesWon: homeWon ? p.stats.matchesWon + 1 : p.stats.matchesWon,
            },
          };
        }
        if (awayPIds.includes(p.id)) {
          return {
            ...p,
            stats: {
              ...p.stats,
              matchesPlayed: p.stats.matchesPlayed + 1,
              matchesWon: awayWon ? p.stats.matchesWon + 1 : p.stats.matchesWon,
            },
          };
        }
        return p;
      });
    }

    setPlayers(updatedPlayers);
    saveStateToStorage(updatedPlayers, updatedMatches);
  };

  const handleAddMatch = (newMatch: MatchEvent) => {
    const updated = [newMatch, ...matches];
    setMatches(updated);
    saveStateToStorage(undefined, updated);
  };

  const handleUpdateMatch = (updatedMatch: MatchEvent) => {
    const updated = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    setMatches(updated);
    saveStateToStorage(undefined, updated);
  };

  const handleDeleteMatch = (matchId: string) => {
    const updated = matches.filter((m) => m.id !== matchId);
    setMatches(updated);
    saveStateToStorage(undefined, updated);
  };

  const handleAddTournament = (newTournament: Tournament) => {
    const updated = [newTournament, ...tournaments];
    setTournaments(updated);
    saveStateToStorage(undefined, undefined, updated);
  };

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    const updated = tournaments.map((t) => (t.id === updatedTournament.id ? updatedTournament : t));
    setTournaments(updated);
    saveStateToStorage(undefined, undefined, updated);
  };

  const handleDeleteTournament = (tournamentId: string) => {
    const updatedTournaments = tournaments.filter((t) => t.id !== tournamentId);
    const updatedMatches = matches.map((m) =>
      m.tournamentId === tournamentId ? { ...m, tournamentId: undefined } : m
    );
    setTournaments(updatedTournaments);
    setMatches(updatedMatches);
    saveStateToStorage(undefined, updatedMatches, updatedTournaments);
  };

  const handleSaveMatchSlots = (
    matchId: string,
    teamSide: 'home' | 'away',
    slots: TacticalSlot[],
    formationId: string
  ) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        if (teamSide === 'home') {
          return { ...m, homeTacticalSlots: slots, homeFormationId: formationId };
        } else {
          return { ...m, awayTacticalSlots: slots, awayFormationId: formationId };
        }
      }
      return m;
    });
    setMatches(updated);
    saveStateToStorage(undefined, updated);
  };

  const handleUpdateMatchRoster = (
    matchId: string,
    teamSide: 'home' | 'away',
    playerIds: string[]
  ) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        if (teamSide === 'home') {
          return { ...m, homePlayerIds: playerIds };
        } else {
          return { ...m, awayPlayerIds: playerIds };
        }
      }
      return m;
    });
    setMatches(updated);
    saveStateToStorage(undefined, updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans w-full max-w-full overflow-x-clip">
      {/* Top Bar (Responsive, Anti-Overlap, Space Switcher) */}
      <Header
        currentSport={currentSport}
        onSportChange={(s) => setCurrentSport(s)}
        userRole={userRole}
        adminEmail={adminEmail}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        activeSpaceId={activeSpaceId}
        onOpenSpaceSelector={() => setIsSpaceModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-clip">
        {/* Render Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            currentSport={currentSport}
            players={players}
            tournaments={tournaments}
            matches={matches}
            userRole={userRole}
            onRecordResult={(m) => setRecordingMatch(m)}
            onNavigateTab={(t) => setActiveTab(t)}
            onSelectTacticalMatch={handleOpenTacticalForMatch}
          />
        )}

        {activeTab === 'tactical' && (
          <TacticalBoard
            currentSport={currentSport}
            matches={matches}
            players={players}
            userRole={userRole}
            initialMatchId={selectedTacticalMatchId}
            onSaveMatchSlots={handleSaveMatchSlots}
            onUpdateMatchRoster={handleUpdateMatchRoster}
          />
        )}

        {activeTab === 'players' && (
          <PlayerRosterManager
            currentSport={currentSport}
            players={players}
            userRole={userRole}
            onAddPlayer={handleAddPlayer}
            onUpdatePlayer={handleUpdatePlayer}
            onDeletePlayer={handleDeletePlayer}
          />
        )}

        {activeTab === 'tournaments' && (
          <TournamentManager
            currentSport={currentSport}
            tournaments={tournaments}
            matches={matches}
            players={players}
            userRole={userRole}
            onRecordResult={(m) => setRecordingMatch(m)}
            onAddMatch={handleAddMatch}
            onUpdateMatch={handleUpdateMatch}
            onDeleteMatch={handleDeleteMatch}
            onAddTournament={handleAddTournament}
            onUpdateTournament={handleUpdateTournament}
            onDeleteTournament={handleDeleteTournament}
            onSelectTacticalMatch={handleOpenTacticalForMatch}
          />
        )}
      </main>

      {/* Subtle & Discreet Footer */}
      <footer className="border-t border-slate-900/70 bg-slate-950/60 py-3 sm:py-3.5 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">AuraSport PRO</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500">
              Desarrollado por <span className="text-slate-400 font-medium">NelCSC</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/51983999322?text=Hola%20NelCSC,%20te%20escribo%20desde%20AuraSport"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-md bg-slate-900/70 hover:bg-emerald-950/80 border border-slate-800 hover:border-emerald-700/60 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors"
              title="WhatsApp: NelCSC"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.facebook.com/share/1GwB2uf6EX/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-md bg-slate-900/70 hover:bg-blue-950/80 border border-slate-800 hover:border-blue-700/60 flex items-center justify-center text-slate-400 hover:text-blue-400 transition-colors"
              title="Facebook: NelCSC"
              aria-label="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>

            <a
              href="mailto:nelzoncsc@gmail.com"
              className="w-7 h-7 rounded-md bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              title="nelzoncsc@gmail.com"
              aria-label="Gmail"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Match Result Recording Modal */}
      {recordingMatch && (
        <MatchResultRecorderModal
          match={recordingMatch}
          players={players}
          onClose={() => setRecordingMatch(null)}
          onSaveResult={handleSaveMatchResult}
        />
      )}

      {/* Admin Login Modal (Strict Supabase Auth) */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Space Selector & Follower Sharing Modal */}
      <SpaceSelectorModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        activeSpaceId={activeSpaceId}
        onSelectSpace={handleSelectSpace}
        userRole={userRole}
        adminEmail={adminEmail}
      />
    </div>
  );
}
