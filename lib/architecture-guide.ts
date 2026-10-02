export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- AURASPORT PRO - DDL DATABASE SCHEMA FOR SUPABASE (PostgreSQL 15+)
-- Arquitectura de Bolsa General de Jugadores y Creación Dinámica de Equipos por Partido
-- Autor: NelCSC (nelzoncsc@gmail.com)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS DEPORTIVOS
CREATE TYPE sport_type AS ENUM ('futbol', 'voley');
CREATE TYPE match_status AS ENUM ('scheduled', 'live', 'finished', 'cancelled');
CREATE TYPE tournament_status AS ENUM ('active', 'upcoming', 'completed');
CREATE TYPE user_role AS ENUM ('admin', 'spectator', 'referee', 'coach');

-- 3. TABLA DE PERFILES DE USUARIO
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'spectator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE TORNEOS / EVENTOS
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    sport sport_type NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Libre', 'Master +35', 'Mixto'
    format TEXT NOT NULL,   -- e.g. 'Liga', 'Eliminatoria', 'Pichangas'
    status tournament_status DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE,
    location TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA MAESTRA DE JUGADORES / PARTICIPANTES (Bolsa General Libre)
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    sport sport_type NOT NULL,
    position TEXT NOT NULL,   -- Especialidad Fútbol o Vóley
    photo_url TEXT,           -- URL alojada en Cloudinary
    skill_rating INT DEFAULT 5 CHECK (skill_rating BETWEEN 1 AND 5),
    jersey_number INT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA DE ENCUENTROS CON EQUIPOS DINÁMICOS Y CONVOCATORIAS
CREATE TABLE match_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
    event_name TEXT NOT NULL, -- e.g. 'Pichanga Fecha 4', 'Clásico de Verano'
    sport sport_type NOT NULL,
    
    -- Equipo A (Local) asignado para este partido
    home_team_name TEXT NOT NULL,
    home_team_logo TEXT DEFAULT '🛡️',
    home_team_color TEXT DEFAULT '#2563eb',
    home_player_ids UUID[] DEFAULT '{}', -- Array de IDs de jugadores convocados
    
    -- Equipo B (Visitante) asignado para este partido
    away_team_name TEXT NOT NULL,
    away_team_logo TEXT DEFAULT '⚡',
    away_team_color TEXT DEFAULT '#dc2626',
    away_player_ids UUID[] DEFAULT '{}', -- Array de IDs de jugadores convocados
    
    match_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    venue TEXT NOT NULL,
    court_number TEXT,
    status match_status DEFAULT 'scheduled',
    
    -- Resultado y Puntuación
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    score_details JSONB DEFAULT '{}'::jsonb, -- Sets parciales, goleadores, minutos
    mvp_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    tactical_notes TEXT,
    
    -- Pizarras Tácticas asignadas
    home_tactical_slots JSONB DEFAULT '[]'::jsonb,
    away_tactical_slots JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABLA DE ESTADÍSTICAS POR JUGADOR EN PARTIDO
CREATE TABLE match_player_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES match_events(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    team_side TEXT NOT NULL CHECK (team_side IN ('home', 'away')),
    sport sport_type NOT NULL,
    -- Fútbol
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    -- Vóley
    aces INT DEFAULT 0,
    blocks INT DEFAULT 0,
    effective_attacks INT DEFAULT 0,
    is_mvp BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. POLÍTICAS DE SEGURIDAD RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_player_stats ENABLE ROW LEVEL SECURITY;

-- Lectura Pública para Espectadores
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read match_events" ON match_events FOR SELECT USING (true);
CREATE POLICY "Public read stats" ON match_player_stats FOR SELECT USING (true);

-- Modificación exclusiva para Administradores
CREATE POLICY "Admin manage tournaments" ON tournaments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin manage players" ON players FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
CREATE POLICY "Admin manage match_events" ON match_events FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
`;

export const CLEAN_ARCHITECTURE_VSCODE_STRUCTURE = `
sportmaster-pro/
├── src/
│   ├── core/                        # 🧠 CAPA DE DOMINIO Y ENTIDADES
│   │   ├── entities/                # Player (Pool), MatchEvent (Dynamic Teams), Tournament
│   │   ├── use-cases/               # RegisterParticipant, DraftMatchTeams, AutoBalanceRoster, SaveLineup
│   │   └── repositories/            # IPlayerRepository, IMatchEventRepository (Interfaces)
│   │
│   ├── infrastructure/              # 🔌 CAPA DE INFRAESTRUCTURA (I/O)
│   │   ├── database/
│   │   │   ├── supabaseClient.ts    # Cliente Supabase Auth & PostgreSQL
│   │   │   └── SupabaseRepositories # Implementaciones de consultas y mutaciones
│   │   └── storage/
│   │       └── cloudinaryService.ts # Subida y transformación facial de fotos (Cloudinary)
│   │
│   ├── presentation/                # 🎨 CAPA DE PRESENTACIÓN (UI / Next.js)
│   │   ├── components/
│   │   │   ├── tactical/            # SoccerPitch, VolleyballCourt, TacticalSlot, PlayerChip
│   │   │   ├── roster/              # PlayerRosterManager, WhatsAppLink, SkillRating
│   │   │   ├── matches/             # MatchSchedulerModal, TeamBuilderDraft, MatchResultRecorder
│   │   │   └── dashboard/           # NextEventBanner, StandingsTable, MetricCounter
│   │   └── hooks/                   # useTacticalPitch, useMatchDraft, useCountdown
│   │
│   └── app/                         # Rutas de Next.js App Router
│       ├── layout.tsx
│       ├── page.tsx
│       ├── api/
│       │   └── upload/route.ts      # Proxy seguro para Cloudinary
│       └── globals.css
│
├── .env.local                       # Variables de Supabase y Cloudinary
├── package.json
└── tsconfig.json
`;

export const CLOUDINARY_SETUP_GUIDE = `
// 1. Instalar dependencias:
// npm install cloudinary @supabase/supabase-js

// 2. Configurar variables de entorno (.env.local):
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="mi-club-deportivo"
CLOUDINARY_API_KEY="1234567890"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"

// 3. API Route en Next.js (app/api/upload/route.ts)
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'sportmaster/players', transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }] },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json(uploadResult);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`;
