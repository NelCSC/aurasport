'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  X,
  Shield,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import { generateFollowerShareUrl, getSpaceDisplayName } from '@/lib/spaceManager';
import { UserRole, SportType } from '@/types/sports';

interface SpaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSpaceId: string;
  onSelectSpace?: (spaceId: string) => void;
  userRole: UserRole;
  adminEmail?: string;
  currentSport?: SportType;
  activeTab?: string;
  selectedTacticalMatchId?: string | null;
}

export const SpaceSelectorModal: React.FC<SpaceSelectorModalProps> = ({
  isOpen,
  onClose,
  activeSpaceId,
  userRole,
  adminEmail,
  currentSport = 'futbol',
  activeTab = 'dashboard',
  selectedTacticalMatchId = null,
}) => {
  const [copied, setCopied] = useState(false);

  // Lock background scroll when the modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Deep-link to the exact sport and tab currently open
  const shareUrl = generateFollowerShareUrl(activeSpaceId, {
    sport: currentSport,
    tab: activeTab,
    matchId: selectedTacticalMatchId,
  });

  const currentSpaceName = getSpaceDisplayName(activeSpaceId, adminEmail);
  const isAdmin = userRole === 'admin';

  const sportName = currentSport === 'voley' ? 'Vóley' : 'Fútbol';
  const tabNameMap: Record<string, string> = {
    dashboard: 'Panel Principal & Marcador en Vivo',
    tactical: 'Pizarra Táctica y Alineaciones',
    players: 'Plantilla de Jugadores',
    tournaments: 'Torneos, Fixture y Posiciones',
  };
  const activeTabName = tabNameMap[activeTab] || 'Sección General';

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏆 ¡Sigue en vivo la sección "${activeTabName}" (${sportName}) de nuestra liga "${currentSpaceName}" en AuraSport PRO!\n\nIngresa directamente aquí: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150 overscroll-contain">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0 ${
                isAdmin
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isAdmin ? <Shield className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                {isAdmin ? 'Mi Espacio de Administración' : 'Información de la Liga'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {isAdmin
                  ? 'Gestión aislada y enlace exclusivo para tus seguidores'
                  : 'Estás consultando la programación oficial de esta liga'}
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
          {/* Active League Info & Sharing Tools */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Liga Activa en Pantalla
                </span>
                <h4 className="text-base sm:text-lg font-black text-white mt-1.5">{currentSpaceName}</h4>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px] sm:max-w-none">
                  Identificador: {activeSpaceId}
                </p>
              </div>

              {isAdmin ? (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-700/50 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                  <Shield className="w-3.5 h-3.5" />
                  Organizador
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  Modo Veedor
                </span>
              )}
            </div>

            {/* Follower link box */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {isAdmin
                      ? 'Enlace directo a esta sección para tus seguidores:'
                      : 'Comparte esta sección con otros seguidores o integrantes:'}
                  </span>
                </label>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-semibold text-emerald-300">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>
                    {activeTabName} · <strong className="text-white">{sportName}</strong>
                  </span>
                </div>
              </div>

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
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors shrink-0 active:scale-95"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Veedor View Notice */}
          {!isAdmin ? (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Acceso Oficial en Tiempo Real</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Estás visualizando los encuentros, tablas de posiciones y estadísticas exclusivas de{' '}
                <strong className="text-white">{currentSpaceName}</strong>.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Cada evento, gol, punto y cambio táctico se actualiza de manera instantánea mediante Supabase según lo gestionado por el organizador.
              </p>
            </div>
          ) : (
            /* Admin Workspace Information */
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Shield className="w-4 h-4" />
                <span>Aislamiento Total de tu Liga</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tus veedores solo pueden ver las actividades de esta liga oficial. Tus jugadores registrados, fixture y partidos permanecen 100% aislados y protegidos.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sincronización multi-dispositivo activa.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
