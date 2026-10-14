'use client';

import React, { useState } from 'react';
import { Tournament, MatchEvent, Player, SportType, UserRole } from '@/types/sports';
import { calculateStandings, parseMatchLocalDateTime } from '@/lib/sports-helpers';
import {
  Trophy,
  Calendar,
  MapPin,
  Plus,
  Edit3,
  Users,
  Clock,
  Sparkles,
  Check,
  X,
  Shuffle,
  Shield,
  Trash2,
  Layers,
} from 'lucide-react';

interface TournamentManagerProps {
  currentSport: SportType;
  tournaments: Tournament[];
  matches: MatchEvent[];
  players: Player[];
  userRole: UserRole;
  onRecordResult: (match: MatchEvent) => void;
  onAddMatch: (match: MatchEvent) => void;
  onUpdateMatch?: (match: MatchEvent) => void;
  onDeleteMatch?: (matchId: string) => void;
  onAddTournament: (tournament: Tournament) => void;
  onUpdateTournament?: (tournament: Tournament) => void;
  onDeleteTournament?: (tournamentId: string) => void;
  onSelectTacticalMatch?: (matchId: string) => void;
}

let matchIdCounter = 0;
function createNewMatchId(): string {
  matchIdCounter += 1;
  return `match-${Date.now().toString(36)}-${matchIdCounter}`;
}

