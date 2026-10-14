'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Share2,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageCircle,
  X,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AdminSpaceInfo, generateFollowerShareUrl, getSpaceDisplayName } from '@/lib/spaceManager';
import { fetchAvailableAdminSpaces } from '@/lib/syncManager';
import { UserRole } from '@/types/sports';

interface SpaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSpaceId: string;
  onSelectSpace: (spaceId: string) => void;
  userRole: UserRole;
  adminEmail?: string;
}

export const SpaceSelectorModal: React.FC<SpaceSelectorModalProps> = ({
  isOpen,
  onClose,
  activeSpaceId,
  onSelectSpace,
  userRole,
  adminEmail,
}) => {
  const [spaces, setSpaces] = useState<AdminSpaceInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);

    fetchAvailableAdminSpaces()
      .then((data) => {
        if (isMounted) {
          setSpaces(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const shareUrl = generateFollowerShareUrl(activeSpaceId);
  const currentSpaceName = getSpaceDisplayName(activeSpaceId, adminEmail);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏆 ¡Sigue en vivo todos los partidos, fixture y tabla de posiciones de nuestra liga en AuraSport!\n\nIngresa aquí: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInput.trim();
    if (!clean) return;

    let targetId = clean;
    if (clean.includes('@')) {
      targetId = `space_${clean.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    }
    onSelectSpace(targetId);
    onClose();
  };

  const filteredSpaces = spaces.filter((s) => {
    const query = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Espacios de Ligas & Torneos</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Gestión separada y vista pública exclusiva para seguidores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Active Space Banner & Sharing Tools */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Espacio Activo
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white mt-1">{currentSpaceName}</h4>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px] sm:max-w-none">
                  ID: {activeSpaceId}
                </p>
              </div>

              {userRole === 'admin' && (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-700/50 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                  <Shield className="w-3 h-3" />
                  Admin
                </span>
              )}
            </div>

            {/* Follower link box */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enlace exclusivo para tus seguidores o jugadores:</span>
              </label>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono truncate">
                  {shareUrl}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  title="Compartir en WhatsApp"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Connect by Admin Email or Code */}
          <form onSubmit={handleCustomSubmit} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Conectar a una Liga por Correo o Código de Admin
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ej. admin@copaperu.com o space_..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-colors shrink-0"
              >
                Cargar
              </button>
            </div>
          </form>

          {/* Available Spaces List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Ligas & Organizadores Registrados en Supabase
              </label>
              <span className="text-[11px] text-slate-400">
                {filteredSpaces.length} espacio{filteredSpaces.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nombre o identificador..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <span className="inline-block animate-spin mr-2">⚙️</span>
                  Cargando espacios desde Supabase...
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/50 rounded-xl border border-slate-800/60">
                  No se encontraron espacios coincidentes. Puedes crear uno iniciando sesión como nuevo Admin.
                </div>
              ) : (
                filteredSpaces.map((s) => {
                  const isSelected = s.id === activeSpaceId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        onSelectSpace(s.id);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{s.name}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                              Actual
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{s.id}</p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                        <div className="flex items-center gap-1" title="Torneos registrados">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          <span>{s.tournamentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Partidos programados">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span>{s.matchesCount}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Los seguidores solo pueden ver los eventos del espacio activo.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
