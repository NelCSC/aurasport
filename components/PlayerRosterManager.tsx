'use client';

import React, { useState } from 'react';
import { Player, SportType, UserRole, PlayerPosition } from '@/types/sports';
import { FOOTBALL_POSITIONS, VOLLEYBALL_POSITIONS, formatWhatsAppLink } from '@/lib/sports-helpers';
import {
  UserPlus,
  Search,
  MessageCircle,
  Star,
  Trophy,
  Filter,
  Upload,
  Trash2,
  Edit2,
  X,
  Check,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface PlayerRosterManagerProps {
  currentSport: SportType;
  players: Player[];
  userRole: UserRole;
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (playerId: string) => void;
}

export const PlayerRosterManager: React.FC<PlayerRosterManagerProps> = ({
  currentSport,
  players,
  userRole,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSport, setFormSport] = useState<SportType>(currentSport);
  const [formPosition, setFormPosition] = useState<PlayerPosition>(
    currentSport === 'futbol' ? FOOTBALL_POSITIONS[0] : VOLLEYBALL_POSITIONS[0]
  );
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formSkillRating, setFormSkillRating] = useState(5);
  const [formJerseyNumber, setFormJerseyNumber] = useState<number | ''>(10);
  const [formIsAvailable, setFormIsAvailable] = useState(true);

  // Position choices
  const availablePositions = formSport === 'futbol' ? FOOTBALL_POSITIONS : VOLLEYBALL_POSITIONS;

  const openCreateModal = () => {
    setEditingPlayer(null);
    setFormName('');
    setFormPhone('+51 9');
    setFormSport(currentSport);
    setFormPosition(currentSport === 'futbol' ? FOOTBALL_POSITIONS[0] : VOLLEYBALL_POSITIONS[0]);
    setFormPhotoUrl('');
    setFormSkillRating(5);
    setFormJerseyNumber(7);
    setFormIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    setFormName(player.name);
    setFormPhone(player.phone);
    setFormSport(player.sport);
    setFormPosition(player.position);
    setFormPhotoUrl(player.photoUrl);
    setFormSkillRating(player.skillRating);
    setFormJerseyNumber(player.jerseyNumber || '');
    setFormIsAvailable(player.isAvailable ?? true);
    setIsModalOpen(true);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    if (editingPlayer) {
      const updated: Player = {
        ...editingPlayer,
        name: formName.trim(),
        phone: formPhone.trim(),
        sport: formSport,
        position: formPosition,
        photoUrl: formPhotoUrl || editingPlayer.photoUrl,
        skillRating: Number(formSkillRating),
        jerseyNumber: formJerseyNumber === '' ? undefined : Number(formJerseyNumber),
        isAvailable: formIsAvailable,
      };
      onUpdatePlayer(updated);
    } else {
      const newPlayer: Player = {
        id: `p-${Date.now()}`,
        name: formName.trim(),
        phone: formPhone.trim(),
        sport: formSport,
        position: formPosition,
        photoUrl:
          formPhotoUrl ||
          `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?auto=format&fit=crop&w=300&q=80`,
        skillRating: Number(formSkillRating),
        jerseyNumber: formJerseyNumber === '' ? undefined : Number(formJerseyNumber),
        isAvailable: formIsAvailable,
        createdAt: new Date().toISOString().split('T')[0],
        stats: {
          matchesPlayed: 0,
          matchesWon: 0,
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          aces: 0,
          blocks: 0,
          effectiveAttacks: 0,
          mvpCount: 0,
          ratingAverage: formSkillRating,
        },
      };
      onAddPlayer(newPlayer);
    }
    setIsModalOpen(false);
  };

  // Filter players
  const filteredPlayers = players.filter((player) => {
    if (player.sport !== currentSport) return false;
    if (filterPosition !== 'all' && player.position !== filterPosition) return false;
    if (filterAvailability === 'available' && player.isAvailable === false) return false;
    if (filterAvailability === 'unavailable' && player.isAvailable !== false) return false;
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      return (
        player.name.toLowerCase().includes(term) ||
        player.phone.toLowerCase().includes(term) ||
        player.position.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Search & Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Buscar participante de ${currentSport === 'futbol' ? 'Fútbol' : 'Vóley'} por nombre o celular...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {userRole === 'admin' ? (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Participante</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Padrón General de Participantes</span>
            </span>
          )}
        </div>
      </div>

      {/* Info notice banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Bolsa de Jugadores Libres:</strong> Los participantes registrados quedan disponibles para ser jalados y armar los equipos en cada encuentro programado.
          </span>
        </div>
        <span className="text-slate-400 font-mono shrink-0 hidden md:inline">
          {filteredPlayers.length} Disponibles
        </span>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filtrar:</span>
        </div>

        {/* Position filter */}
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Todas las Posiciones</option>
          {(currentSport === 'futbol' ? FOOTBALL_POSITIONS : VOLLEYBALL_POSITIONS).map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        {/* Availability filter */}
        <select
          value={filterAvailability}
          onChange={(e) => setFilterAvailability(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">Todos los Estados</option>
          <option value="available">Solo Convocables</option>
          <option value="unavailable">No Disponibles</option>
        </select>

        <span className="text-slate-500 ml-auto">
          Mostrando {filteredPlayers.length} de {players.filter((p) => p.sport === currentSport).length} participantes
        </span>
      </div>

      {/* Players Cards Grid */}
      {filteredPlayers.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <p className="text-sm font-medium text-slate-400">No se encontraron jugadores con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => {
            const waUrl = formatWhatsAppLink(player.phone, player.name, player.sport);

            return (
              <div
                key={player.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700 hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar: Avatar & Name */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 shrink-0">
                        {player.photoUrl ? (
                          <img
                            src={player.photoUrl}
                            alt={player.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-white">
                            {player.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[140px]">
                          {player.name}
                        </h4>
                        <p className="text-[11px] text-emerald-400 font-medium truncate">{player.position}</p>
                      </div>
                    </div>

                    {player.jerseyNumber && (
                      <span className="font-mono text-sm font-black text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                        #{player.jerseyNumber}
                      </span>
                    )}
                  </div>

                  {/* Availability & Skill Stars */}
                  <div className="space-y-2 text-xs text-slate-300 py-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estado:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Disponible para convocar
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Habilidad / Rating:</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < player.skillRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Key Sport Performance Metrics */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-950/70 p-2 rounded-lg text-center mt-2 border border-slate-800">
                      <div>
                        <span className="block text-[10px] text-slate-400">PJ</span>
                        <span className="font-mono font-bold text-white text-xs tabular-nums">
                          {player.stats.matchesPlayed}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">
                          {currentSport === 'futbol' ? 'Goles' : 'Aces/Pts'}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs tabular-nums">
                          {currentSport === 'futbol' ? player.stats.goals : player.stats.aces}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Victorias</span>
                        <span className="font-mono font-bold text-amber-400 text-xs tabular-nums">
                          {player.stats.matchesWon}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Footer: WhatsApp & Admin tools */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                  {/* WhatsApp contact button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Convocatoria WA</span>
                  </a>

                  {/* Admin Edit/Delete */}
                  {userRole === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(player)}
                        title="Editar Ficha"
                        className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al participante ${player.name}?`)) {
                            onDeletePlayer(player.id);
                          }
                        }}
                        title="Eliminar Participante"
                        className="p-1.5 rounded-md hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration / Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {editingPlayer ? 'Editar Participante' : 'Registrar Participante en la Bolsa General'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4 text-xs sm:text-sm">
              {/* Name */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Rodrigo Santillán"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Phone (WhatsApp) */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">Número Celular (WhatsApp) *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+51 987 654 321"
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Sport & Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Deporte Especialidad *</label>
                  <select
                    value={formSport}
                    onChange={(e) => {
                      const newSport = e.target.value as SportType;
                      setFormSport(newSport);
                      setFormPosition(newSport === 'futbol' ? FOOTBALL_POSITIONS[0] : VOLLEYBALL_POSITIONS[0]);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="futbol">⚽ Fútbol</option>
                    <option value="voley">🏐 Vóley</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Posición Específica *</label>
                  <select
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value as PlayerPosition)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {availablePositions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Jersey Number & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dorsal Preferido #</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={formJerseyNumber}
                    onChange={(e) => setFormJerseyNumber(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="10"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Foto de Perfil (Cloudinary / Preset)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formPhotoUrl}
                      onChange={(e) => setFormPhotoUrl(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sampleAvatars = [
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
                          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
                          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
                        ];
                        setFormPhotoUrl(sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)]);
                      }}
                      className="px-2.5 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Skill Rating Stars */}
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nivel de Habilidad ({formSkillRating} / 5 estrellas)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormSkillRating(star)}
                      className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= formSkillRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPlayer ? 'Guardar Cambios' : 'Registrar Participante'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
