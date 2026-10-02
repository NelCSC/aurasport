'use client';

import React from 'react';
import { Player, Tournament, MatchEvent, SportType, UserRole } from '@/types/sports';
import { NextEventBanner } from './NextEventBanner';
import { Users, Trophy, Flame, Activity, Star, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface DashboardOverviewProps {
  currentSport: SportType;
  players: Player[];
  tournaments: Tournament[];
  matches: MatchEvent[];
  userRole: UserRole;
  onRecordResult: (match: MatchEvent) => void;
  onNavigateTab: (tab: string) => void;
  onSelectTacticalMatch?: (matchId?: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentSport,
  players,
  tournaments,
  matches,
  userRole,
  onRecordResult,
  onNavigateTab,
  onSelectTacticalMatch,
}) => {
  const sportPlayers = players.filter((p) => p.sport === currentSport);
  const sportTournaments = tournaments.filter((t) => t.sport === currentSport);
  const sportMatches = matches.filter((m) => m.sport === currentSport);
  const finishedMatches = sportMatches.filter((m) => m.status === 'finished');

  const totalScoring = sportPlayers.reduce((acc, p) => {
    return acc + (currentSport === 'futbol' ? p.stats.goals : p.stats.aces);
  }, 0);

  const topScorers = [...sportPlayers]
    .sort((a, b) =>
      currentSport === 'futbol'
        ? b.stats.goals - a.stats.goals
        : b.stats.aces - a.stats.aces
    )
    .slice(0, 5);

  const topMvps = [...sportPlayers]
    .sort((a, b) => b.stats.mvpCount - a.stats.mvpCount)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero: Next Event Banner */}
      <NextEventBanner
        currentSport={currentSport}
        matches={matches}
        tournaments={tournaments}
        userRole={userRole}
        onRecordResult={onRecordResult}
        onGoToTactical={(matchId) => {
          if (onSelectTacticalMatch) {
            onSelectTacticalMatch(matchId);
          } else {
            onNavigateTab('tactical');
          }
        }}
      />

      {/* KPI Metric Counters Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jugadores Disponibles */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Bolsa de Jugadores</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums mt-1">
              {sportPlayers.length}
            </p>
            <p className="text-[11px] text-emerald-400 mt-1 font-medium">Disponibles para convocar</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Torneos & Ligas */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Torneos / Ligas</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums mt-1">
              {sportTournaments.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{currentSport === 'futbol' ? 'Fútbol 7 & 11' : 'Vóley Mixto'}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        {/* Partidos Disputados */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">Partidos Jugados</p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-white tabular-nums mt-1">
              {finishedMatches.length} <span className="text-xs font-normal text-slate-500">/ {sportMatches.length}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Historial con actas al día</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Goles o Aces Totales */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {currentSport === 'futbol' ? 'Goles Marcados' : 'Aces & Puntos Clave'}
            </p>
            <p className="font-mono text-2xl sm:text-3xl font-bold text-emerald-400 tabular-nums mt-1">
              {totalScoring}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Rendimiento acumulado</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Performers & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Top Performers */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-white">
                {currentSport === 'futbol' ? 'Máximos Goleadores del Padrón' : 'Líderes en Saque As & Ataques Efectivos'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('players')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topScorers.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between py-3 hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-500 w-5 text-center">
                    {idx + 1}
                  </span>
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-700 shrink-0">
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                        {player.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{player.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {player.position} · {player.stats.matchesPlayed} PJ · {player.stats.matchesWon} PG
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-mono text-base font-black text-emerald-400 tabular-nums">
                      {currentSport === 'futbol' ? player.stats.goals : player.stats.aces}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase">
                      {currentSport === 'futbol' ? 'Goles' : 'Aces'}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                      {player.stats.mvpCount}
                    </span>
                    <span className="block text-[10px] text-slate-400 uppercase">MVP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Pizarra Táctica por Encuentro</span>
            </div>
            <p className="text-xs text-slate-300">
              Visualiza y ajusta la alineación táctica de los equipos asignados a cada partido en la cancha virtual.
            </p>
            <button
              onClick={() => onNavigateTab('tactical')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow"
            >
              <span>Abrir Pizarra Táctica</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* MVP Spotlight */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>Top Jugadores MVP</span>
            </div>
            <div className="space-y-2">
              {topMvps.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-amber-400">#{i + 1}</span>
                    <span className="text-white font-medium truncate">{p.name}</span>
                  </div>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {p.stats.mvpCount} 🏆
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
