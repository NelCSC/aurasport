'use client';

import React, { useState } from 'react';
import { MatchEvent, Player } from '@/types/sports';
import { X, Check, Trophy, Plus, Trash2, Shield } from 'lucide-react';

interface MatchResultRecorderModalProps {
  match: MatchEvent;
  players: Player[];
  onClose: () => void;
  onSaveResult: (updatedMatch: MatchEvent) => void;
}

export const MatchResultRecorderModal: React.FC<MatchResultRecorderModalProps> = ({
  match,
  players,
  onClose,
  onSaveResult,
}) => {
  const homePlayers = players.filter((p) => match.homePlayerIds?.includes(p.id));
  const awayPlayers = players.filter((p) => match.awayPlayerIds?.includes(p.id));
  const allMatchPlayers = [...homePlayers, ...awayPlayers];

  // Football score state
  const [homeGoals, setHomeGoals] = useState<number>(match.score?.homeGoals ?? 0);
  const [awayGoals, setAwayGoals] = useState<number>(match.score?.awayGoals ?? 0);
  const [scorers, setScorers] = useState<
    Array<{ playerId: string; teamSide: 'home' | 'away'; minute: number }>
  >(match.score?.scorers || []);
  const [cards, setCards] = useState<
    Array<{ playerId: string; type: 'yellow' | 'red'; minute: number }>
  >(match.score?.cards || []);

  // Volleyball score state
  const [sets, setSets] = useState<
    Array<{ setNumber: number; homePoints: number; awayPoints: number }>
  >(
    match.score?.sets && match.score.sets.length > 0
      ? match.score.sets
      : [
          { setNumber: 1, homePoints: 25, awayPoints: 20 },
          { setNumber: 2, homePoints: 25, awayPoints: 22 },
          { setNumber: 3, homePoints: 25, awayPoints: 18 },
        ]
  );
  const [homeSets, setHomeSets] = useState<number>(match.score?.homeSets ?? 3);
  const [awaySets, setAwaySets] = useState<number>(match.score?.awaySets ?? 0);

  // General match details
  const [mvpPlayerId, setMvpPlayerId] = useState<string>(match.mvpPlayerId || '');
  const [tacticalNotes, setTacticalNotes] = useState<string>(match.tacticalNotes || '');
  const [status, setStatus] = useState<'scheduled' | 'live' | 'finished' | 'cancelled'>(
    match.status || 'finished'
  );

  const handleAddScorer = () => {
    if (allMatchPlayers.length === 0) return;
    const defaultPlayer = homePlayers[0] || awayPlayers[0];
    const teamSide = homePlayers.some((p) => p.id === defaultPlayer.id) ? 'home' : 'away';
    setScorers((prev) => [
      ...prev,
      { playerId: defaultPlayer.id, teamSide, minute: 15 },
    ]);
  };

  const handleRemoveScorer = (idx: number) => {
    setScorers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateSet = (index: number, field: 'homePoints' | 'awayPoints', val: number) => {
    const nextSets = [...sets];
    nextSets[index][field] = val;
    setSets(nextSets);

    let hCount = 0;
    let aCount = 0;
    nextSets.forEach((s) => {
      if (s.homePoints > s.awayPoints) hCount++;
      else if (s.awayPoints > s.homePoints) aCount++;
    });
    setHomeSets(hCount);
    setAwaySets(aCount);
  };

  const handleAddSet = () => {
    setSets((prev) => [
      ...prev,
      { setNumber: prev.length + 1, homePoints: 25, awayPoints: 20 },
    ]);
  };

  const handleRemoveSet = (idx: number) => {
    setSets((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedMatch: MatchEvent = {
      ...match,
      status: status,
      mvpPlayerId: mvpPlayerId || undefined,
      tacticalNotes: tacticalNotes.trim() || undefined,
      score:
        match.sport === 'futbol'
          ? {
              homeGoals: Number(homeGoals),
              awayGoals: Number(awayGoals),
              scorers,
              cards,
            }
          : {
              homeSets: Number(homeSets),
              awaySets: Number(awaySets),
              sets,
            },
    };

    onSaveResult(updatedMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Acta Oficial de Encuentro</h3>
              <p className="text-xs text-slate-400">
                {match.eventName || 'Partido'} · {match.sport === 'futbol' ? 'Fútbol' : 'Vóley'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          {/* Status selector */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-300 font-medium">Estado del Encuentro:</span>
            <div className="flex items-center gap-2">
              {(['scheduled', 'live', 'finished'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                    status === st
                      ? st === 'finished'
                        ? 'bg-emerald-600 text-white shadow'
                        : st === 'live'
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'finished' ? 'Finalizado' : st === 'live' ? 'En Vivo' : 'Programado'}
                </button>
              ))}
            </div>
          </div>

          {/* Teams Header Score Input */}
          <div className="grid grid-cols-5 items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-center">
            {/* Home Team */}
            <div className="col-span-2 flex flex-col items-center">
              <span className="text-3xl mb-1">{match.homeTeamLogo}</span>
              <p className="font-bold text-white text-sm sm:text-base">{match.homeTeamName}</p>
              <span className="text-[10px] text-slate-400">{homePlayers.length} Jugadores</span>
            </div>

            {/* Score Center Box */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              {match.sport === 'futbol' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={homeGoals}
                    onChange={(e) => setHomeGoals(Number(e.target.value))}
                    className="w-12 h-12 text-center bg-slate-900 border border-slate-700 text-white font-mono text-xl font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-500 font-black text-lg">:</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={awayGoals}
                    onChange={(e) => setAwayGoals(Number(e.target.value))}
                    className="w-12 h-12 text-center bg-slate-900 border border-slate-700 text-white font-mono text-xl font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-purple-500/50 text-purple-300 font-mono text-xl font-black rounded-lg">
                    {homeSets}
                  </span>
                  <span className="text-slate-500 font-bold">:</span>
                  <span className="w-10 h-10 flex items-center justify-center bg-slate-900 border border-purple-500/50 text-purple-300 font-mono text-xl font-black rounded-lg">
                    {awaySets}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                {match.sport === 'futbol' ? 'Goles Totales' : 'Sets Ganados'}
              </span>
            </div>

            {/* Away Team */}
            <div className="col-span-2 flex flex-col items-center">
              <span className="text-3xl mb-1">{match.awayTeamLogo}</span>
              <p className="font-bold text-white text-sm sm:text-base">{match.awayTeamName}</p>
              <span className="text-[10px] text-slate-400">{awayPlayers.length} Jugadores</span>
            </div>
          </div>

          {/* Volleyball Sets Breakdown */}
          {match.sport === 'voley' && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Desglose de Puntos por Set (FIVB)</span>
                <button
                  type="button"
                  onClick={handleAddSet}
                  className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Set</span>
                </button>
              </div>

              <div className="space-y-2">
                {sets.map((set, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                  >
                    <span className="font-bold text-slate-300">Set #{set.setNumber}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">{match.homeTeamName}:</span>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={set.homePoints}
                          onChange={(e) => handleUpdateSet(idx, 'homePoints', Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white rounded p-1"
                        />
                      </div>
                      <span className="text-slate-600">-</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">{match.awayTeamName}:</span>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={set.awayPoints}
                          onChange={(e) => handleUpdateSet(idx, 'awayPoints', Number(e.target.value))}
                          className="w-12 bg-slate-950 border border-slate-700 text-center font-mono font-bold text-white rounded p-1"
                        />
                      </div>
                    </div>
                    {sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSet(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Football Scorers List */}
          {match.sport === 'futbol' && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Goleadores del Encuentro</span>
                <button
                  type="button"
                  onClick={handleAddScorer}
                  className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Gol</span>
                </button>
              </div>

              {scorers.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No se han registrado goles aún.</p>
              ) : (
                <div className="space-y-2">
                  {scorers.map((scorer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <span className="text-slate-400">⚽</span>
                      <select
                        value={scorer.playerId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          const side = homePlayers.some((p) => p.id === pId) ? 'home' : 'away';
                          const next = [...scorers];
                          next[idx].playerId = pId;
                          next[idx].teamSide = side;
                          setScorers(next);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-700 text-white rounded p-1 text-xs"
                      >
                        {allMatchPlayers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {homePlayers.some((hp) => hp.id === p.id) ? match.homeTeamName : match.awayTeamName}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400">Min:</span>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={scorer.minute}
                          onChange={(e) => {
                            const next = [...scorers];
                            next[idx].minute = Number(e.target.value);
                            setScorers(next);
                          }}
                          className="w-12 bg-slate-950 border border-slate-700 text-center font-mono text-white rounded p-1 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveScorer(idx)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MVP Selection */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Jugador Más Valioso (MVP del Partido)</span>
            </label>
            <select
              value={mvpPlayerId}
              onChange={(e) => setMvpPlayerId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 text-xs sm:text-sm focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">Seleccionar Jugador Destacado (Opcional)</option>
              {allMatchPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  ⭐ {p.name} ({p.position}) · {homePlayers.some((hp) => hp.id === p.id) ? match.homeTeamName : match.awayTeamName}
                </option>
              ))}
            </select>
          </div>

          {/* Tactical Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Observaciones / Resumen</label>
            <textarea
              rows={2}
              value={tacticalNotes}
              onChange={(e) => setTacticalNotes(e.target.value)}
              placeholder="Resumen del juego, tarjetas, incidencias o notas arbitrales..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs sm:text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Acta de Partido</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
