'use client';

import React, { useState, useEffect } from 'react';
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
import { ArchitectureGuideModal } from '@/components/ArchitectureGuideModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { MessageCircle, Facebook, Mail } from 'lucide-react';

export default function Home() {
  // Global App States - Default to public 'spectator' unless saved admin session exists
  const [currentSport, setCurrentSport] = useState<SportType>('futbol');
  const [userRole, setUserRole] = useState<UserRole>('spectator');
  const [adminEmail, setAdminEmail] = useState<string>('admin@aurasport.com');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedTacticalMatchId, setSelectedTacticalMatchId] = useState<string | null>(null);

  // Master Data States
  const [tournaments, setTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [matches, setMatches] = useState<MatchEvent[]>(INITIAL_MATCHES);

  // Modals
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);
  const [recordingMatch, setRecordingMatch] = useState<MatchEvent | null>(null);

  const handleOpenTacticalForMatch = (matchId?: string) => {
    if (matchId) {
      setSelectedTacticalMatchId(matchId);
    }
    setActiveTab('tactical');
  };

  // Local storage persistence & admin session check
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem('sportmaster_players_pool');
      const savedTournaments = localStorage.getItem('sportmaster_tournaments_pool');
      const savedMatches = localStorage.getItem('sportmaster_matches_pool');
      const savedAdminSession = localStorage.getItem('sportmaster_admin_session');

      if (savedPlayers) setPlayers(JSON.parse(savedPlayers));
      if (savedTournaments) setTournaments(JSON.parse(savedTournaments));
      if (savedMatches) setMatches(JSON.parse(savedMatches));

      if (savedAdminSession) {
        const session = JSON.parse(savedAdminSession);
        if (session.email) {
          setAdminEmail(session.email);
          setUserRole('admin');
        }
      }
    } catch (e) {
      console.warn('Could not load from localStorage:', e);
    }
  }, []);

  const handleAdminLoginSuccess = (email: string) => {
    setAdminEmail(email);
    setUserRole('admin');
  };

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('sportmaster_admin_session');
    } catch (e) {
      console.warn('Could not remove admin session', e);
    }
    setUserRole('spectator');
  };

  const saveStateToStorage = (
    newPlayers?: Player[],
    newMatches?: MatchEvent[],
    newTournaments?: Tournament[]
  ) => {
    try {
      if (newPlayers) localStorage.setItem('sportmaster_players_pool', JSON.stringify(newPlayers));
      if (newMatches) localStorage.setItem('sportmaster_matches_pool', JSON.stringify(newMatches));
      if (newTournaments)
        localStorage.setItem('sportmaster_tournaments_pool', JSON.stringify(newTournaments));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
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

    // If football match with scorers
    if (updatedMatch.sport === 'futbol' && updatedMatch.score?.scorers) {
      updatedMatch.score.scorers.forEach((sc) => {
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === sc.playerId
            ? { ...p, stats: { ...p.stats, goals: p.stats.goals + 1 } }
            : p
        );
      });
    }

    // If MVP assigned
    if (updatedMatch.mvpPlayerId) {
      updatedPlayers = updatedPlayers.map((p) =>
        p.id === updatedMatch.mvpPlayerId
          ? { ...p, stats: { ...p.stats, mvpCount: p.stats.mvpCount + 1 } }
          : p
      );
    }

    // Increment matches played and won for participants of this match
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

  const handleAddTournament = (newTournament: Tournament) => {
    const updated = [newTournament, ...tournaments];
    setTournaments(updated);
    saveStateToStorage(undefined, undefined, updated);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <Header
        currentSport={currentSport}
        onSportChange={(s) => setCurrentSport(s)}
        userRole={userRole}
        adminEmail={adminEmail}
        onOpenAdminLogin={() => setIsAdminLoginModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
            onAddTournament={handleAddTournament}
            onSelectTacticalMatch={handleOpenTacticalForMatch}
          />
        )}
      </main>

      {/* Subtle & Discreet Footer */}
      <footer className="border-t border-slate-900/70 bg-slate-950/60 py-3 sm:py-3.5 text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Brand & Creator (Discreet) */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">AuraSport PRO</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-500">
              Desarrollado por <span className="text-slate-400 font-medium">NelCSC</span>
            </span>
            <span className="hidden md:inline text-slate-700">·</span>
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="hidden md:inline text-slate-500 hover:text-slate-400 transition-colors"
            >
              Arquitectura
            </button>
          </div>

          {/* Social / Contact Icons (Compact & Subtle) */}
          <div className="flex items-center gap-2">
            {/* WhatsApp */}
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

            {/* Facebook */}
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

            {/* Gmail */}
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

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Architecture & VS Code Setup Modal */}
      {isArchitectureModalOpen && (
        <ArchitectureGuideModal onClose={() => setIsArchitectureModalOpen(false)} />
      )}
    </div>
  );
}
