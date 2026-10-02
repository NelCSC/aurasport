'use client';

import React, { useState, useEffect } from 'react';
import { Player, MatchEvent, SportType, UserRole, TacticalSlot } from '@/types/sports';
import { DEFAULT_TACTICAL_FORMATIONS } from '@/lib/initialData';
import {
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  Info,
  X,
  Plus,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Layers,
  UserPlus,
  UserMinus,
  Eye,
  Search,
} from 'lucide-react';

interface TacticalBoardProps {
  currentSport: SportType;
  matches: MatchEvent[];
  players: Player[];
  userRole: UserRole;
  initialMatchId?: string | null;
  onSaveMatchSlots?: (
    matchId: string,
    teamSide: 'home' | 'away',
    slots: TacticalSlot[],
    formationId: string
  ) => void;
  onUpdateMatchRoster?: (
    matchId: string,
    teamSide: 'home' | 'away',
    playerIds: string[]
  ) => void;
}

// Generate slots for Full Pitch Head-to-Head display
function generateFullFieldSlots(
  sport: SportType,
  teamSide: 'home' | 'away',
  formationId: string,
  assignedPlayerIds: (string | undefined)[]
): TacticalSlot[] {
  if (sport === 'futbol') {
    if (formationId.includes('6-131')) {
      if (teamSide === 'home') {
        return [
          { id: 'h-por', label: 'POR', roleName: 'Arquero', x: 50, y: 92, playerId: assignedPlayerIds[0] },
          { id: 'h-dfc', label: 'DFC', roleName: 'Líbero', x: 50, y: 80, playerId: assignedPlayerIds[1] },
          { id: 'h-li', label: 'LI', roleName: 'Carrilero Izq', x: 20, y: 68, playerId: assignedPlayerIds[2] },
          { id: 'h-mc', label: 'MCD', roleName: 'Eje Tapón', x: 50, y: 68, playerId: assignedPlayerIds[3] },
          { id: 'h-ld', label: 'LD', roleName: 'Carrilero Der', x: 80, y: 68, playerId: assignedPlayerIds[4] },
          { id: 'h-dc', label: 'DC', roleName: 'Delantero', x: 50, y: 57, playerId: assignedPlayerIds[5] },
        ];
      } else {
        return [
          { id: 'a-por', label: 'POR', roleName: 'Arquero', x: 50, y: 8, playerId: assignedPlayerIds[0] },
          { id: 'a-dfc', label: 'DFC', roleName: 'Líbero', x: 50, y: 20, playerId: assignedPlayerIds[1] },
          { id: 'a-li', label: 'LI', roleName: 'Carrilero Der', x: 80, y: 32, playerId: assignedPlayerIds[2] },
          { id: 'a-mc', label: 'MCD', roleName: 'Eje Tapón', x: 50, y: 32, playerId: assignedPlayerIds[3] },
          { id: 'a-ld', label: 'LD', roleName: 'Carrilero Izq', x: 20, y: 32, playerId: assignedPlayerIds[4] },
          { id: 'a-dc', label: 'DC', roleName: 'Delantero', x: 50, y: 43, playerId: assignedPlayerIds[5] },
        ];
      }
    } else if (formationId.includes('6-212')) {
      if (teamSide === 'home') {
        return [
          { id: 'h-por', label: 'POR', roleName: 'Arquero', x: 50, y: 92, playerId: assignedPlayerIds[0] },
          { id: 'h-dfc1', label: 'DFC', roleName: 'Defensa Izq', x: 28, y: 80, playerId: assignedPlayerIds[1] },
          { id: 'h-dfc2', label: 'DFC', roleName: 'Defensa Der', x: 72, y: 80, playerId: assignedPlayerIds[2] },
          { id: 'h-mc', label: 'MCD', roleName: 'Tapón Central', x: 50, y: 68, playerId: assignedPlayerIds[3] },
          { id: 'h-dc1', label: 'DC', roleName: 'Punta Izq', x: 35, y: 57, playerId: assignedPlayerIds[4] },
          { id: 'h-dc2', label: 'DC', roleName: 'Punta Der', x: 65, y: 57, playerId: assignedPlayerIds[5] },
        ];
      } else {
        return [
          { id: 'a-por', label: 'POR', roleName: 'Arquero', x: 50, y: 8, playerId: assignedPlayerIds[0] },
          { id: 'a-dfc1', label: 'DFC', roleName: 'Defensa Der', x: 72, y: 20, playerId: assignedPlayerIds[1] },
          { id: 'a-dfc2', label: 'DFC', roleName: 'Defensa Izq', x: 28, y: 20, playerId: assignedPlayerIds[2] },
          { id: 'a-mc', label: 'MCD', roleName: 'Tapón Central', x: 50, y: 32, playerId: assignedPlayerIds[3] },
          { id: 'a-dc1', label: 'DC', roleName: 'Punta Der', x: 65, y: 43, playerId: assignedPlayerIds[4] },
          { id: 'a-dc2', label: 'DC', roleName: 'Punta Izq', x: 35, y: 43, playerId: assignedPlayerIds[5] },
        ];
      }
    } else if (formationId.includes('7-321')) {
      if (teamSide === 'home') {
        return [
          { id: 'h-por', label: 'POR', roleName: 'Arquero', x: 50, y: 92, playerId: assignedPlayerIds[0] },
          { id: 'h-li', label: 'LI', roleName: 'Lateral Izq', x: 22, y: 80, playerId: assignedPlayerIds[1] },
          { id: 'h-dfc', label: 'DFC', roleName: 'Def Central', x: 50, y: 81, playerId: assignedPlayerIds[2] },
          { id: 'h-ld', label: 'LD', roleName: 'Lateral Der', x: 78, y: 80, playerId: assignedPlayerIds[3] },
          { id: 'h-mc1', label: 'MC', roleName: 'Medio Def', x: 35, y: 68, playerId: assignedPlayerIds[4] },
          { id: 'h-mc2', label: 'MCO', roleName: 'Medio Creativo', x: 65, y: 68, playerId: assignedPlayerIds[5] },
          { id: 'h-dc', label: 'DC', roleName: 'Delantero', x: 50, y: 57, playerId: assignedPlayerIds[6] },
        ];
      } else {
        return [
          { id: 'a-por', label: 'POR', roleName: 'Arquero', x: 50, y: 8, playerId: assignedPlayerIds[0] },
          { id: 'a-ld', label: 'LD', roleName: 'Lateral Der', x: 78, y: 20, playerId: assignedPlayerIds[1] },
          { id: 'a-dfc', label: 'DFC', roleName: 'Def Central', x: 50, y: 19, playerId: assignedPlayerIds[2] },
          { id: 'a-li', label: 'LI', roleName: 'Lateral Izq', x: 22, y: 20, playerId: assignedPlayerIds[3] },
          { id: 'a-mc2', label: 'MCO', roleName: 'Medio Creativo', x: 65, y: 32, playerId: assignedPlayerIds[4] },
          { id: 'a-mc1', label: 'MC', roleName: 'Medio Def', x: 35, y: 32, playerId: assignedPlayerIds[5] },
          { id: 'a-dc', label: 'DC', roleName: 'Delantero', x: 50, y: 43, playerId: assignedPlayerIds[6] },
        ];
      }
    } else {
      // Default: 2-2-1 (Fútbol 6)
      if (teamSide === 'home') {
        return [
          { id: 'h-por', label: 'POR', roleName: 'Arquero', x: 50, y: 92, playerId: assignedPlayerIds[0] },
          { id: 'h-dfc1', label: 'DFC', roleName: 'Defensa Izq', x: 28, y: 80, playerId: assignedPlayerIds[1] },
          { id: 'h-dfc2', label: 'DFC', roleName: 'Defensa Der', x: 72, y: 80, playerId: assignedPlayerIds[2] },
          { id: 'h-mc1', label: 'MC', roleName: 'Medio Izq', x: 30, y: 68, playerId: assignedPlayerIds[3] },
          { id: 'h-mc2', label: 'MC', roleName: 'Medio Der', x: 70, y: 68, playerId: assignedPlayerIds[4] },
          { id: 'h-dc', label: 'DC', roleName: 'Delantero', x: 50, y: 57, playerId: assignedPlayerIds[5] },
        ];
      } else {
        return [
          { id: 'a-por', label: 'POR', roleName: 'Arquero', x: 50, y: 8, playerId: assignedPlayerIds[0] },
          { id: 'a-dfc1', label: 'DFC', roleName: 'Defensa Der', x: 72, y: 20, playerId: assignedPlayerIds[1] },
          { id: 'a-dfc2', label: 'DFC', roleName: 'Defensa Izq', x: 28, y: 20, playerId: assignedPlayerIds[2] },
          { id: 'a-mc1', label: 'MC', roleName: 'Medio Der', x: 70, y: 32, playerId: assignedPlayerIds[3] },
          { id: 'a-mc2', label: 'MC', roleName: 'Medio Izq', x: 30, y: 32, playerId: assignedPlayerIds[4] },
          { id: 'a-dc', label: 'DC', roleName: 'Delantero', x: 50, y: 43, playerId: assignedPlayerIds[5] },
        ];
      }
    }
  } else {
    // Voleibol 6 vs 6 Oficial FIVB
    // Order in array: 0:Z4, 1:Z3, 2:Z2, 3:Z5, 4:Z6, 5:Z1
    if (teamSide === 'home') {
      return [
        { id: 'vh-z4', label: 'Z4', roleName: 'Punta Ataque', x: 24, y: 65, playerId: assignedPlayerIds[0] },
        { id: 'vh-z3', label: 'Z3', roleName: 'Central Bloq', x: 50, y: 64, playerId: assignedPlayerIds[1] },
        { id: 'vh-z2', label: 'Z2', roleName: 'Opuesto Ataq', x: 76, y: 65, playerId: assignedPlayerIds[2] },
        { id: 'vh-z5', label: 'Z5', roleName: 'Líbero / Def', x: 24, y: 85, playerId: assignedPlayerIds[3] },
        { id: 'vh-z6', label: 'Z6', roleName: 'Zaguero Centro', x: 50, y: 85, playerId: assignedPlayerIds[4] },
        { id: 'vh-z1', label: 'Z1', roleName: 'Armador (Saque)', x: 76, y: 85, playerId: assignedPlayerIds[5] },
      ];
    } else {
      return [
        { id: 'va-z4', label: 'Z4', roleName: 'Punta Ataque', x: 76, y: 35, playerId: assignedPlayerIds[0] },
        { id: 'va-z3', label: 'Z3', roleName: 'Central Bloq', x: 50, y: 36, playerId: assignedPlayerIds[1] },
        { id: 'va-z2', label: 'Z2', roleName: 'Opuesto Ataq', x: 24, y: 35, playerId: assignedPlayerIds[2] },
        { id: 'va-z5', label: 'Z5', roleName: 'Líbero / Def', x: 76, y: 15, playerId: assignedPlayerIds[3] },
        { id: 'va-z6', label: 'Z6', roleName: 'Zaguero Centro', x: 50, y: 15, playerId: assignedPlayerIds[4] },
        { id: 'va-z1', label: 'Z1', roleName: 'Armador (Saque)', x: 24, y: 15, playerId: assignedPlayerIds[5] },
      ];
    }
  }
}