export const TournamentManager: React.FC<TournamentManagerProps> = ({
  currentSport,
  tournaments,
  matches,
  players,
  userRole,
  onRecordResult,
  onAddMatch,
  onUpdateMatch,
  onDeleteMatch,
  onAddTournament,
  onUpdateTournament,
  onDeleteTournament,
  onSelectTacticalMatch,
}) => {
  const sportTournaments = tournaments.filter((t) => t.sport === currentSport);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');

  const currentTournament =
    sportTournaments.find((t) => t.id === selectedTournamentId) || sportTournaments[0];

  const tournamentMatches = matches
    .filter((m) => m.sport === currentSport && (!currentTournament || m.tournamentId === currentTournament.id))
    .sort((a, b) => parseMatchLocalDateTime(a.dateTime).getTime() - parseMatchLocalDateTime(b.dateTime).getTime());

  // Standings
  const standings = calculateStandings(currentSport, matches, currentTournament?.id);

  // Modals state
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState(false);
  const [isNewTournamentModalOpen, setIsNewTournamentModalOpen] = useState(false);

  // New match form state
  const [eventName, setEventName] = useState('Pichanga Oficial');
  const [homeTeamName, setHomeTeamName] = useState('Equipo Azul');
  const [homeTeamLogo, setHomeTeamLogo] = useState('🛡️');
  const [homeTeamColor, setHomeTeamColor] = useState('#2563eb');
  const [homePlayerIds, setHomePlayerIds] = useState<string[]>([]);

  const [awayTeamName, setAwayTeamName] = useState('Equipo Rojo');
  const [awayTeamLogo, setAwayTeamLogo] = useState('⚡');
  const [awayTeamColor, setAwayTeamColor] = useState('#dc2626');
  const [awayPlayerIds, setAwayPlayerIds] = useState<string[]>([]);

  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const [matchDate, setMatchDate] = useState(getTodayISO());
  const [matchTime, setMatchTime] = useState('19:00');
  const [matchVenue, setMatchVenue] = useState(currentTournament?.location || 'Complejo Deportivo Central');
  const [matchCourt, setMatchCourt] = useState('Cancha 1');

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setMatchDate(d.toISOString().split('T')[0]);
  };

  // New tournament form state
  const [tourName, setTourName] = useState('');
  const [tourCategory, setTourCategory] = useState<'Libre' | 'Master +35' | 'Femenino' | 'Mixto' | 'Juvenil'>('Libre');
  const [tourFormat, setTourFormat] = useState<'Liga' | 'Eliminatoria Directa' | 'Fase de Grupos' | 'Amistoso / Pichanga'>('Liga');
  const [tourStartDate, setTourStartDate] = useState('2026-10-15');
  const [tourLocation, setTourLocation] = useState('Centro Polideportivo');
  const [tourDesc, setTourDesc] = useState('');

  const availableSportPlayers = players.filter((p) => p.sport === currentSport);

  const openScheduleMatchModal = () => {
    setEventName(`Jornada ${tournamentMatches.length + 1} - ${currentSport === 'futbol' ? 'Fútbol 7' : 'Vóley Pro'}`);
    setHomeTeamName(currentSport === 'futbol' ? 'Titanes (Chaleco Azul)' : 'Equipo Morado');
    setHomeTeamLogo(currentSport === 'futbol' ? '🛡️' : '🏐');
    setAwayTeamName(currentSport === 'futbol' ? 'Huracán (Chaleco Rojo)' : 'Equipo Naranja');
    setAwayTeamLogo(currentSport === 'futbol' ? '⚡' : '💥');
    setHomePlayerIds([]);
    setAwayPlayerIds([]);
    setIsNewMatchModalOpen(true);
  };

  // Auto-balance draft algorithm
  const handleAutoBalance = () => {
    const pool = [...availableSportPlayers].sort((a, b) => b.skillRating - a.skillRating);
    const teamA: string[] = [];
    const teamB: string[] = [];

    pool.forEach((player, idx) => {
      if (idx % 2 === 0) {
        teamA.push(player.id);
      } else {
        teamB.push(player.id);
      }
    });

    setHomePlayerIds(teamA);
    setAwayPlayerIds(teamB);
  };

  const togglePlayerAssignment = (playerId: string, targetTeam: 'home' | 'away') => {
    if (targetTeam === 'home') {
      if (homePlayerIds.includes(playerId)) {
        setHomePlayerIds(homePlayerIds.filter((id) => id !== playerId));
      } else {
        setHomePlayerIds([...homePlayerIds, playerId]);
        setAwayPlayerIds(awayPlayerIds.filter((id) => id !== playerId));
      }
    } else {
      if (awayPlayerIds.includes(playerId)) {
        setAwayPlayerIds(awayPlayerIds.filter((id) => id !== playerId));
      } else {
        setAwayPlayerIds([...awayPlayerIds, playerId]);
        setHomePlayerIds(homePlayerIds.filter((id) => id !== playerId));
      }
    }
  };

  const handleCreateMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeamName.trim() || !awayTeamName.trim()) return;

    const newMatch: MatchEvent = {
      id: createNewMatchId(),
      tournamentId: currentTournament?.id || 'tour-general',
      eventName: eventName.trim() || 'Encuentro Programado',
      sport: currentSport,
      homeTeamName: homeTeamName.trim(),
      homeTeamLogo: homeTeamLogo || '🛡️',
      homeTeamColor: homeTeamColor,
      homePlayerIds: homePlayerIds,
      awayTeamName: awayTeamName.trim(),
      awayTeamLogo: awayTeamLogo || '⚡',
      awayTeamColor: awayTeamColor,
      awayPlayerIds: awayPlayerIds,
      dateTime: `${matchDate}T${matchTime}:00.000Z`,
      venue: matchVenue.trim(),
      courtNumber: matchCourt.trim(),
      status: 'scheduled',
    };

    onAddMatch(newMatch);
    setIsNewMatchModalOpen(false);
  };

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourName.trim()) return;

    const newTour: Tournament = {
      id: `tour-${Date.now()}`,
      name: tourName.trim(),
      sport: currentSport,
      category: tourCategory,
      format: tourFormat,
      status: 'active',
      startDate: tourStartDate,
      endDate: '2026-12-20',
      location: tourLocation.trim(),
      description: tourDesc.trim(),
    };

    onAddTournament(newTour);
    setSelectedTournamentId(newTour.id);
    setIsNewTournamentModalOpen(false);
  };

  // --- EDIT & DELETE TOURNAMENT STATE & HANDLERS ---
  const [isEditTourModalOpen, setIsEditTourModalOpen] = useState(false);
  const [editTourId, setEditTourId] = useState('');
  const [editTourName, setEditTourName] = useState('');
  const [editTourCategory, setEditTourCategory] = useState<'Libre' | 'Master +35' | 'Femenino' | 'Mixto' | 'Juvenil'>('Libre');
  const [editTourFormat, setEditTourFormat] = useState<'Liga' | 'Eliminatoria Directa' | 'Fase de Grupos' | 'Amistoso / Pichanga'>('Liga');
  const [editTourStatus, setEditTourStatus] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [editTourStartDate, setEditTourStartDate] = useState('2026-10-15');
  const [editTourEndDate, setEditTourEndDate] = useState('2026-12-20');
  const [editTourLocation, setEditTourLocation] = useState('Centro Polideportivo');
  const [editTourDesc, setEditTourDesc] = useState('');
  const [tourToDelete, setTourToDelete] = useState<Tournament | null>(null);

  const openEditTourModal = (tour: Tournament) => {
    setEditTourId(tour.id);
    setEditTourName(tour.name);
    setEditTourCategory(tour.category);
    setEditTourFormat(tour.format);
    setEditTourStatus(tour.status);
    setEditTourStartDate(tour.startDate || '2026-10-15');
    setEditTourEndDate(tour.endDate || '2026-12-20');
    setEditTourLocation(tour.location || 'Centro Polideportivo');
    setEditTourDesc(tour.description || '');
    setIsEditTourModalOpen(true);
  };

  const handleSaveEditTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTourName.trim()) return;

    const updatedTour: Tournament = {
      id: editTourId,
      name: editTourName.trim(),
      sport: currentSport,
      category: editTourCategory,
      format: editTourFormat,
      status: editTourStatus,
      startDate: editTourStartDate,
      endDate: editTourEndDate,
      location: editTourLocation.trim(),
      description: editTourDesc.trim(),
    };

    if (onUpdateTournament) {
      onUpdateTournament(updatedTour);
    }
    setIsEditTourModalOpen(false);
  };

  const handleConfirmDeleteTournament = () => {
    if (!tourToDelete) return;
    if (onDeleteTournament) {
      onDeleteTournament(tourToDelete.id);
    }
    setTourToDelete(null);
  };

  // --- EDIT & DELETE MATCH STATE & HANDLERS ---
  const [isEditMatchModalOpen, setIsEditMatchModalOpen] = useState(false);
  const [editMatchId, setEditMatchId] = useState('');
  const [editEventName, setEditEventName] = useState('');
  const [editHomeTeamName, setEditHomeTeamName] = useState('');
  const [editHomeTeamLogo, setEditHomeTeamLogo] = useState('🛡️');
  const [editHomeTeamColor, setEditHomeTeamColor] = useState('#2563eb');
  const [editHomePlayerIds, setEditHomePlayerIds] = useState<string[]>([]);
  const [editAwayTeamName, setEditAwayTeamName] = useState('');
  const [editAwayTeamLogo, setEditAwayTeamLogo] = useState('⚡');
  const [editAwayTeamColor, setEditAwayTeamColor] = useState('#dc2626');
  const [editAwayPlayerIds, setEditAwayPlayerIds] = useState<string[]>([]);
  const [editMatchDate, setEditMatchDate] = useState(getTodayISO());
  const [editMatchTime, setEditMatchTime] = useState('19:00');
  const [editMatchVenue, setEditMatchVenue] = useState('');
  const [editMatchCourt, setEditMatchCourt] = useState('Cancha 1');
  const [editMatchStatus, setEditMatchStatus] = useState<MatchEvent['status']>('scheduled');
  const [matchToDelete, setMatchToDelete] = useState<MatchEvent | null>(null);

  const openEditMatchModal = (match: MatchEvent) => {
    setEditMatchId(match.id);
    setEditEventName(match.eventName || 'Encuentro Programado');
    setEditHomeTeamName(match.homeTeamName);
    setEditHomeTeamLogo(match.homeTeamLogo || '🛡️');
    setEditHomeTeamColor(match.homeTeamColor || '#2563eb');
    setEditHomePlayerIds(match.homePlayerIds || []);
    setEditAwayTeamName(match.awayTeamName);
    setEditAwayTeamLogo(match.awayTeamLogo || '⚡');
    setEditAwayTeamColor(match.awayTeamColor || '#dc2626');
    setEditAwayPlayerIds(match.awayPlayerIds || []);

    const mDate = match.dateTime.includes('T') ? match.dateTime.split('T')[0] : getTodayISO();
    const mTime = match.dateTime.includes('T') ? match.dateTime.split('T')[1].substring(0, 5) : '19:00';
    setEditMatchDate(mDate);
    setEditMatchTime(mTime);
    setEditMatchVenue(match.venue || 'Complejo Deportivo Central');
    setEditMatchCourt(match.courtNumber || 'Cancha 1');
    setEditMatchStatus(match.status);
    setIsEditMatchModalOpen(true);
  };

  const handleAutoBalanceEdit = () => {
    const pool = [...availableSportPlayers].sort((a, b) => b.skillRating - a.skillRating);
    const teamA: string[] = [];
    const teamB: string[] = [];
    pool.forEach((player, idx) => {
      if (idx % 2 === 0) teamA.push(player.id);
      else teamB.push(player.id);
    });
    setEditHomePlayerIds(teamA);
    setEditAwayPlayerIds(teamB);
  };

  const togglePlayerAssignmentEdit = (playerId: string, targetTeam: 'home' | 'away') => {
    if (targetTeam === 'home') {
      if (editHomePlayerIds.includes(playerId)) {
        setEditHomePlayerIds(editHomePlayerIds.filter((id) => id !== playerId));
      } else {
        setEditHomePlayerIds([...editHomePlayerIds, playerId]);
        setEditAwayPlayerIds(editAwayPlayerIds.filter((id) => id !== playerId));
      }
    } else {
      if (editAwayPlayerIds.includes(playerId)) {
        setEditAwayPlayerIds(editAwayPlayerIds.filter((id) => id !== playerId));
      } else {
        setEditAwayPlayerIds([...editAwayPlayerIds, playerId]);
        setEditHomePlayerIds(editHomePlayerIds.filter((id) => id !== playerId));
      }
    }
  };

  const handleSaveEditMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = matches.find((m) => m.id === editMatchId);
    if (!existing) return;

    const updatedMatch: MatchEvent = {
      ...existing,
      eventName: editEventName.trim() || 'Encuentro Programado',
      homeTeamName: editHomeTeamName.trim() || 'Equipo A',
      homeTeamLogo: editHomeTeamLogo,
      homeTeamColor: editHomeTeamColor,
      homePlayerIds: editHomePlayerIds,
      awayTeamName: editAwayTeamName.trim() || 'Equipo B',
      awayTeamLogo: editAwayTeamLogo,
      awayTeamColor: editAwayTeamColor,
      awayPlayerIds: editAwayPlayerIds,
      dateTime: `${editMatchDate}T${editMatchTime}:00.000Z`,
      venue: editMatchVenue.trim(),
      courtNumber: editMatchCourt.trim(),
      status: editMatchStatus,
    };

    if (onUpdateMatch) {
      onUpdateMatch(updatedMatch);
    }
    setIsEditMatchModalOpen(false);
  };

  const handleConfirmDeleteMatch = () => {
    if (!matchToDelete) return;
    if (onDeleteMatch) {
      onDeleteMatch(matchToDelete.id);
    }
    setMatchToDelete(null);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Tournaments Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Torneo / Liga:</span>
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {sportTournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {currentTournament && (
              <>
                <button
                  type="button"
                  onClick={() => openEditTourModal(currentTournament)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-amber-500/30 transition-colors shadow-sm"
                  title="Editar nombre, formato, sede o fechas del torneo seleccionado"
                >
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Editar Torneo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTourToDelete(currentTournament)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-lg border border-red-600/30 transition-colors shadow-sm"
                  title="Eliminar este torneo y desvincular sus encuentros"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </>
            )}
            <button
              onClick={openScheduleMatchModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Programar Encuentro</span>
            </button>
            <button
              onClick={() => setIsNewTournamentModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Nuevo Torneo</span>
            </button>
          </div>
        )}
      </div>

      {/* Standings Table Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white">Tabla de Posiciones</h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 font-medium">
            <span>{currentSport === 'futbol' ? 'Fútbol: 3 pts Victoria · 1 pt Empate' : 'Vóley: Sets y Puntos FIVB'}</span>
            <span className="sm:hidden text-emerald-400 font-normal">(Desliza →)</span>
          </div>
        </div>

        <div className="w-full max-w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <table className="w-full min-w-[540px] text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
                <th className="py-3 px-3 sm:px-4">Equipo</th>
                <th className="py-3 px-2 sm:px-3 text-center">PJ</th>
                <th className="py-3 px-2 sm:px-3 text-center">PG</th>
                {currentSport === 'futbol' && <th className="py-3 px-2 sm:px-3 text-center">PE</th>}
                <th className="py-3 px-2 sm:px-3 text-center">PP</th>
                <th className="py-3 px-2 sm:px-3 text-center">
                  {currentSport === 'futbol' ? 'GF' : 'PF'}
                </th>
                <th className="py-3 px-2 sm:px-3 text-center">
                  {currentSport === 'futbol' ? 'GC' : 'PC'}
                </th>
                <th className="py-3 px-2 sm:px-3 text-center">DIF</th>
                <th className="py-3 px-3 sm:px-4 text-center font-bold text-white">PTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {standings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    Aún no hay partidos finalizados con actas registradas para calcular la tabla.
                  </td>
                </tr>
              ) : (
                standings.map((row, idx) => (
                  <tr
                    key={row.teamName}
                    className={`transition-colors hover:bg-slate-800/50 ${
                      idx === 0 ? 'bg-emerald-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                      {idx === 0 && <span className="ml-1 text-amber-400">👑</span>}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-bold text-white flex items-center gap-2">
                      <span className="text-lg">{row.teamLogo}</span>
                      <span className="truncate">{row.teamName}</span>
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-300">
                      {row.played}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-emerald-400">
                      {row.won}
                    </td>
                    {currentSport === 'futbol' && (
                      <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-400">
                        {row.drawn}
                      </td>
                    )}
                    <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-red-400">
                      {row.lost}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-300">
                      {row.pointsFor}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-400">
                      {row.pointsAgainst}
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-center font-mono tabular-nums text-slate-300">
                      {row.difference > 0 ? `+${row.difference}` : row.difference}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center font-mono font-black text-sm sm:text-base text-white tabular-nums">
                      {row.points}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fixtures & Matches Calendar Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Fixture y Calendario de Encuentros</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {tournamentMatches.length} partidos programados
          </span>
        </div>

        <div className="space-y-3">
          {tournamentMatches.map((match) => {
            const isFinished = match.status === 'finished';
            const isLive = match.status === 'live';

            const mDate = new Date(match.dateTime);
            const formattedDate = mDate.toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            });
            let formattedTime = '';
            if (match.dateTime.includes('T')) {
              formattedTime = match.dateTime.split('T')[1]?.substring(0, 5) || '';
            }
            if (!formattedTime) {
              formattedTime = mDate.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });
            }

            const homePlayers = players.filter((p) => match.homePlayerIds?.includes(p.id));
            const awayPlayers = players.filter((p) => match.awayPlayerIds?.includes(p.id));

            return (
              <div
                key={match.id}
                className="group flex flex-col p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition-all shadow-md space-y-3"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                  {/* Date & Location column */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-slate-400 w-full md:w-auto min-w-0">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-center shrink-0">
                      <span className="block font-bold text-white capitalize">{formattedDate}</span>
                      <span className="block font-mono text-[11px] text-emerald-400">{formattedTime}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xs sm:text-sm truncate">{match.eventName || 'Encuentro Programado'}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{match.venue} ({match.courtNumber || 'Cancha 1'})</p>
                    </div>
                  </div>

                  {/* Teams & Score Box */}
                  <div className="flex-1 flex items-center justify-between sm:justify-center gap-2 sm:gap-6 w-full md:w-auto min-w-0">
                    {/* Home Team */}
                    <div className="flex items-center gap-2 justify-end text-right flex-1 min-w-0">
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs sm:text-sm truncate block max-w-[95px] sm:max-w-[150px]">{match.homeTeamName}</span>
                        <span className="text-[10px] text-slate-400">{homePlayers.length} Convocados</span>
                      </div>
                      <span className="text-xl sm:text-2xl shrink-0">{match.homeTeamLogo}</span>
                    </div>

                    {/* Score / VS Display */}
                    <div className="px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center shrink-0 min-w-[56px] sm:min-w-[70px]">
                      {isFinished && match.score ? (
                        match.sport === 'futbol' ? (
                          <div className="font-mono text-xs sm:text-base font-black text-white tabular-nums">
                            {match.score.homeGoals} - {match.score.awayGoals}
                          </div>
                        ) : (
                          <div className="font-mono text-xs sm:text-base font-black text-purple-400 tabular-nums">
                            {match.score.homeSets} - {match.score.awaySets}
                          </div>
                        )
                      ) : isLive ? (
                        <span className="text-[9px] sm:text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                          EN VIVO
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">VS</span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 text-left flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl shrink-0">{match.awayTeamLogo}</span>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs sm:text-sm truncate block max-w-[95px] sm:max-w-[150px]">{match.awayTeamName}</span>
                        <span className="text-[10px] text-slate-400">{awayPlayers.length} Convocados</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-wrap items-center gap-2 justify-end w-full md:w-auto shrink-0">
                    <button
                      onClick={() => onSelectTacticalMatch && onSelectTacticalMatch(match.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white rounded-lg border border-blue-500/40 transition-all shadow-sm"
                      title="Ver pizarra táctica en cancha completa con ambos equipos"
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      <span>Ver Pizarra Táctica</span>
                    </button>

                    {userRole === 'admin' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onRecordResult(match)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                          title="Cargar marcador o modificar goles/sets"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isFinished ? 'Modificar Acta' : 'Cargar Resultado'}</span>
                        </button>
                        <button
                          onClick={() => openEditMatchModal(match)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 rounded-lg border border-amber-600/40 transition-colors"
                          title="Editar detalles del encuentro, fecha, hora, cancha y equipos"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => setMatchToDelete(match)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded-lg border border-red-600/40 transition-colors"
                          title="Eliminar este encuentro deportivo"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Rosters Accordion Preview */}
                <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <p className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <span>{match.homeTeamLogo}</span>
                      <span>Plantilla {match.homeTeamName}:</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {homePlayers.length > 0
                        ? homePlayers.map((p) => `${p.name} (${p.position.split(' ')[0]})`).join(', ')
                        : 'Sin jugadores asignados aún'}
                    </p>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    <p className="font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <span>{match.awayTeamLogo}</span>
                      <span>Plantilla {match.awayTeamName}:</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {awayPlayers.length > 0
                        ? awayPlayers.map((p) => `${p.name} (${p.position.split(' ')[0]})`).join(', ')
                        : 'Sin jugadores asignados aún'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Match / Team Builder Modal */}
      {isNewMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Programar Encuentro y Armar Equipos</h3>
                <p className="text-xs text-slate-400">
                  Asigna nombre a los dos equipos y jala a los participantes de la bolsa general para este partido
                </p>
              </div>
              <button onClick={() => setIsNewMatchModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMatch} className="space-y-5 text-xs sm:text-sm">
              {/* Event Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre / Título del Encuentro *</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Ej. Pichanga de los Miércoles / Gran Final"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Two Teams Configuration Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {/* Team 1 (Home) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Equipo A (Local)</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{homePlayerIds.length} Jugadores</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={homeTeamName}
                      onChange={(e) => setHomeTeamName(e.target.value)}
                      placeholder="Nombre del Equipo A"
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                    <select
                      value={homeTeamLogo}
                      onChange={(e) => setHomeTeamLogo(e.target.value)}
                      className="w-14 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-center text-base"
                    >
                      <option value="🛡️">🛡️</option>
                      <option value="⚡">⚡</option>
                      <option value="🦅">🦅</option>
                      <option value="🟢">🟢</option>
                      <option value="🏐">🏐</option>
                      <option value="💥">💥</option>
                    </select>
                  </div>
                </div>

                {/* Team 2 (Away) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span>Equipo B (Visitante)</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{awayPlayerIds.length} Jugadores</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={awayTeamName}
                      onChange={(e) => setAwayTeamName(e.target.value)}
                      placeholder="Nombre del Equipo B"
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                    <select
                      value={awayTeamLogo}
                      onChange={(e) => setAwayTeamLogo(e.target.value)}
                      className="w-14 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-center text-base"
                    >
                      <option value="⚡">⚡</option>
                      <option value="🛡️">🛡️</option>
                      <option value="💥">💥</option>
                      <option value="💠">💠</option>
                      <option value="🦅">🦅</option>
                      <option value="🟢">🟢</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Pull Participants / Roster Selection */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Convocatoria de Jugadores de {currentSport === 'futbol' ? 'Fútbol' : 'Vóley'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Asigna a cada jugador al <strong>Equipo A</strong>, <strong>Equipo B</strong> o déjalo en reserva
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoBalance}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Balancear Equipos</span>
                  </button>
                </div>

                {/* Players Draft Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {availableSportPlayers.map((player) => {
                    const isHome = homePlayerIds.includes(player.id);
                    const isAway = awayPlayerIds.includes(player.id);

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                          isHome
                            ? 'bg-blue-950/50 border-blue-600/60 text-white'
                            : isAway
                            ? 'bg-red-950/50 border-red-600/60 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-white truncate">{player.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">({player.position.split(' ')[0]})</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePlayerAssignment(player.id, 'home')}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              isHome
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            Eq. A
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePlayerAssignment(player.id, 'away')}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              isAway
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            Eq. B
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date, Time & Venue - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Match Date */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Fecha del Partido *</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setQuickDate(0)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold"
                      >
                        Hoy
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDate(1)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                      >
                        Mañana
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as any).showPicker?.();
                        } catch (_) {}
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="w-full min-h-[44px] h-11 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
                    />
                  </div>
                </div>

                {/* Match Time */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hora del Encuentro *</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {['18:00', '19:00', '20:00', '21:00'].map((timePreset) => (
                        <button
                          key={timePreset}
                          type="button"
                          onClick={() => setMatchTime(timePreset)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            matchTime === timePreset
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {timePreset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="time"
                      required
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      onClick={(e) => {
                        try {
                          (e.currentTarget as any).showPicker?.();
                        } catch (_) {}
                      }}
                      style={{ colorScheme: 'dark' }}
                      className="w-full min-h-[44px] h-11 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 text-xs">Lugar / Cancha *</label>
                  <input
                    type="text"
                    required
                    value={matchVenue}
                    onChange={(e) => setMatchVenue(e.target.value)}
                    placeholder="Complejo Polideportivo Monumental"
                    className="w-full min-h-[42px] bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1 text-xs">Sector / Cancha Específica</label>
                  <input
                    type="text"
                    value={matchCourt}
                    onChange={(e) => setMatchCourt(e.target.value)}
                    placeholder="Cancha 1 (Techada / Césped)"
                    className="w-full min-h-[42px] bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMatchModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg"
                >
                  <Check className="w-4 h-4" />
                  <span>Programar Encuentro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Tournament Modal */}
      {isNewTournamentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Crear Nuevo Torneo o Liga</h3>
              <button onClick={() => setIsNewTournamentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTournament} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre del Torneo *</label>
                <input
                  type="text"
                  required
                  value={tourName}
                  onChange={(e) => setTourName(e.target.value)}
                  placeholder="Copa Clausura 2026"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoría</label>
                  <select
                    value={tourCategory}
                    onChange={(e) => setTourCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  >
                    <option value="Libre">Libre</option>
                    <option value="Master +35">Master +35</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Mixto">Mixto</option>
                    <option value="Juvenil">Juvenil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Formato</label>
                  <select
                    value={tourFormat}
                    onChange={(e) => setTourFormat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  >
                    <option value="Liga">Liga Regular</option>
                    <option value="Amistoso / Pichanga">Pichangas / Amistosos</option>
                    <option value="Fase de Grupos">Fase de Grupos</option>
                    <option value="Eliminatoria Directa">Eliminatoria Directa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Sede Principal</label>
                <input
                  type="text"
                  value={tourLocation}
                  onChange={(e) => setTourLocation(e.target.value)}
                  placeholder="Complejo Deportivo Central"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTournamentModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                >
                  Crear Torneo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT TOURNAMENT MODAL --- */}
      {isEditTourModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Editar Torneo / Liga</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditTourModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTournament} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre del Torneo *</label>
                <input
                  type="text"
                  required
                  value={editTourName}
                  onChange={(e) => setEditTourName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Categoría</label>
                  <select
                    value={editTourCategory}
                    onChange={(e) => setEditTourCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs"
                  >
                    <option value="Libre">Libre</option>
                    <option value="Master +35">Master +35</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Mixto">Mixto</option>
                    <option value="Juvenil">Juvenil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Formato</label>
                  <select
                    value={editTourFormat}
                    onChange={(e) => setEditTourFormat(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs"
                  >
                    <option value="Liga">Liga Regular</option>
                    <option value="Amistoso / Pichanga">Pichangas / Amistosos</option>
                    <option value="Fase de Grupos">Fase de Grupos</option>
                    <option value="Eliminatoria Directa">Eliminatoria Directa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estado</label>
                  <select
                    value={editTourStatus}
                    onChange={(e) => setEditTourStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs"
                  >
                    <option value="active">En Curso (Activo)</option>
                    <option value="upcoming">Próximo a Iniciar</option>
                    <option value="completed">Finalizado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Sede / Ubicación</label>
                  <input
                    type="text"
                    value={editTourLocation}
                    onChange={(e) => setEditTourLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={editTourStartDate}
                    onChange={(e) => setEditTourStartDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={editTourEndDate}
                    onChange={(e) => setEditTourEndDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Descripción / Reglas</label>
                <textarea
                  rows={2}
                  value={editTourDesc}
                  onChange={(e) => setEditTourDesc(e.target.value)}
                  placeholder="Detalles de premiación, cupos, etc."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditTourModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE TOURNAMENT CONFIRMATION MODAL --- */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Eliminar Torneo / Liga?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Estás a punto de eliminar el torneo <strong className="text-white">&quot;{tourToDelete.name}&quot;</strong> ({tourToDelete.category}). Sus partidos asociados dejarán de estar asignados a él.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTourToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTournament}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg transition-all"
              >
                Sí, Eliminar Torneo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MATCH MODAL --- */}
      {isEditMatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Editar Encuentro Deportivo</h3>
                  <p className="text-xs text-slate-400">Modifica los equipos, fecha, hora, cancha y convocatoria</p>
                </div>
              </div>
              <button onClick={() => setIsEditMatchModalOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMatch} className="space-y-5 text-xs sm:text-sm">
              {/* Event Name & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Nombre / Título del Encuentro *</label>
                  <input
                    type="text"
                    required
                    value={editEventName}
                    onChange={(e) => setEditEventName(e.target.value)}
                    placeholder="Ej. Jornada 2 - Clásico"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Estado</label>
                  <select
                    value={editMatchStatus}
                    onChange={(e) => setEditMatchStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 text-xs"
                  >
                    <option value="scheduled">Programado</option>
                    <option value="live">En Vivo (Jugándose)</option>
                    <option value="finished">Finalizado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Two Teams Configuration Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {/* Team 1 (Home) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Equipo A (Local)</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{editHomePlayerIds.length} Jugadores</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editHomeTeamName}
                      onChange={(e) => setEditHomeTeamName(e.target.value)}
                      placeholder="Nombre del Equipo A"
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                    <select
                      value={editHomeTeamLogo}
                      onChange={(e) => setEditHomeTeamLogo(e.target.value)}
                      className="w-14 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-center text-base"
                    >
                      <option value="🛡️">🛡️</option>
                      <option value="⚡">⚡</option>
                      <option value="🦅">🦅</option>
                      <option value="🟢">🟢</option>
                      <option value="🏐">🏐</option>
                      <option value="💥">💥</option>
                    </select>
                  </div>
                </div>

                {/* Team 2 (Away) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span>Equipo B (Visitante)</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{editAwayPlayerIds.length} Jugadores</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editAwayTeamName}
                      onChange={(e) => setEditAwayTeamName(e.target.value)}
                      placeholder="Nombre del Equipo B"
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-xs"
                    />
                    <select
                      value={editAwayTeamLogo}
                      onChange={(e) => setEditAwayTeamLogo(e.target.value)}
                      className="w-14 bg-slate-900 border border-slate-700 text-white rounded-lg p-2 text-center text-base"
                    >
                      <option value="⚡">⚡</option>
                      <option value="🛡️">🛡️</option>
                      <option value="💥">💥</option>
                      <option value="💠">💠</option>
                      <option value="🦅">🦅</option>
                      <option value="🟢">🟢</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Roster Selection & Auto-Balance */}
              <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Convocatoria de Jugadores ({currentSport === 'futbol' ? 'Fútbol' : 'Vóley'})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Reasigna a cada jugador entre el <strong>Equipo A</strong> y el <strong>Equipo B</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoBalanceEdit}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Balancear Equipos</span>
                  </button>
                </div>

                {/* Players Draft Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {availableSportPlayers.map((player) => {
                    const isHome = editHomePlayerIds.includes(player.id);
                    const isAway = editAwayPlayerIds.includes(player.id);

                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                          isHome
                            ? 'bg-blue-950/50 border-blue-600/60 text-white'
                            : isAway
                            ? 'bg-red-950/50 border-red-600/60 text-white'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-white truncate">{player.name}</span>
                          <span className="text-[10px] text-slate-400 truncate">({player.position.split(' ')[0]})</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => togglePlayerAssignmentEdit(player.id, 'home')}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              isHome
                                ? 'bg-blue-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            Eq. A
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePlayerAssignmentEdit(player.id, 'away')}
                            className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                              isAway
                                ? 'bg-red-600 text-white shadow'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                          >
                            Eq. B
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date, Time & Venue */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Match Date */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Fecha del Partido *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={editMatchDate}
                    onChange={(e) => setEditMatchDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as any).showPicker?.();
                      } catch (_) {}
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full min-h-[44px] h-11 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
                  />
                </div>

                {/* Match Time */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hora del Encuentro *</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {['18:00', '19:00', '20:00', '21:00'].map((timePreset) => (
                        <button
                          key={timePreset}
                          type="button"
                          onClick={() => setEditMatchTime(timePreset)}
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                            editMatchTime === timePreset
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {timePreset}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="time"
                    required
                    value={editMatchTime}
                    onChange={(e) => setEditMatchTime(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as any).showPicker?.();
                      } catch (_) {}
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full min-h-[44px] h-11 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-inner"
                  />
                </div>
              </div>

              {/* Venue & Court */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold text-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sede / Lugar</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editMatchVenue}
                    onChange={(e) => setEditMatchVenue(e.target.value)}
                    className="w-full min-h-[44px] h-11 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold text-xs">Cancha / Campo</label>
                  <input
                    type="text"
                    required
                    value={editMatchCourt}
                    onChange={(e) => setEditMatchCourt(e.target.value)}
                    className="w-full min-h-[44px] h-11 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-inner"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditMatchModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-xl shadow-lg transition-all"
                >
                  Guardar Cambios del Encuentro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE MATCH CONFIRMATION MODAL --- */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Eliminar Encuentro Deportivo?</h3>
                <p className="text-xs text-slate-400">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              Estás a punto de eliminar el partido <strong className="text-white">&quot;{matchToDelete.eventName || 'Encuentro'}&quot;</strong> entre <span className="text-blue-400 font-bold">{matchToDelete.homeTeamName}</span> y <span className="text-red-400 font-bold">{matchToDelete.awayTeamName}</span>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteMatch}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg transition-all"
              >
                Sí, Eliminar Encuentro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
