'use client';

import React, { useState } from 'react';
import {
  Cloud,
  Smartphone,
  Monitor,
  CheckCircle2,
  RefreshCw,
  X,
  Database,
  ArrowRightLeft,
  Copy,
  Check,
  Info,
} from 'lucide-react';
import { SyncStatus } from '@/lib/syncManager';

interface SyncInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  tournamentsCount: number;
  matchesCount: number;
  playersCount: number;
  onForceSync: () => Promise<void>;
}

export const SyncInfoModal: React.FC<SyncInfoModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  lastSyncTime,
  tournamentsCount,
  matchesCount,
  playersCount,
  onForceSync,
}) => {
  const [isSyncingManual, setIsSyncingManual] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncingManual(true);
    setSyncFeedback(null);
    try {
      await onForceSync();
      setSyncFeedback('¡Datos actualizados y sincronizados con éxito desde la nube!');
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch {
      setSyncFeedback('Error al sincronizar. Revisa tu conexión a internet.');
    } finally {
      setIsSyncingManual(false);
    }
  };

  const sqlSchema = `-- Ejecuta este script en Supabase SQL Editor para sincronización en tiempo real permanente:
CREATE TABLE IF NOT EXISTS public.sportmaster_sync (
  id TEXT PRIMARY KEY DEFAULT 'global_state',
  updated_at TIMESTAMPTZ DEFAULT now(),
  tournaments JSONB,
  matches JSONB,
  players JSONB
);

-- Habilitar permisos de lectura y escritura
ALTER TABLE public.sportmaster_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura publica" ON public.sportmaster_sync FOR SELECT USING (true);
CREATE POLICY "Permitir actualizacion publica" ON public.sportmaster_sync FOR ALL USING (true);

-- Habilitar publicaciones en tiempo real de Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.sportmaster_sync;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Sincronización Multi-Dispositivo
              </h3>
              <p className="text-xs text-slate-400">
                Móvil y Escritorio conectados en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto text-sm text-slate-300">
          {/* Visual Sync Bridge */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-around gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-emerald-400 mb-1.5 shadow-md">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-white">Móvil</span>
              <span className="text-[10px] text-slate-400">Celular / Tablet</span>
            </div>

            <div className="flex flex-col items-center px-2">
              <div className="flex items-center gap-1 text-emerald-400 mb-1">
                <ArrowRightLeft className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                Nube Activa
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 mb-1.5 shadow-md">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-white">Escritorio</span>
              <span className="text-[10px] text-slate-400">PC / Laptop</span>
            </div>
          </div>

          {/* Sync Status Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Estado de Sincronización</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-emerald-300 text-xs sm:text-sm">
                  {syncStatus === 'syncing' || isSyncingManual ? 'Sincronizando...' : 'Conectado en Vivo'}
                </span>
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
              <div className="text-[11px] text-slate-400 font-medium mb-1">Última Sincronización</div>
              <div className="font-bold text-white text-xs sm:text-sm truncate">
                {lastSyncTime ? lastSyncTime.toLocaleTimeString() : 'Reciente'}
              </div>
            </div>
          </div>

          {/* Current synced counts */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">Elementos activos en la nube:</span>
            </div>
            <div className="flex items-center gap-3 font-semibold text-white">
              <span>{tournamentsCount} Torneos</span>
              <span>•</span>
              <span>{matchesCount} Partidos</span>
              <span>•</span>
              <span>{playersCount} Jugadores</span>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>¿Cómo funciona la sincronización ahora?</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cualquier torneo, fecha, equipo o partido que crees en tu teléfono se transmite de forma automática e instantánea al servidor central de la plataforma. Cuando abras el mismo enlace en tu computadora o cambies de pestaña, los datos se actualizarán sin que tengas que volver a crearlos.
            </p>
          </div>

          {/* Manual Force Sync Button */}
          <div className="space-y-2">
            <button
              onClick={handleManualSync}
              disabled={isSyncingManual}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingManual ? 'animate-spin' : ''}`} />
              <span>{isSyncingManual ? 'Sincronizando con la nube...' : 'Forzar Sincronización Inmediata'}</span>
            </button>
            {syncFeedback && (
              <p className="text-center text-xs text-emerald-400 font-medium animate-in fade-in">
                {syncFeedback}
              </p>
            )}
          </div>

          {/* Optional Supabase Realtime Script */}
          <div className="border-t border-slate-800 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Persistencia Permanente con Supabase</span>
              </div>
              <button
                onClick={handleCopySql}
                className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800/50"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Si tienes tu proyecto Supabase conectado a Vercel, copia este SQL y ejecútalo en el <strong>SQL Editor</strong> de Supabase para activar replicación en tiempo real a nivel de base de datos PostgreSQL.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