// Generate Single Team Tactical Slots for half-pitch customization
function generateSingleTeamSlots(
  sport: SportType,
  formationId: string,
  assignedPlayerIds: (string | undefined)[],
  prefix: string = 's'
): TacticalSlot[] {
  if (sport === 'futbol') {
    if (formationId.includes('6-131')) {
      return [
        { id: `${prefix}-por`, label: 'POR', roleName: 'Arquero', x: 50, y: 86, playerId: assignedPlayerIds[0] },
        { id: `${prefix}-dfc`, label: 'DFC', roleName: 'Líbero', x: 50, y: 64, playerId: assignedPlayerIds[1] },
        { id: `${prefix}-li`, label: 'LI', roleName: 'Carrilero Izq', x: 20, y: 42, playerId: assignedPlayerIds[2] },
        { id: `${prefix}-mc`, label: 'MCD', roleName: 'Volante Eje', x: 50, y: 42, playerId: assignedPlayerIds[3] },
        { id: `${prefix}-ld`, label: 'LD', roleName: 'Carrilero Der', x: 80, y: 42, playerId: assignedPlayerIds[4] },
        { id: `${prefix}-dc`, label: 'DC', roleName: 'Delantero', x: 50, y: 18, playerId: assignedPlayerIds[5] },
      ];
    } else if (formationId.includes('6-212')) {
      return [
        { id: `${prefix}-por`, label: 'POR', roleName: 'Arquero', x: 50, y: 86, playerId: assignedPlayerIds[0] },
        { id: `${prefix}-dfc1`, label: 'DFC', roleName: 'Defensa Izq', x: 30, y: 64, playerId: assignedPlayerIds[1] },
        { id: `${prefix}-dfc2`, label: 'DFC', roleName: 'Defensa Der', x: 70, y: 64, playerId: assignedPlayerIds[2] },
        { id: `${prefix}-mc`, label: 'MCD', roleName: 'Tapón Central', x: 50, y: 44, playerId: assignedPlayerIds[3] },
        { id: `${prefix}-dc1`, label: 'DC', roleName: 'Punta Izq', x: 35, y: 18, playerId: assignedPlayerIds[4] },
        { id: `${prefix}-dc2`, label: 'DC', roleName: 'Punta Der', x: 65, y: 18, playerId: assignedPlayerIds[5] },
      ];
    } else if (formationId.includes('7-321')) {
      return [
        { id: `${prefix}-por`, label: 'POR', roleName: 'Arquero', x: 50, y: 86, playerId: assignedPlayerIds[0] },
        { id: `${prefix}-li`, label: 'LI', roleName: 'Lateral Izq', x: 20, y: 64, playerId: assignedPlayerIds[1] },
        { id: `${prefix}-dfc`, label: 'DFC', roleName: 'Def Central', x: 50, y: 66, playerId: assignedPlayerIds[2] },
        { id: `${prefix}-ld`, label: 'LD', roleName: 'Lateral Der', x: 80, y: 64, playerId: assignedPlayerIds[3] },
        { id: `${prefix}-mc1`, label: 'MC', roleName: 'Medio Def', x: 35, y: 40, playerId: assignedPlayerIds[4] },
        { id: `${prefix}-mc2`, label: 'MCO', roleName: 'Medio Creativo', x: 65, y: 40, playerId: assignedPlayerIds[5] },
        { id: `${prefix}-dc`, label: 'DC', roleName: 'Delantero', x: 50, y: 18, playerId: assignedPlayerIds[6] },
      ];
    } else {
      // 2-2-1
      return [
        { id: `${prefix}-por`, label: 'POR', roleName: 'Arquero', x: 50, y: 86, playerId: assignedPlayerIds[0] },
        { id: `${prefix}-dfc1`, label: 'DFC', roleName: 'Defensa Izq', x: 30, y: 64, playerId: assignedPlayerIds[1] },
        { id: `${prefix}-dfc2`, label: 'DFC', roleName: 'Defensa Der', x: 70, y: 64, playerId: assignedPlayerIds[2] },
        { id: `${prefix}-mc1`, label: 'MC', roleName: 'Medio Izq', x: 32, y: 42, playerId: assignedPlayerIds[3] },
        { id: `${prefix}-mc2`, label: 'MC', roleName: 'Medio Der', x: 68, y: 42, playerId: assignedPlayerIds[4] },
        { id: `${prefix}-dc`, label: 'DC', roleName: 'Delantero', x: 50, y: 18, playerId: assignedPlayerIds[5] },
      ];
    }
  } else {
    // Vóley 6 Jugadores FIVB (Delanteros Z4, Z3, Z2 / Zagueros Z5, Z6, Z1)
    return [
      { id: `${prefix}-z4`, label: 'Z4', roleName: 'Punta Receptor', x: 24, y: 28, playerId: assignedPlayerIds[0] },
      { id: `${prefix}-z3`, label: 'Z3', roleName: 'Central Bloq', x: 50, y: 24, playerId: assignedPlayerIds[1] },
      { id: `${prefix}-z2`, label: 'Z2', roleName: 'Opuesto Ataq', x: 76, y: 28, playerId: assignedPlayerIds[2] },
      { id: `${prefix}-z5`, label: 'Z5', roleName: 'Líbero / Def', x: 24, y: 72, playerId: assignedPlayerIds[3] },
      { id: `${prefix}-z6`, label: 'Z6', roleName: 'Zaguero Centro', x: 50, y: 76, playerId: assignedPlayerIds[4] },
      { id: `${prefix}-z1`, label: 'Z1', roleName: 'Armador (Saque)', x: 76, y: 72, playerId: assignedPlayerIds[5] },
    ];
  }
}

// Clockwise Volleyball Rotation Function
function rotateVolleyballSlotsClockwise(slots: TacticalSlot[]): TacticalSlot[] {
  if (slots.length < 6) return slots;
  const oldZ4 = slots[0]?.playerId;
  const oldZ3 = slots[1]?.playerId;
  const oldZ2 = slots[2]?.playerId;
  const oldZ5 = slots[3]?.playerId;
  const oldZ6 = slots[4]?.playerId;
  const oldZ1 = slots[5]?.playerId;

  return [
    { ...slots[0], playerId: oldZ5 },
    { ...slots[1], playerId: oldZ4 },
    { ...slots[2], playerId: oldZ3 },
    { ...slots[3], playerId: oldZ6 },
    { ...slots[4], playerId: oldZ1 },
    { ...slots[5], playerId: oldZ2 },
  ];
}

function rotateVolleyballSlotsCounterClockwise(slots: TacticalSlot[]): TacticalSlot[] {
  if (slots.length < 6) return slots;
  const oldZ4 = slots[0]?.playerId;
  const oldZ3 = slots[1]?.playerId;
  const oldZ2 = slots[2]?.playerId;
  const oldZ5 = slots[3]?.playerId;
  const oldZ6 = slots[4]?.playerId;
  const oldZ1 = slots[5]?.playerId;

  return [
    { ...slots[0], playerId: oldZ3 },
    { ...slots[1], playerId: oldZ2 },
    { ...slots[2], playerId: oldZ1 },
    { ...slots[3], playerId: oldZ4 },
    { ...slots[4], playerId: oldZ5 },
    { ...slots[5], playerId: oldZ6 },
  ];
}

