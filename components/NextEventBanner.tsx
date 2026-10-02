'use client';

import React, { useState, useEffect } from 'react';
import { MatchEvent, Tournament, SportType, UserRole } from '@/types/sports';
import { parseMatchLocalDateTime } from '@/lib/sports-helpers';
import { Calendar, Clock, MapPin, ExternalLink, Edit3, Flame, ArrowRight } from 'lucide-react';

interface NextEventBannerProps {
  currentSport: SportType;
  matches: MatchEvent[];
  tournaments: Tournament[];
  userRole: UserRole;
  onRecordResult: (match: MatchEvent) => void;
  onGoToTactical: (matchId?: string) => void;
}

export const NextEventBanner: React.FC<NextEventBannerProps> = ({
  currentSport,
  matches,
  tournaments,
  userRole,
  onRecordResult,
  onGoToTactical,
}) => {
  // Sort upcoming matches by true local timestamp
  const upcomingMatches = matches
    .filter((m) => m.sport === currentSport && (m.status === 'scheduled' || m.status === 'live'))
    .sort((a, b) => parseMatchLocalDateTime(a.dateTime).getTime() - parseMatchLocalDateTime(b.dateTime).getTime());

  const nextMatch = upcomingMatches[0];
  const tournament = tournaments.find((t) => t.id === nextMatch?.tournamentId);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    if (!nextMatch) return;

    const updateCountdown = () => {
      const targetDate = parseMatchLocalDateTime(nextMatch.dateTime);
      const targetTime = targetDate.getTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextMatch?.dateTime, nextMatch]);

  if (!nextMatch) {
    return (
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 text-center">
        <p className="text-sm text-slate-400">
          No hay partidos programados próximamente para {currentSport === 'futbol' ? 'Fútbol' : 'Vóley'}.
        </p>
      </div>
    );
  }

  // Format date and clean time reliably
  const localMatchDate = parseMatchLocalDateTime(nextMatch.dateTime);
  const formattedDate = localMatchDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Extract time from raw string if present or format reliably
  let rawTime = '';
  if (nextMatch.dateTime.includes('T')) {
    const timePart = nextMatch.dateTime.replace('Z', '').split('T')[1]?.substring(0, 5);
    if (timePart) {
      const [hStr, mStr] = timePart.split(':');
      const h = parseInt(hStr, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      rawTime = `${timePart} hrs (${h12}:${mStr} ${ampm})`;
    }
  }

  if (!rawTime) {
    const h = localMatchDate.getHours();
    const m = String(localMatchDate.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    rawTime = `${String(h).padStart(2, '0')}:${m} hrs (${h12}:${m} ${ampm})`;
  }

  const mapQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    nextMatch.venue + ' ' + (nextMatch.courtNumber || '')
  )}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-5 sm:p-7 shadow-xl">
      <div
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${
          currentSport === 'futbol' ? 'bg-emerald-500' : 'bg-purple-500'
        }`}
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left column: Event & Teams */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              EVENTO MÁS PRÓXIMO
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-300 font-medium">{nextMatch.eventName || tournament?.name || 'Encuentro Programado'}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="capitalize">{currentSport === 'futbol' ? 'Fútbol' : 'Vóley'}</span>
          </div>

          {/* Teams Faceoff Header */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {/* Team 1 */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/70 px-3.5 py-2 rounded-xl">
              <span className="text-2xl sm:text-3xl">{nextMatch.homeTeamLogo}</span>
              <div>
                <p className="text-sm sm:text-base font-bold text-white leading-tight">{nextMatch.homeTeamName}</p>
                <p className="text-[11px] text-blue-400 font-medium">{nextMatch.homePlayerIds?.length || 0} Convocados</p>
              </div>
            </div>

            <div className="text-slate-500 font-black text-sm tracking-widest px-1">VS</div>

            {/* Team 2 */}
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/70 px-3.5 py-2 rounded-xl">
              <span className="text-2xl sm:text-3xl">{nextMatch.awayTeamLogo}</span>
              <div>
                <p className="text-sm sm:text-base font-bold text-white leading-tight">{nextMatch.awayTeamName}</p>
                <p className="text-[11px] text-red-400 font-medium">{nextMatch.awayPlayerIds?.length || 0} Convocados</p>
              </div>
            </div>
          </div>

          {/* Venue & Explicit Time Details */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="capitalize font-medium">{formattedDate}</span>
            </div>

            {/* Prominent Match Hour */}
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg text-emerald-300 font-bold font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{rawTime}</span>
            </div>

            <a
              href={mapQueryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
              title="Abrir ubicación en Google Maps"
            >
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="truncate max-w-xs">{nextMatch.venue} ({nextMatch.courtNumber || 'Cancha 1'})</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Right column: Live Countdown Box & Direct Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0 w-full sm:w-auto">
          {/* Countdown Clock Display */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 sm:p-4 text-center w-full sm:w-auto shadow-inner">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
              {timeLeft.isPast ? 'En Progreso / Inicia Ahora' : 'Tiempo Restante'}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 min-w-[52px]">
                <span className="font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 uppercase">Días</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 min-w-[52px]">
                <span className="font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 uppercase">Hrs</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 min-w-[52px]">
                <span className="font-mono text-lg sm:text-xl font-bold text-white tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 uppercase">Min</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 rounded-lg px-2.5 py-1.5 min-w-[52px]">
                <span className={`font-mono text-lg sm:text-xl font-bold tabular-nums ${currentSport === 'futbol' ? 'text-emerald-400' : 'text-purple-400'}`}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="block text-[9px] text-slate-400 uppercase">Seg</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onGoToTactical(nextMatch.id)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 transition-colors"
            >
              <span>Ver Pizarra Táctica</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => onRecordResult(nextMatch)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Registrar Resultado</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
