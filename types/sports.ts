export type SportType = 'futbol' | 'voley';

export type UserRole = 'admin' | 'spectator';

export type FootballPosition = 
  | 'Arquero (POR)'
  | 'Defensa Central (DFC)'
  | 'Lateral Derecho (LD)'
  | 'Lateral Izquierdo (LI)'
  | 'Mediocampista Defensivo (MCD)'
  | 'Volante Mixto (MC)'
  | 'Mediocampista Ofensivo (MCO)'
  | 'Extremo Derecho (ED)'
  | 'Extremo Izquierdo (EI)'
  | 'Delantero Centro (DC)';

export type VolleyballPosition = 
  | 'Armador / Colocador (S)'
  | 'Opuesto (OP)'
  | 'Punta Receptor / Atacante (OH)'
  | 'Central / Bloqueador (MB)'
  | 'Líbero (L)'
  | 'Universal (U)';

export type PlayerPosition = FootballPosition | VolleyballPosition;

export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  // Fútbol stats
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  // Vóley stats
  aces: number;
  blocks: number;
  effectiveAttacks: number;
  // General
  mvpCount: number;
  ratingAverage: number;
}

export interface Player {
  id: string;
  name: string;
  phone: string;
  sport: SportType;
  position: PlayerPosition;
  photoUrl: string;
  skillRating: number; // 1 to 5 stars
  jerseyNumber?: number;
  isAvailable?: boolean; // Disponible para ser convocado
  createdAt: string;
  stats: PlayerStats;
}

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  category: 'Libre' | 'Master +35' | 'Femenino' | 'Mixto' | 'Juvenil';
  format: 'Liga' | 'Eliminatoria Directa' | 'Fase de Grupos' | 'Amistoso / Pichanga';
  status: 'active' | 'upcoming' | 'completed';
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface TacticalSlot {
  id: string;
  label: string; // e.g. "DC", "DFC", "Z1", "Z3"
  roleName: string; // Full position name
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  playerId?: string;
}

export interface TacticalFormation {
  id: string;
  sport: SportType;
  name: string;
  system: string; // e.g., "4-3-3", "4-4-2", "3-2-1" for soccer; "5-1", "4-2" for volleyball
  slots: TacticalSlot[];
}

export interface MatchScoreDetail {
  // Fútbol
  homeGoals?: number;
  awayGoals?: number;
  scorers?: Array<{ playerId: string; teamSide: 'home' | 'away'; minute: number }>;
  cards?: Array<{ playerId: string; type: 'yellow' | 'red'; minute: number }>;
  
  // Vóley
  homeSets?: number;
  awaySets?: number;
  sets?: Array<{ setNumber: number; homePoints: number; awayPoints: number }>;
  aces?: Array<{ playerId: string; teamSide: 'home' | 'away' }>;
  blocks?: Array<{ playerId: string; teamSide: 'home' | 'away' }>;
}

export interface MatchEvent {
  id: string;
  tournamentId?: string;
  eventName?: string; // e.g. "Pichanga Fecha 4", "Clásico de Verano", "Gran Final"
  sport: SportType;
  
  // Dynamic Teams created/assigned for this specific event
  homeTeamName: string;
  homeTeamLogo: string; // Emoji / Shield
  homeTeamColor: string;
  homePlayerIds: string[]; // Players pulled for this team
  
  awayTeamName: string;
  awayTeamLogo: string;
  awayTeamColor: string;
  awayPlayerIds: string[]; // Players pulled for this team
  
  dateTime: string; // ISO string
  venue: string;
  venueMapQuery?: string;
  courtNumber?: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled';
  
  // Formation and tactical slots on the pitch for each team
  homeFormationId?: string;
  homeTacticalSlots?: TacticalSlot[];
  awayFormationId?: string;
  awayTacticalSlots?: TacticalSlot[];
  
  score?: MatchScoreDetail;
  mvpPlayerId?: string;
  tacticalNotes?: string;
}

export interface StandingRow {
  teamName: string;
  teamLogo: string;
  played: number;
  won: number;
  drawn: number; // For soccer
  lost: number;
  pointsFor: number; // Goals or Set Points For
  pointsAgainst: number; // Goals or Set Points Against
  difference: number;
  points: number;
}
