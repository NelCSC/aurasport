import { MatchEvent, StandingRow, SportType, PlayerPosition } from '@/types/sports';

/**
 * Parses a date-time string as local browser time (ignoring UTC Z offsets)
 * so that "2026-10-02T17:00" means 5:00 PM in the user's local timezone.
 */
export function parseMatchLocalDateTime(dateTimeStr: string): Date {
  if (!dateTimeStr) return new Date();

  const clean = dateTimeStr.replace('Z', '');
  const [datePart, timePart] = clean.split('T');

  if (datePart) {
    const [year, month, day] = datePart.split('-').map(Number);
    let hours = 0;
    let minutes = 0;

    if (timePart) {
      const parts = timePart.split(':').map(Number);
      hours = parts[0] || 0;
      minutes = parts[1] || 0;
    }

    return new Date(year, month - 1, day, hours, minutes, 0);
  }

  return new Date(dateTimeStr);
}

export function calculateStandings(
  sport: SportType,
  matches: MatchEvent[],
  tournamentId?: string
): StandingRow[] {
  const filteredMatches = matches.filter(
    (m) =>
      m.sport === sport &&
      m.status === 'finished' &&
      m.score &&
      (!tournamentId || m.tournamentId === tournamentId)
  );

  const statsMap = new Map<string, StandingRow>();

  const getOrCreateRow = (name: string, logo: string): StandingRow => {
    if (!statsMap.has(name)) {
      statsMap.set(name, {
        teamName: name,
        teamLogo: logo || '🛡️',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        difference: 0,
        points: 0,
      });
    }
    return statsMap.get(name)!;
  };

  filteredMatches.forEach((match) => {
    if (!match.score) return;

    const home = getOrCreateRow(match.homeTeamName, match.homeTeamLogo);
    const away = getOrCreateRow(match.awayTeamName, match.awayTeamLogo);

    if (sport === 'futbol') {
      const hGoals = match.score.homeGoals ?? 0;
      const aGoals = match.score.awayGoals ?? 0;

      home.played += 1;
      away.played += 1;
      home.pointsFor += hGoals;
      home.pointsAgainst += aGoals;
      away.pointsFor += aGoals;
      away.pointsAgainst += hGoals;

      if (hGoals > aGoals) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (hGoals < aGoals) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }
    } else {
      // Vóley: sets
      const hSets = match.score.homeSets ?? 0;
      const aSets = match.score.awaySets ?? 0;

      let hTotalPts = 0;
      let aTotalPts = 0;
      if (match.score.sets && match.score.sets.length > 0) {
        match.score.sets.forEach((s) => {
          hTotalPts += s.homePoints;
          aTotalPts += s.awayPoints;
        });
      } else {
        hTotalPts = hSets * 25;
        aTotalPts = aSets * 23;
      }

      home.played += 1;
      away.played += 1;
      home.pointsFor += hTotalPts;
      home.pointsAgainst += aTotalPts;
      away.pointsFor += aTotalPts;
      away.pointsAgainst += hTotalPts;

      if (hSets > aSets) {
        home.won += 1;
        away.lost += 1;
        if (hSets === 3 && aSets === 2) {
          home.points += 2;
          away.points += 1;
        } else {
          home.points += 3;
          away.points += 0;
        }
      } else {
        away.won += 1;
        home.lost += 1;
        if (aSets === 3 && hSets === 2) {
          away.points += 2;
          home.points += 1;
        } else {
          away.points += 3;
          home.points += 0;
        }
      }
    }
  });

  const standings = Array.from(statsMap.values()).map((row) => ({
    ...row,
    difference: row.pointsFor - row.pointsAgainst,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.difference !== a.difference) return b.difference - a.difference;
    return b.pointsFor - a.pointsFor;
  });

  return standings;
}

export function formatWhatsAppLink(phone: string, playerName: string, sport: SportType): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const sportName = sport === 'futbol' ? 'Fútbol' : 'Vóley';
  const text = encodeURIComponent(
    `¡Hola ${playerName}! Te escribo para convocarte al próximo encuentro deportivo de ${sportName}. ¿Confirmas tu asistencia?`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export const FOOTBALL_POSITIONS: PlayerPosition[] = [
  'Arquero (POR)',
  'Defensa Central (DFC)',
  'Lateral Derecho (LD)',
  'Lateral Izquierdo (LI)',
  'Mediocampista Defensivo (MCD)',
  'Volante Mixto (MC)',
  'Mediocampista Ofensivo (MCO)',
  'Extremo Derecho (ED)',
  'Extremo Izquierdo (EI)',
  'Delantero Centro (DC)',
];

export const VOLLEYBALL_POSITIONS: PlayerPosition[] = [
  'Armador / Colocador (S)',
  'Opuesto (OP)',
  'Punta Receptor / Atacante (OH)',
  'Central / Bloqueador (MB)',
  'Líbero (L)',
  'Universal (U)',
];