function getVolleyballZoneRole(zoneLabel: string, system: string, rotationNum: number): string {
  if (system.includes('5-1')) {
    if (zoneLabel === 'Z1') return 'Saque / Zaguero Der';
    if (zoneLabel === 'Z2') return 'Ataque / Bloqueo Der';
    if (zoneLabel === 'Z3') return 'Central / Bloq Medio';
    if (zoneLabel === 'Z4') return 'Punta / Ataque Izq';
    if (zoneLabel === 'Z5') return 'Defensa / Líbero';
    if (zoneLabel === 'Z6') return 'Defensa Zaguero';
  } else if (system.includes('4-2')) {
    if (zoneLabel === 'Z1') return 'Saque / Armador';
    if (zoneLabel === 'Z3') return 'Armador Red';
    if (zoneLabel === 'Z2' || zoneLabel === 'Z4') return 'Punta Remate';
    return 'Defensa';
  }
  if (zoneLabel === 'Z1') return 'Saque Oficial';
  return 'Zona ' + zoneLabel;
}

export const TacticalBoard: React.FC<TacticalBoardProps> = ({
  currentSport,
  matches,
  players,
  userRole,
  initialMatchId,
  onSaveMatchSlots,
  onUpdateMatchRoster,
}) => {
  const sportMatches = matches.filter((m) => m.sport === currentSport);
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    initialMatchId && sportMatches.some((m) => m.id === initialMatchId)
      ? initialMatchId
      : sportMatches[0]?.id || ''
  );

  // Sync with initialMatchId if passed
  useEffect(() => {
    if (initialMatchId && sportMatches.some((m) => m.id === initialMatchId)) {
      setSelectedMatchId(initialMatchId);
    } else if (!sportMatches.some((m) => m.id === selectedMatchId) && sportMatches[0]) {
      setSelectedMatchId(sportMatches[0].id);
    }
  }, [initialMatchId, currentSport, sportMatches]);

  const currentMatch = sportMatches.find((m) => m.id === selectedMatchId) || sportMatches[0];
  const formations = DEFAULT_TACTICAL_FORMATIONS[currentSport] || [];

  // Active view tab: 'full' (Cancha Completa), 'home' (Equipo A), 'away' (Equipo B)
  const [activeViewTab, setActiveViewTab] = useState<'full' | 'home' | 'away'>('full');

  // Home and Away Formations
  const [homeFormationId, setHomeFormationId] = useState<string>(formations[0]?.id || '');
  const [awayFormationId, setAwayFormationId] = useState<string>(formations[0]?.id || '');

  // Volleyball Rotations Tracker (1 to 6)
  const [homeRotation, setHomeRotation] = useState<number>(1);
  const [awayRotation, setAwayRotation] = useState<number>(1);

  // Both teams slots on the full field
  const [homeSlots, setHomeSlots] = useState<TacticalSlot[]>([]);
  const [awaySlots, setAwaySlots] = useState<TacticalSlot[]>([]);

  // Drag and selection state
  const [draggedPlayer, setDraggedPlayer] = useState<{ id: string; side: 'home' | 'away' } | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; side: 'home' | 'away' } | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; side: 'home' | 'away' } | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Modal for adding players to team roster
  const [addPlayerModalSide, setAddPlayerModalSide] = useState<'home' | 'away' | null>(null);
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  // Sync state when match or sport changes
  useEffect(() => {
    if (!currentMatch) return;

    const hFormId = currentMatch.homeFormationId || formations[0]?.id || '';
    const aFormId = currentMatch.awayFormationId || formations[0]?.id || '';
    setHomeFormationId(hFormId);
    setAwayFormationId(aFormId);
    setHomeRotation(1);
    setAwayRotation(1);

    const hPlayerIds = currentMatch.homePlayerIds || [];
    const aPlayerIds = currentMatch.awayPlayerIds || [];

    if (currentMatch.homeTacticalSlots && currentMatch.homeTacticalSlots.length > 0) {
      setHomeSlots(currentMatch.homeTacticalSlots);
    } else {
      setHomeSlots(generateFullFieldSlots(currentSport, 'home', hFormId, hPlayerIds));
    }

    if (currentMatch.awayTacticalSlots && currentMatch.awayTacticalSlots.length > 0) {
      setAwaySlots(currentMatch.awayTacticalSlots);
    } else {
      setAwaySlots(generateFullFieldSlots(currentSport, 'away', aFormId, aPlayerIds));
    }
  }, [selectedMatchId, currentSport, currentMatch?.id]);

  // Handle formation change
  const handleHomeFormationChange = (newFormId: string) => {
    setHomeFormationId(newFormId);
    const assignedIds = homeSlots.map((s) => s.playerId);
    setHomeSlots(generateFullFieldSlots(currentSport, 'home', newFormId, assignedIds));
    setHomeRotation(1);
  };

  const handleAwayFormationChange = (newFormId: string) => {
    setAwayFormationId(newFormId);
    const assignedIds = awaySlots.map((s) => s.playerId);
    setAwaySlots(generateFullFieldSlots(currentSport, 'away', newFormId, assignedIds));
    setAwayRotation(1);
  };

  // Volleyball Rotation Handlers
  const handleRotateVolleyballTeam = (side: 'home' | 'away', direction: 'next' | 'prev') => {
    if (side === 'home') {
      setHomeSlots((prev) =>
        direction === 'next' ? rotateVolleyballSlotsClockwise(prev) : rotateVolleyballSlotsCounterClockwise(prev)
      );
      const nextNum = direction === 'next' ? (homeRotation % 6) + 1 : homeRotation === 1 ? 6 : homeRotation - 1;
      setHomeRotation(nextNum);
      showToast(`Rotación R${nextNum} (${currentMatch.homeTeamName})`);
    } else {
      setAwaySlots((prev) =>
        direction === 'next' ? rotateVolleyballSlotsClockwise(prev) : rotateVolleyballSlotsCounterClockwise(prev)
      );
      const nextNum = direction === 'next' ? (awayRotation % 6) + 1 : awayRotation === 1 ? 6 : awayRotation - 1;
      setAwayRotation(nextNum);
      showToast(`Rotación R${nextNum} (${currentMatch.awayTeamName})`);
    }
  };

  // Direct Volleyball Rotation jump
  const handleSetDirectVolleyballRotation = (side: 'home' | 'away', targetRot: number) => {
    const currentRot = side === 'home' ? homeRotation : awayRotation;
    if (currentRot === targetRot) return;

    const diff = (targetRot - currentRot + 6) % 6;
    if (side === 'home') {
      let updatedSlots = [...homeSlots];
      for (let i = 0; i < diff; i++) {
        updatedSlots = rotateVolleyballSlotsClockwise(updatedSlots);
      }
      setHomeSlots(updatedSlots);
      setHomeRotation(targetRot);
      showToast(`Rotación R${targetRot} fijada (${currentMatch.homeTeamName})`);
    } else {
      let updatedSlots = [...awaySlots];
      for (let i = 0; i < diff; i++) {
        updatedSlots = rotateVolleyballSlotsClockwise(updatedSlots);
      }
      setAwaySlots(updatedSlots);
      setAwayRotation(targetRot);
      showToast(`Rotación R${targetRot} fijada (${currentMatch.awayTeamName})`);
    }
  };

  // Add / Remove players from team roster
  const handleAddPlayerToTeamRoster = (side: 'home' | 'away', playerId: string) => {
    if (userRole !== 'admin' || !currentMatch) return;
    const currentList = side === 'home' ? currentMatch.homePlayerIds || [] : currentMatch.awayPlayerIds || [];
    if (currentList.includes(playerId)) return;

    const updatedList = [...currentList, playerId];
    if (side === 'home') {
      currentMatch.homePlayerIds = updatedList;
    } else {
      currentMatch.awayPlayerIds = updatedList;
    }

    if (onUpdateMatchRoster) {
      onUpdateMatchRoster(currentMatch.id, side, updatedList);
    }
    showToast('Jugador añadido a la convocatoria');
  };

  const handleRemovePlayerFromTeamRoster = (side: 'home' | 'away', playerId: string) => {
    if (userRole !== 'admin' || !currentMatch) return;
    const currentList = side === 'home' ? currentMatch.homePlayerIds || [] : currentMatch.awayPlayerIds || [];
    const updatedList = currentList.filter((id) => id !== playerId);

    if (side === 'home') {
      currentMatch.homePlayerIds = updatedList;
      setHomeSlots((prev) => prev.map((slot) => (slot.playerId === playerId ? { ...slot, playerId: undefined } : slot)));
    } else {
      currentMatch.awayPlayerIds = updatedList;
      setAwaySlots((prev) => prev.map((slot) => (slot.playerId === playerId ? { ...slot, playerId: undefined } : slot)));
    }

    if (onUpdateMatchRoster) {
      onUpdateMatchRoster(currentMatch.id, side, updatedList);
    }
    showToast('Jugador desconvocado del equipo');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, playerId: string, side: 'home' | 'away') => {
    if (userRole !== 'admin') return;
    setDraggedPlayer({ id: playerId, side });
    e.dataTransfer.setData('text/plain', JSON.stringify({ playerId, side }));
  };

  const handleSlotDrop = (slotId: string, targetSide: 'home' | 'away') => {
    if (userRole !== 'admin' || !draggedPlayer) return;

    if (draggedPlayer.side !== targetSide) {
      alert(`Jugador pertenece a ${draggedPlayer.side === 'home' ? currentMatch.homeTeamName : currentMatch.awayTeamName}`);
      return;
    }

    const updateSlots = targetSide === 'home' ? setHomeSlots : setAwaySlots;

    updateSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, playerId: draggedPlayer.id };
        }
        if (slot.playerId === draggedPlayer.id) {
          return { ...slot, playerId: undefined };
        }
        return slot;
      })
    );

    setDraggedPlayer(null);
    showToast('Jugador asignado');
  };

  // Assign player to slot
  const handleAssignPlayerToSlot = (slotId: string, playerId: string, side: 'home' | 'away') => {
    if (userRole !== 'admin') return;
    const updateSlots = side === 'home' ? setHomeSlots : setAwaySlots;

    updateSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === slotId) {
          return { ...slot, playerId: slot.playerId === playerId ? undefined : playerId };
        }
        if (slot.playerId === playerId) {
          return { ...slot, playerId: undefined };
        }
        return slot;
      })
    );
    setSelectedSlot(null);
    setSelectedPlayer(null);
    showToast('Posición actualizada');
  };

  // Quick assign to first empty slot
  const handleQuickAssignToFirstEmpty = (playerId: string, side: 'home' | 'away') => {
    if (userRole !== 'admin') return;
    const currentSlots = side === 'home' ? homeSlots : awaySlots;
    const firstEmpty = currentSlots.find((s) => !s.playerId);

    if (!firstEmpty) {
      showToast('No hay posiciones libres');
      return;
    }

    handleAssignPlayerToSlot(firstEmpty.id, playerId, side);
  };

  const handleRemoveFromSlot = (slotId: string, side: 'home' | 'away') => {
    if (userRole !== 'admin') return;
    const updateSlots = side === 'home' ? setHomeSlots : setAwaySlots;
    updateSlots((prev) =>
      prev.map((slot) => (slot.id === slotId ? { ...slot, playerId: undefined } : slot))
    );
    showToast('Jugador enviado a banca');
  };

  // Auto-Assign team by skill
  const handleAutoAssignTeam = (side: 'home' | 'away') => {
    if (userRole !== 'admin' || !currentMatch) return;

    const teamPIds = side === 'home' ? currentMatch.homePlayerIds || [] : currentMatch.awayPlayerIds || [];
    const teamPlayers = players
      .filter((p) => teamPIds.includes(p.id))
      .sort((a, b) => b.skillRating - a.skillRating)
      .map((p) => p.id);

    if (side === 'home') {
      setHomeSlots((prev) => prev.map((slot, idx) => ({ ...slot, playerId: teamPlayers[idx] || undefined })));
    } else {
      setAwaySlots((prev) => prev.map((slot, idx) => ({ ...slot, playerId: teamPlayers[idx] || undefined })));
    }
    showToast('Alineación completada');
  };

  const handleAutoAssignBoth = () => {
    handleAutoAssignTeam('home');
    handleAutoAssignTeam('away');
  };

  // Clear Logic
  const handleClearTeam = (side: 'home' | 'away') => {
    if (userRole !== 'admin') return;

    if (side === 'home') {
      setHomeSlots((prev) => prev.map((slot) => ({ ...slot, playerId: undefined })));
    } else {
      setAwaySlots((prev) => prev.map((slot) => ({ ...slot, playerId: undefined })));
    }

    setSelectedSlot(null);
    setSelectedPlayer(null);
    showToast('Posiciones limpiadas');
  };

  const handleClearBoth = () => {
    if (userRole !== 'admin') return;
    setHomeSlots((prev) => prev.map((slot) => ({ ...slot, playerId: undefined })));
    setAwaySlots((prev) => prev.map((slot) => ({ ...slot, playerId: undefined })));
    setSelectedSlot(null);
    setSelectedPlayer(null);
    showToast('Cancha limpiada');
  };

  const handleSaveBoth = () => {
    if (currentMatch && onSaveMatchSlots) {
      onSaveMatchSlots(currentMatch.id, 'home', homeSlots, homeFormationId);
      onSaveMatchSlots(currentMatch.id, 'away', awaySlots, awayFormationId);
    }
    showToast('Pizarra guardada con éxito');
  };

  const homeConvocados = players.filter((p) => currentMatch?.homePlayerIds?.includes(p.id));
  const awayConvocados = players.filter((p) => currentMatch?.awayPlayerIds?.includes(p.id));

  // Compute single team relative slots for dedicated team view
  const homeSingleSlots = generateSingleTeamSlots(
    currentSport,
    homeFormationId,
    homeSlots.map((s) => s.playerId),
    'h'
  );

  const awaySingleSlots = generateSingleTeamSlots(
    currentSport,
    awayFormationId,
    awaySlots.map((s) => s.playerId),
    'a'
  );

  const homeActiveFormation = formations.find((f) => f.id === homeFormationId) || formations[0];
  const awayActiveFormation = formations.find((f) => f.id === awayFormationId) || formations[0];

  // Candidates for adding to team roster
  const sportCandidates = players.filter((p) => p.sport === currentSport);
  const availableToAddToHome = sportCandidates.filter(
    (p) => !currentMatch?.homePlayerIds?.includes(p.id) && !currentMatch?.awayPlayerIds?.includes(p.id)
  );
  const availableToAddToAway = sportCandidates.filter(
    (p) => !currentMatch?.awayPlayerIds?.includes(p.id) && !currentMatch?.homePlayerIds?.includes(p.id)
  );

  if (!currentMatch) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
        <p className="text-slate-400 text-sm">
          No hay encuentros programados en {currentSport === 'futbol' ? 'Fútbol' : 'Vóley'}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-2xl shadow-xl space-y-3">
        {/* Match selector & action buttons with responsive spacing */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Match selector */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs sm:text-sm text-slate-300 font-bold whitespace-nowrap shrink-0">
              Encuentro:
            </span>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 truncate w-full shadow-inner cursor-pointer"
            >
              {sportMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.homeTeamLogo} {m.homeTeamName} vs {m.awayTeamLogo} {m.awayTeamName}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons Bar */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-2 justify-end shrink-0">
              <button
                onClick={handleAutoAssignBoth}
                title="Auto-Alinear ambos equipos por nivel de habilidad"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-amber-500/40 shadow transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Auto-Alinear</span>
                <span className="sm:hidden">Auto</span>
              </button>
              <button
                onClick={handleClearBoth}
                title="Limpiar todas las posiciones en cancha"
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 shadow transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Limpiar Cancha</span>
              </button>
              <button
                onClick={handleSaveBoth}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950 transition-all active:scale-[0.98] whitespace-nowrap"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>Guardar Pizarra</span>
              </button>
            </div>
          )}
        </div>

        {/* 3-Segment Clean Navigation Tab Bar */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/90 shadow-inner">
            {/* Tab 1: Cancha Completa */}
            <button
              onClick={() => {
                setActiveViewTab('full');
                setSelectedSlot(null);
                setSelectedPlayer(null);
              }}
              className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 truncate ${
                activeViewTab === 'full'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
              }`}
            >
              <span className="text-base shrink-0">🏟️</span>
              <span className="hidden sm:inline font-black truncate">Cancha Completa</span>
              <span className="sm:hidden font-bold truncate">Cancha</span>
            </button>

            {/* Tab 2: Equipo A */}
            <button
              onClick={() => {
                setActiveViewTab('home');
                setSelectedSlot(null);
                setSelectedPlayer(null);
              }}
              className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 truncate ${
                activeViewTab === 'home'
                  ? 'bg-blue-600 text-white shadow-md ring-1 ring-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
              }`}
            >
              <span className="text-base shrink-0">{currentMatch.homeTeamLogo}</span>
              <span className="truncate">{currentMatch.homeTeamName}</span>
            </button>

            {/* Tab 3: Equipo B */}
            <button
              onClick={() => {
                setActiveViewTab('away');
                setSelectedSlot(null);
                setSelectedPlayer(null);
              }}
              className={`py-2 px-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 truncate ${
                activeViewTab === 'away'
                  ? 'bg-red-600 text-white shadow-md ring-1 ring-red-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/70'
              }`}
            >
              <span className="text-base shrink-0">{currentMatch.awayTeamLogo}</span>
              <span className="truncate">{currentMatch.awayTeamName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {feedbackToast && (
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 text-xs sm:text-sm font-medium shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{feedbackToast}</span>
          </div>
          <button onClick={() => setFeedbackToast(null)} className="p-1 hover:bg-emerald-900/60 rounded text-emerald-300">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Selection Guidance Banner (Admin only) */}
      {userRole === 'admin' && (selectedSlot || selectedPlayer) && (
        <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-amber-500/15 border border-amber-500/50 text-amber-200 text-xs sm:text-sm font-medium animate-fadeIn">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="truncate">
              {selectedSlot ? 'Posición seleccionada. Toca a un jugador de la lista para ubicarlo.' : 'Jugador seleccionado. Toca un círculo en la cancha para asignarlo.'}
            </span>
          </div>
          <button
            onClick={() => {
              setSelectedSlot(null);
              setSelectedPlayer(null);
            }}
            className="p-1 hover:bg-amber-500/20 rounded text-amber-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 1: CANCHA COMPLETA (AMBOS EQUIPOS FRENTE A FRENTE) */}
      {/* ========================================================================= */}
      {activeViewTab === 'full' && (
        <div className="space-y-3 sm:space-y-4 animate-fadeIn">
          {/* Formations & Rotations Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900 border border-slate-800 p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm shadow-md">
            {/* Formations selectors with clean responsive labels */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-blue-950/90 px-2.5 py-1.5 rounded-xl border border-blue-800">
                <span className="text-blue-400 font-bold whitespace-nowrap">
                  {currentMatch.homeTeamName}:
                </span>
                <select
                  value={homeFormationId}
                  onChange={(e) => handleHomeFormationChange(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs sm:text-sm"
                >
                  {formations.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-red-950/90 px-2.5 py-1.5 rounded-xl border border-red-800">
                <span className="text-red-400 font-bold whitespace-nowrap">
                  {currentMatch.awayTeamName}:
                </span>
                <select
                  value={awayFormationId}
                  onChange={(e) => handleAwayFormationChange(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs sm:text-sm"
                >
                  {formations.map((f) => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Volleyball Rotation Tracking Controls on Full Court */}
            {currentSport === 'voley' && userRole === 'admin' ? (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleRotateVolleyballTeam('home', 'next')}
                  title="Siguiente Rotación Horaria Equipo A"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotar A (R{homeRotation})</span>
                </button>

                <button
                  onClick={() => handleRotateVolleyballTeam('away', 'next')}
                  title="Siguiente Rotación Horaria Equipo B"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotar B (R{awayRotation})</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveViewTab('home')}
                  className="text-xs font-bold text-blue-300 hover:text-white bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-800 shadow transition-colors flex items-center gap-1"
                >
                  <span>Alinear {currentMatch.homeTeamName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveViewTab('away')}
                  className="text-xs font-bold text-red-300 hover:text-white bg-red-950/80 px-3 py-1.5 rounded-xl border border-red-800 shadow transition-colors flex items-center gap-1"
                >
                  <span>Alinear {currentMatch.awayTeamName}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
            {/* Left Drawer (Desktop): Convocados Eq. A */}
            <div className="hidden xl:block xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{currentMatch.homeTeamLogo}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-blue-400 truncate">{currentMatch.homeTeamName}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded-lg border border-blue-800">
                    {homeConvocados.length}
                  </span>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setAddPlayerModalSide('home')}
                      title="Gestionar convocatoria"
                      className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs shadow"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
                {homeConvocados.map((player) => {
                  const assignedSlot = homeSlots.find((s) => s.playerId === player.id);
                  const isAssigned = !!assignedSlot;

                  return (
                    <div
                      key={player.id}
                      draggable={userRole === 'admin'}
                      onDragStart={(e) => handleDragStart(e, player.id, 'home')}
                      onClick={() => {
                        if (userRole === 'admin') {
                          if (selectedSlot?.side === 'home') {
                            handleAssignPlayerToSlot(selectedSlot.id, player.id, 'home');
                          } else {
                            setSelectedPlayer({ id: player.id, side: 'home' });
                          }
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isAssigned
                          ? 'bg-blue-950/30 border-blue-900/60 text-slate-200'
                          : selectedSlot?.side === 'home' || selectedPlayer?.id === player.id
                          ? 'bg-blue-900/50 border-blue-400 ring-2 ring-blue-400 text-white cursor-pointer'
                          : 'bg-slate-950/90 border-slate-800/90 hover:bg-slate-800/80 cursor-grab text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Enlarged player circular avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-blue-500/70 bg-blue-950 flex items-center justify-center font-bold text-xs shadow">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-200">#{player.jerseyNumber || player.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{player.name}</p>
                          <p className="text-[11px] text-blue-300 truncate">{player.position}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isAssigned ? (
                          <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800">
                            {assignedSlot?.label}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Banca</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center Canvas: FULL PITCH HEAD TO HEAD WITH ENLARGED TOKENS */}
            <div className="xl:col-span-6 flex flex-col items-center w-full">
              <div className="relative w-full max-w-xl aspect-[9/13] sm:aspect-[9/12.5] rounded-3xl overflow-hidden border-3 sm:border-4 border-slate-800 shadow-2xl select-none">
                {/* Background pitch graphic */}
                {currentSport === 'futbol' ? (
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 overflow-hidden">
                    <div className="absolute inset-0 opacity-15 bg-[repeating-linear-gradient(0deg,#000_0px,#000_36px,transparent_36px,transparent_72px)]" />
                    <div className="absolute inset-3 sm:inset-4 border-2 border-white/70 rounded-sm pointer-events-none">
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/80 -translate-y-1/2" />
                      <div className="absolute top-1/2 left-1/2 w-24 sm:w-28 h-24 sm:h-28 border-2 border-white/80 rounded-full -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      </div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-20 sm:h-24 border-2 border-t-0 border-white/70">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-22 sm:w-26 h-8 sm:h-10 border-2 border-t-0 border-white/70" />
                        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-20 sm:h-24 border-2 border-b-0 border-white/70">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-22 sm:w-26 h-8 sm:h-10 border-2 border-b-0 border-white/70" />
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="absolute top-2 left-2 text-[9px] sm:text-xs font-bold text-red-200 bg-red-950/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-red-800 shadow uppercase flex items-center gap-1.5 max-w-[110px] sm:max-w-[150px]">
                        <span>{currentMatch.awayTeamLogo}</span>
                        <span className="truncate">{currentMatch.awayTeamName}</span>
                      </div>
                      <div className="absolute bottom-2 left-2 text-[9px] sm:text-xs font-bold text-blue-200 bg-blue-950/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-blue-800 shadow uppercase flex items-center gap-1.5 max-w-[110px] sm:max-w-[150px]">
                        <span>{currentMatch.homeTeamLogo}</span>
                        <span className="truncate">{currentMatch.homeTeamName}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800 overflow-hidden">
                    <div className="absolute inset-0 bg-sky-950/70 p-2 sm:p-4">
                      <div className="relative w-full h-full bg-amber-600 border-2 border-white rounded-sm">
                        <div className="absolute top-1/2 left-0 right-0 h-2 sm:h-2.5 bg-white shadow flex items-center justify-center -translate-y-1/2 z-10">
                          <div className="px-1.5 sm:px-2.5 py-0.2 sm:py-0.5 bg-red-600 text-[8px] sm:text-[9px] text-white font-black tracking-widest uppercase rounded shadow">
                            RED / NET
                          </div>
                        </div>
                        <div className="absolute top-[34%] left-0 right-0 border-t-2 border-dashed border-white/90 flex items-center justify-end pr-2">
                          <span className="text-[7px] sm:text-[8px] text-white font-bold bg-amber-900/90 px-1 py-0.2 rounded">3m</span>
                        </div>
                        <div className="absolute bottom-[34%] left-0 right-0 border-t-2 border-dashed border-white/90 flex items-center justify-end pr-2">
                          <span className="text-[7px] sm:text-[8px] text-white font-bold bg-amber-900/90 px-1 py-0.2 rounded">3m</span>
                        </div>
                        <div className="absolute top-2 left-2 text-[9px] sm:text-[11px] font-bold text-red-200 bg-red-950/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-red-800 uppercase shadow flex items-center gap-1.5 max-w-[110px] sm:max-w-[150px]">
                          <span>{currentMatch.awayTeamLogo}</span>
                          <span className="truncate">{currentMatch.awayTeamName}</span>
                          <span className="text-[8px] sm:text-[10px] text-amber-300 font-mono font-bold bg-black/50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded">R{awayRotation}</span>
                        </div>
                        <div className="absolute bottom-2 left-2 text-[9px] sm:text-[11px] font-bold text-blue-200 bg-blue-950/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-blue-800 uppercase shadow flex items-center gap-1.5 max-w-[110px] sm:max-w-[150px]">
                          <span>{currentMatch.homeTeamLogo}</span>
                          <span className="truncate">{currentMatch.homeTeamName}</span>
                          <span className="text-[8px] sm:text-[10px] text-amber-300 font-mono font-bold bg-black/50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded">R{homeRotation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Away Slots on Full Pitch (Responsive Mobile tokens to prevent overlapping) */}
                {awaySlots.map((slot) => {
                  const assignedPlayer = players.find((p) => p.id === slot.playerId);
                  const isSelected = selectedSlot?.id === slot.id && selectedSlot?.side === 'away';
                  const isServer = currentSport === 'voley' && slot.label === 'Z1';

                  return (
                    <div
                      key={slot.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleSlotDrop(slot.id, 'away')}
                      onClick={() => {
                        if (userRole === 'admin') {
                          if (selectedPlayer && selectedPlayer.side === 'away') {
                            handleAssignPlayerToSlot(slot.id, selectedPlayer.id, 'away');
                          } else {
                            setSelectedSlot(isSelected ? null : { id: slot.id, side: 'away' });
                          }
                        }
                      }}
                      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}
                      className="absolute z-20 flex flex-col items-center cursor-pointer group"
                    >
                      <div
                        className={`relative w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all border sm:border-2 md:border-3 ${
                          assignedPlayer
                            ? 'bg-red-950 border-white text-white ring-1.5 sm:ring-2 md:ring-3 ring-red-500'
                            : isSelected
                            ? 'bg-amber-500 border-amber-200 text-slate-950 ring-2 sm:ring-4 ring-amber-400 scale-105'
                            : 'bg-slate-950/85 border-dashed border border-red-400 text-red-200 hover:scale-105'
                        }`}
                      >
                        {assignedPlayer ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                            {assignedPlayer.photoUrl ? (
                              <img src={assignedPlayer.photoUrl} alt={assignedPlayer.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] sm:text-sm font-black text-white">#{assignedPlayer.jerseyNumber || assignedPlayer.name.charAt(0)}</span>
                            )}
                            <div className="absolute bottom-0 right-0 bg-red-950 text-white text-[6px] sm:text-[8px] font-black px-0.5 sm:px-1 rounded-tl border-t border-l border-red-700">
                              #{assignedPlayer.jerseyNumber || '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="font-black text-[8px] sm:text-[10px] md:text-xs text-red-300">{slot.label}</span>
                        )}

                        {isServer && (
                          <div
                            title="Jugador al Saque (Zona 1)"
                            className="absolute -top-1 -left-1 text-[8px] sm:text-[10px] bg-amber-400 text-slate-950 font-black px-1 py-0.1 sm:px-1.5 sm:py-0.2 rounded-full shadow-lg border border-amber-200 animate-bounce"
                          >
                            🏐
                          </div>
                        )}

                        {userRole === 'admin' && assignedPlayer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromSlot(slot.id, 'away');
                            }}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow hover:bg-red-500"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="mt-0.5 bg-slate-950/95 border border-slate-700/80 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-full shadow-md max-w-[55px] sm:max-w-[100px] pointer-events-none text-center">
                        <p className="text-[7px] sm:text-[9px] font-bold text-white truncate tracking-tight">
                          {assignedPlayer ? assignedPlayer.name.split(' ')[0] : slot.roleName}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Home Slots on Full Pitch (Responsive Mobile tokens to prevent overlapping) */}
                {homeSlots.map((slot) => {
                  const assignedPlayer = players.find((p) => p.id === slot.playerId);
                  const isSelected = selectedSlot?.id === slot.id && selectedSlot?.side === 'home';
                  const isServer = currentSport === 'voley' && slot.label === 'Z1';

                  return (
                    <div
                      key={slot.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleSlotDrop(slot.id, 'home')}
                      onClick={() => {
                        if (userRole === 'admin') {
                          if (selectedPlayer && selectedPlayer.side === 'home') {
                            handleAssignPlayerToSlot(slot.id, selectedPlayer.id, 'home');
                          } else {
                            setSelectedSlot(isSelected ? null : { id: slot.id, side: 'home' });
                          }
                        }
                      }}
                      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}
                      className="absolute z-20 flex flex-col items-center cursor-pointer group"
                    >
                      <div
                        className={`relative w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all border sm:border-2 md:border-3 ${
                          assignedPlayer
                            ? 'bg-blue-950 border-white text-white ring-1.5 sm:ring-2 md:ring-3 ring-blue-500'
                            : isSelected
                            ? 'bg-amber-500 border-amber-200 text-slate-950 ring-2 sm:ring-4 ring-amber-400 scale-105'
                            : 'bg-slate-950/85 border-dashed border border-blue-400 text-blue-200 hover:scale-105'
                        }`}
                      >
                        {assignedPlayer ? (
                          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                            {assignedPlayer.photoUrl ? (
                              <img src={assignedPlayer.photoUrl} alt={assignedPlayer.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] sm:text-sm font-black text-white">#{assignedPlayer.jerseyNumber || assignedPlayer.name.charAt(0)}</span>
                            )}
                            <div className="absolute bottom-0 right-0 bg-blue-950 text-white text-[6px] sm:text-[8px] font-black px-0.5 sm:px-1 rounded-tl border-t border-l border-blue-700">
                              #{assignedPlayer.jerseyNumber || '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="font-black text-[8px] sm:text-[10px] md:text-xs text-blue-300">{slot.label}</span>
                        )}

                        {isServer && (
                          <div
                            title="Jugador al Saque (Zona 1)"
                            className="absolute -top-1 -left-1 text-[8px] sm:text-[10px] bg-amber-400 text-slate-950 font-black px-1 py-0.1 sm:px-1.5 sm:py-0.2 rounded-full shadow-lg border border-amber-200 animate-bounce"
                          >
                            🏐
                          </div>
                        )}

                        {userRole === 'admin' && assignedPlayer && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromSlot(slot.id, 'home');
                            }}
                            className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shadow hover:bg-red-500"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <div className="mt-0.5 bg-slate-950/95 border border-slate-700/80 px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-full shadow-md max-w-[55px] sm:max-w-[100px] pointer-events-none text-center">
                        <p className="text-[7px] sm:text-[9px] font-bold text-white truncate tracking-tight">
                          {assignedPlayer ? assignedPlayer.name.split(' ')[0] : slot.roleName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Drawer (Desktop): Convocados Eq. B */}
            <div className="hidden xl:block xl:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl shrink-0">{currentMatch.awayTeamLogo}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-red-400 truncate">{currentMatch.awayTeamName}</h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded-lg border border-red-800">
                    {awayConvocados.length}
                  </span>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setAddPlayerModalSide('away')}
                      title="Gestionar convocatoria"
                      className="p-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs shadow"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
                {awayConvocados.map((player) => {
                  const isAssigned = awaySlots.some((s) => s.playerId === player.id);
                  const assignedSlot = awaySlots.find((s) => s.playerId === player.id);

                  return (
                    <div
                      key={player.id}
                      draggable={userRole === 'admin'}
                      onDragStart={(e) => handleDragStart(e, player.id, 'away')}
                      onClick={() => {
                        if (userRole === 'admin') {
                          if (selectedSlot?.side === 'away') {
                            handleAssignPlayerToSlot(selectedSlot.id, player.id, 'away');
                          } else {
                            setSelectedPlayer({ id: player.id, side: 'away' });
                          }
                        }
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isAssigned
                          ? 'bg-red-950/30 border-red-900/60 text-slate-200'
                          : selectedSlot?.side === 'away' || selectedPlayer?.id === player.id
                          ? 'bg-red-900/50 border-red-400 ring-2 ring-red-400 text-white cursor-pointer'
                          : 'bg-slate-950/90 border-slate-800/90 hover:bg-slate-800/80 cursor-grab text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-red-500/70 bg-red-950 flex items-center justify-center font-bold text-xs shadow">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-red-200">#{player.jerseyNumber || player.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{player.name}</p>
                          <p className="text-[11px] text-red-300 truncate">{player.position}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isAssigned ? (
                          <span className="text-[10px] font-mono font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded-md border border-red-800">
                            {assignedSlot?.label}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Banca</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: PERSONALIZACIÓN TÁCTICA DEL EQUIPO A (LISTA + CANCHA AL COSTADO) */}
      {/* ========================================================================= */}
      {activeViewTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start animate-fadeIn">
          {/* Columna Izquierda: Lista de Jugadores de Equipo A */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl sm:text-2xl">{currentMatch.homeTeamLogo}</span>
                <h3 className="text-sm sm:text-base font-bold text-blue-400 truncate">
                  {currentMatch.homeTeamName}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold text-blue-300 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-800">
                  {homeConvocados.length} Convocados
                </span>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setAddPlayerModalSide('home')}
                    className="px-2 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1 shadow transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Convocar</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of players for Team A with prominent circular avatars */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {homeConvocados.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-slate-400 italic">
                    Sin jugadores convocados en este equipo.
                  </p>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setAddPlayerModalSide('home')}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg inline-flex items-center gap-1.5 shadow"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Añadir Jugadores</span>
                    </button>
                  )}
                </div>
              ) : (
                homeConvocados.map((player) => {
                  const assignedSlot = homeSlots.find((s) => s.playerId === player.id);
                  const isAssigned = !!assignedSlot;
                  const isSelected = selectedPlayer?.id === player.id;
                  const isSlotTarget = selectedSlot?.side === 'home';

                  return (
                    <div
                      key={player.id}
                      draggable={userRole === 'admin'}
                      onDragStart={(e) => handleDragStart(e, player.id, 'home')}
                      onClick={() => {
                        if (userRole === 'admin') {
                          if (selectedSlot?.side === 'home') {
                            handleAssignPlayerToSlot(selectedSlot.id, player.id, 'home');
                          } else if (!isAssigned) {
                            setSelectedPlayer(isSelected ? null : { id: player.id, side: 'home' });
                          }
                        }
                      }}
                      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
                        isAssigned
                          ? 'bg-blue-950/30 border-blue-800/70 text-white'
                          : isSelected
                          ? 'bg-blue-900/60 border-blue-400 ring-2 ring-blue-400 text-white cursor-pointer'
                          : isSlotTarget
                          ? 'bg-blue-950/60 border-blue-500/80 text-white cursor-pointer'
                          : 'bg-slate-950/85 border-slate-800/90 hover:bg-slate-800/80 cursor-pointer text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Generous circular photo avatar */}
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-blue-500/70 bg-blue-950 flex items-center justify-center font-bold text-sm shadow-md">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-blue-200 font-bold">#{player.jerseyNumber || player.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{player.name}</p>
                          <p className="text-[11px] text-blue-300 truncate font-medium">{player.position}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isAssigned ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-mono font-bold text-blue-300 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-700">
                              {assignedSlot?.label}
                            </span>
                            {userRole === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromSlot(assignedSlot.id, 'home');
                                }}
                                title="Enviar a la banca"
                                className="p-1 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-950/40"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {userRole === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAssignToFirstEmpty(player.id, 'home');
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow transition-colors"
                              >
                                + Alinear
                              </button>
                            )}
                            <span className="text-[11px] text-slate-500 font-medium">Banca</span>
                          </div>
                        )}

                        {/* Admin remove player from roster (desconvocar) */}
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePlayerFromTeamRoster('home', player.id);
                            }}
                            title="Desconvocar de este equipo"
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer: Auto-Complete only if Admin */}
            {userRole === 'admin' ? (
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-400 text-xs">Toca un jugador o espacio vacío</span>
                <button
                  onClick={() => handleAutoAssignTeam('home')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Completar</span>
                </button>
              </div>
            ) : (
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-500">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Plantel oficial convocado para este encuentro</span>
              </div>
            )}
          </div>

          {/* Columna Derecha: Alineación Gráfica al Costado para Equipo A */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
            {/* Controls Bar with ample spacing */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-300 font-bold whitespace-nowrap">
                  Formación:
                </span>
                <select
                  value={homeFormationId}
                  onChange={(e) => handleHomeFormationChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons on top right */}
              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleClearTeam('home')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 rounded-lg border border-rose-800/60 transition-colors shadow"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setActiveViewTab('full')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Ver Cancha Completa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Specialized Volleyball Rotation Tracker Bar */}
            {currentSport === 'voley' && (
              <div className="bg-slate-950 border border-blue-900/60 p-2.5 rounded-xl space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleRotateVolleyballTeam('home', 'prev')}
                      title="Rotación Anterior (R-1)"
                      className="p-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}

                  {userRole === 'admin' ? (
                    <button
                      onClick={() => handleRotateVolleyballTeam('home', 'next')}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <RotateCw className="w-4 h-4 text-slate-950" />
                      <span>Siguiente Rotación (R{homeRotation})</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-1.5 px-3 text-center text-xs sm:text-sm font-bold text-amber-300 bg-slate-900 rounded-xl">
                      Rotación Actual: R{homeRotation}
                    </div>
                  )}

                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleRotateVolleyballTeam('home', 'next')}
                      title="Siguiente Rotación (R+1)"
                      className="p-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Direct Rotations Selector Pills */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <span className="text-xs text-slate-400 font-bold shrink-0">Fase de Rotación:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[1, 2, 3, 4, 5, 6].map((rotNum) => (
                      <button
                        key={rotNum}
                        onClick={() => handleSetDirectVolleyballRotation('home', rotNum)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                          homeRotation === rotNum
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300 font-black scale-105'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        R{rotNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Individual Pitch Graphic with Generous Tokens */}
            <div className="relative w-full max-w-lg mx-auto aspect-[9/11.5] rounded-3xl overflow-hidden border-3 sm:border-4 border-blue-900/70 shadow-2xl select-none">
              {currentSport === 'futbol' ? (
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,#000_0px,#000_32px,transparent_32px,transparent_64px)]" />
                  <div className="absolute inset-3 sm:inset-4 border-2 border-white/70 rounded-sm pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-20 sm:h-24 border-2 border-b-0 border-white/70">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-8 sm:h-10 border-2 border-b-0 border-white/70" />
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 border-2 border-t-0 border-white/70 rounded-b-full" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-amber-600 to-amber-700 overflow-hidden p-3.5 bg-sky-950/80">
                  <div className="relative w-full h-full bg-amber-600 border-2 border-white rounded-sm">
                    <div className="absolute top-0 left-0 right-0 h-2.5 bg-white shadow flex items-center justify-center">
                      <span className="text-[9px] font-black text-red-600 uppercase bg-white px-2.5 rounded">RED / NET</span>
                    </div>
                    <div className="absolute top-[35%] left-0 right-0 border-t-2 border-dashed border-white/90 pr-2 flex justify-end">
                      <span className="text-[8px] text-white font-bold bg-amber-900/90 px-1.5 rounded">3m</span>
                    </div>
                    <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-amber-200 bg-black/60 px-2 py-0.5 rounded">
                      Rotación R{homeRotation}
                    </div>
                  </div>
                </div>
              )}

              {/* Render Team A Slots */}
              {homeSlots.map((slot, index) => {
                const assignedPlayer = players.find((p) => p.id === slot.playerId);
                const singlePos = homeSingleSlots[index] || slot;
                const isSelected = selectedSlot?.id === slot.id && selectedSlot?.side === 'home';
                const isServer = currentSport === 'voley' && slot.label === 'Z1';
                const dynamicRoleName =
                  currentSport === 'voley'
                    ? getVolleyballZoneRole(slot.label, homeActiveFormation.system, homeRotation)
                    : slot.roleName;

                return (
                  <div
                    key={slot.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleSlotDrop(slot.id, 'home')}
                    onClick={() => {
                      if (userRole === 'admin') {
                        if (selectedPlayer && selectedPlayer.side === 'home') {
                          handleAssignPlayerToSlot(slot.id, selectedPlayer.id, 'home');
                        } else {
                          setSelectedSlot(isSelected ? null : { id: slot.id, side: 'home' });
                        }
                      }
                    }}
                    style={{ left: `${singlePos.x}%`, top: `${singlePos.y}%`, transform: 'translate(-50%, -50%)' }}
                    className="absolute z-20 flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className={`relative w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all border-3 ${
                        assignedPlayer
                          ? 'bg-blue-950 border-white text-white ring-3 sm:ring-4 ring-blue-500 hover:scale-105'
                          : isSelected
                          ? 'bg-amber-500 border-amber-200 text-slate-950 ring-4 ring-amber-400 scale-110'
                          : 'bg-slate-950/85 border-dashed border-2 border-blue-400 text-blue-200 hover:scale-105 hover:border-white'
                      }`}
                    >
                      {assignedPlayer ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                          {assignedPlayer.photoUrl ? (
                            <img src={assignedPlayer.photoUrl} alt={assignedPlayer.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base sm:text-lg font-black text-white">#{assignedPlayer.jerseyNumber || assignedPlayer.name.charAt(0)}</span>
                          )}
                          <div className="absolute bottom-0 right-0 bg-blue-950 text-white text-[8px] sm:text-[10px] font-black px-1.5 rounded-tl border-t border-l border-blue-700">
                            #{assignedPlayer.jerseyNumber || '—'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center leading-none">
                          <Plus className="w-4 h-4 text-blue-300" />
                          <span className="font-black text-xs text-blue-200">{slot.label}</span>
                        </div>
                      )}

                      {isServer && (
                        <div
                          title="Jugador al Saque (Zona 1)"
                          className="absolute -top-2 -left-2 text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full shadow-lg border border-amber-200 animate-bounce"
                        >
                          🏐 Saque
                        </div>
                      )}

                      {userRole === 'admin' && assignedPlayer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromSlot(slot.id, 'home');
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg hover:bg-red-500"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="mt-1 bg-slate-950/95 border border-blue-800 px-2.5 py-0.5 rounded-full shadow-lg max-w-[95px] sm:max-w-[125px] pointer-events-none text-center">
                      <p className="text-[9px] sm:text-[11px] font-bold text-white truncate tracking-tight">
                        {assignedPlayer ? assignedPlayer.name : dynamicRoleName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: PERSONALIZACIÓN TÁCTICA DEL EQUIPO B (LISTA + CANCHA AL COSTADO) */}
      {/* ========================================================================= */}
      {activeViewTab === 'away' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start animate-fadeIn">
          {/* Columna Izquierda: Lista de Jugadores de Equipo B */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl sm:text-2xl">{currentMatch.awayTeamLogo}</span>
                <h3 className="text-sm sm:text-base font-bold text-red-400 truncate">
                  {currentMatch.awayTeamName}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono font-bold text-red-300 bg-red-950 px-2.5 py-1 rounded-lg border border-red-800">
                  {awayConvocados.length} Convocados
                </span>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setAddPlayerModalSide('away')}
                    className="px-2 py-1 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1 shadow transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Convocar</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of players for Team B with prominent circular avatars */}
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {awayConvocados.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <p className="text-sm text-slate-400 italic">
                    Sin jugadores convocados en este equipo.
                  </p>
                  {userRole === 'admin' && (
                    <button
                      onClick={() => setAddPlayerModalSide('away')}
                      className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg inline-flex items-center gap-1.5 shadow"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Añadir Jugadores</span>
                    </button>
                  )}
                </div>
              ) : (
                awayConvocados.map((player) => {
                  const assignedSlot = awaySlots.find((s) => s.playerId === player.id);
                  const isAssigned = !!assignedSlot;
                  const isSelected = selectedPlayer?.id === player.id;
                  const isSlotTarget = selectedSlot?.side === 'away';

                  return (
                    <div
                      key={player.id}
                      draggable={userRole === 'admin'}
                      onDragStart={(e) => handleDragStart(e, player.id, 'away')}
                      onClick={() => {
                        if (userRole === 'admin') {
                          if (selectedSlot?.side === 'away') {
                            handleAssignPlayerToSlot(selectedSlot.id, player.id, 'away');
                          } else if (!isAssigned) {
                            setSelectedPlayer(isSelected ? null : { id: player.id, side: 'away' });
                          }
                        }
                      }}
                      className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all ${
                        isAssigned
                          ? 'bg-red-950/30 border-red-800/70 text-white'
                          : isSelected
                          ? 'bg-red-900/60 border-red-400 ring-2 ring-red-400 text-white cursor-pointer'
                          : isSlotTarget
                          ? 'bg-red-950/60 border-red-500/80 text-white cursor-pointer'
                          : 'bg-slate-950/85 border-slate-800/90 hover:bg-slate-800/80 cursor-pointer text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Generous circular photo avatar */}
                        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-red-500/70 bg-red-950 flex items-center justify-center font-bold text-sm shadow-md">
                          {player.photoUrl ? (
                            <img src={player.photoUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-red-200 font-bold">#{player.jerseyNumber || player.name.charAt(0)}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{player.name}</p>
                          <p className="text-[11px] text-red-300 truncate font-medium">{player.position}</p>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {isAssigned ? (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-mono font-bold text-red-300 bg-red-950 px-2 py-0.5 rounded-md border border-red-700">
                              {assignedSlot?.label}
                            </span>
                            {userRole === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromSlot(assignedSlot.id, 'away');
                                }}
                                title="Enviar a la banca"
                                className="p-1 text-slate-400 hover:text-red-400 rounded-md hover:bg-red-950/40"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            {userRole === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAssignToFirstEmpty(player.id, 'away');
                                }}
                                className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow transition-colors"
                              >
                                + Alinear
                              </button>
                            )}
                            <span className="text-[11px] text-slate-500 font-medium">Banca</span>
                          </div>
                        )}

                        {/* Admin remove player from roster (desconvocar) */}
                        {userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePlayerFromTeamRoster('away', player.id);
                            }}
                            title="Desconvocar de este equipo"
                            className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-950/40 transition-colors"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer: Auto-Complete only if Admin */}
            {userRole === 'admin' ? (
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="text-slate-400 text-xs">Toca un jugador o espacio vacío</span>
                <button
                  onClick={() => handleAutoAssignTeam('away')}
                  className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Completar</span>
                </button>
              </div>
            ) : (
              <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-500">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Plantel oficial convocado para este encuentro</span>
              </div>
            )}
          </div>

          {/* Columna Derecha: Alineación Gráfica al Costado para Equipo B */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl space-y-3">
            {/* Controls Bar with ample spacing */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-300 font-bold whitespace-nowrap">
                  Formación:
                </span>
                <select
                  value={awayFormationId}
                  onChange={(e) => handleAwayFormationChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                >
                  {formations.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons on top right */}
              <div className="flex items-center gap-2">
                {userRole === 'admin' && (
                  <button
                    onClick={() => handleClearTeam('away')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 rounded-lg border border-rose-800/60 transition-colors shadow"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setActiveViewTab('full')}
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Ver Cancha Completa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Specialized Volleyball Rotation Tracker Bar */}
            {currentSport === 'voley' && (
              <div className="bg-slate-950 border border-red-900/60 p-2.5 rounded-xl space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between gap-2">
                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleRotateVolleyballTeam('away', 'prev')}
                      title="Rotación Anterior (R-1)"
                      className="p-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}

                  {userRole === 'admin' ? (
                    <button
                      onClick={() => handleRotateVolleyballTeam('away', 'next')}
                      className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <RotateCw className="w-4 h-4 text-slate-950" />
                      <span>Siguiente Rotación (R{awayRotation})</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-1.5 px-3 text-center text-xs sm:text-sm font-bold text-amber-300 bg-slate-900 rounded-xl">
                      Rotación Actual: R{awayRotation}
                    </div>
                  )}

                  {userRole === 'admin' && (
                    <button
                      onClick={() => handleRotateVolleyballTeam('away', 'next')}
                      title="Siguiente Rotación (R+1)"
                      className="p-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Direct Rotations Selector Pills */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900">
                  <span className="text-xs text-slate-400 font-bold shrink-0">Fase de Rotación:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {[1, 2, 3, 4, 5, 6].map((rotNum) => (
                      <button
                        key={rotNum}
                        onClick={() => handleSetDirectVolleyballRotation('away', rotNum)}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center ${
                          awayRotation === rotNum
                            ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-300 font-black scale-105'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        R{rotNum}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Individual Pitch Graphic with Generous Tokens */}
            <div className="relative w-full max-w-lg mx-auto aspect-[9/11.5] rounded-3xl overflow-hidden border-3 sm:border-4 border-red-900/70 shadow-2xl select-none">
              {currentSport === 'futbol' ? (
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,#000_0px,#000_32px,transparent_32px,transparent_64px)]" />
                  <div className="absolute inset-3 sm:inset-4 border-2 border-white/70 rounded-sm pointer-events-none">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-20 sm:h-24 border-2 border-b-0 border-white/70">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-8 sm:h-10 border-2 border-b-0 border-white/70" />
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/70" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-12 border-2 border-t-0 border-white/70 rounded-b-full" />
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-amber-600 to-amber-700 overflow-hidden p-3.5 bg-sky-950/80">
                  <div className="relative w-full h-full bg-amber-600 border-2 border-white rounded-sm">
                    <div className="absolute top-0 left-0 right-0 h-2.5 bg-white shadow flex items-center justify-center">
                      <span className="text-[9px] font-black text-red-600 uppercase bg-white px-2.5 rounded">RED / NET</span>
                    </div>
                    <div className="absolute top-[35%] left-0 right-0 border-t-2 border-dashed border-white/90 pr-2 flex justify-end">
                      <span className="text-[8px] text-white font-bold bg-amber-900/90 px-1.5 rounded">3m</span>
                    </div>
                    <div className="absolute bottom-1.5 left-2 text-[10px] font-bold text-amber-200 bg-black/60 px-2 py-0.5 rounded">
                      Rotación R{awayRotation}
                    </div>
                  </div>
                </div>
              )}

              {/* Render Team B Slots */}
              {awaySlots.map((slot, index) => {
                const assignedPlayer = players.find((p) => p.id === slot.playerId);
                const singlePos = awaySingleSlots[index] || slot;
                const isSelected = selectedSlot?.id === slot.id && selectedSlot?.side === 'away';
                const isServer = currentSport === 'voley' && slot.label === 'Z1';
                const dynamicRoleName =
                  currentSport === 'voley'
                    ? getVolleyballZoneRole(slot.label, awayActiveFormation.system, awayRotation)
                    : slot.roleName;

                return (
                  <div
                    key={slot.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleSlotDrop(slot.id, 'away')}
                    onClick={() => {
                      if (userRole === 'admin') {
                        if (selectedPlayer && selectedPlayer.side === 'away') {
                          handleAssignPlayerToSlot(slot.id, selectedPlayer.id, 'away');
                        } else {
                          setSelectedSlot(isSelected ? null : { id: slot.id, side: 'away' });
                        }
                      }
                    }}
                    style={{ left: `${singlePos.x}%`, top: `${singlePos.y}%`, transform: 'translate(-50%, -50%)' }}
                    className="absolute z-20 flex flex-col items-center cursor-pointer group"
                  >
                    <div
                      className={`relative w-13 h-13 sm:w-15 sm:h-15 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold shadow-2xl transition-all border-3 ${
                        assignedPlayer
                          ? 'bg-red-950 border-white text-white ring-3 sm:ring-4 ring-red-500 hover:scale-105'
                          : isSelected
                          ? 'bg-amber-500 border-amber-200 text-slate-950 ring-4 ring-amber-400 scale-110'
                          : 'bg-slate-950/85 border-dashed border-2 border-red-400 text-red-200 hover:scale-105 hover:border-white'
                      }`}
                    >
                      {assignedPlayer ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                          {assignedPlayer.photoUrl ? (
                            <img src={assignedPlayer.photoUrl} alt={assignedPlayer.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-base sm:text-lg font-black text-white">#{assignedPlayer.jerseyNumber || assignedPlayer.name.charAt(0)}</span>
                          )}
                          <div className="absolute bottom-0 right-0 bg-red-950 text-white text-[8px] sm:text-[10px] font-black px-1.5 rounded-tl border-t border-l border-red-700">
                            #{assignedPlayer.jerseyNumber || '—'}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center leading-none">
                          <Plus className="w-4 h-4 text-red-300" />
                          <span className="font-black text-xs text-red-200">{slot.label}</span>
                        </div>
                      )}

                      {isServer && (
                        <div
                          title="Jugador al Saque (Zona 1)"
                          className="absolute -top-2 -left-2 text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full shadow-lg border border-amber-200 animate-bounce"
                        >
                          🏐 Saque
                        </div>
                      )}

                      {userRole === 'admin' && assignedPlayer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromSlot(slot.id, 'away');
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-lg hover:bg-red-500"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="mt-1 bg-slate-950/95 border border-red-800 px-2.5 py-0.5 rounded-full shadow-lg max-w-[95px] sm:max-w-[125px] pointer-events-none text-center">
                      <p className="text-[9px] sm:text-[11px] font-bold text-white truncate tracking-tight">
                        {assignedPlayer ? assignedPlayer.name : dynamicRoleName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONVOCAR JUGADORES AL EQUIPO (Añadir a la lista de convocados) */}
      {/* ========================================================================= */}
      {addPlayerModalSide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {addPlayerModalSide === 'home' ? currentMatch.homeTeamLogo : currentMatch.awayTeamLogo}
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Convocar a {addPlayerModalSide === 'home' ? currentMatch.homeTeamName : currentMatch.awayTeamName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Añade jugadores del plantel de {currentSport === 'futbol' ? 'Fútbol' : 'Vóley'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setAddPlayerModalSide(null);
                  setPlayerSearchQuery('');
                }}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={playerSearchQuery}
                onChange={(e) => setPlayerSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o posición..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Candidates list */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                const candidates = addPlayerModalSide === 'home' ? availableToAddToHome : availableToAddToAway;
                const filtered = candidates.filter((p) =>
                  p.name.toLowerCase().includes(playerSearchQuery.toLowerCase()) ||
                  p.position.toLowerCase().includes(playerSearchQuery.toLowerCase())
                );

                if (filtered.length === 0) {
                  return (
                    <p className="text-xs text-slate-500 italic text-center py-6">
                      No hay más jugadores disponibles para convocar en este deporte.
                    </p>
                  );
                }

                return filtered.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-700 bg-slate-900 flex items-center justify-center font-bold text-xs">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt={player.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span>#{player.jerseyNumber || player.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{player.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{player.position}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddPlayerToTeamRoster(addPlayerModalSide, player.id)}
                      className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 shadow transition-colors shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Convocar</span>
                    </button>
                  </div>
                ));
              })()}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setAddPlayerModalSide(null);
                  setPlayerSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
