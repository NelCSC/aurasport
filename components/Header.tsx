'use client';

import React from 'react';
import { SportType, UserRole } from '@/types/sports';
import {
  Shield,
  Trophy,
  Users,
  LayoutDashboard,
  Compass,
  Activity,
  LogOut,
  KeyRound,
  Share2,
} from 'lucide-react';

interface HeaderProps {
  currentSport: SportType;
  onSportChange: (sport: SportType) => void;
  userRole: UserRole;
  adminEmail?: string;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeSpaceId?: string;
  onOpenSpaceSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSport,
  onSportChange,
  userRole,
  adminEmail = 'admin@aurasport.com',
  onOpenAdminLogin,
  onLogoutAdmin,
  activeTab,
  onTabChange,
  activeSpaceId = 'global_state',
  onOpenSpaceSelector,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tactical', label: 'Pizarra Táctica', icon: Compass },
    { id: 'players', label: 'Jugadores & Plantel', icon: Users },
    { id: 'tournaments', label: 'Torneos & Fixture', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-lg shadow-black/40">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left Section: Wordmark Brand (AuraSport PRO) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Brand Icon */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-sm shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
          </div>

          {/* Brand Name */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-white whitespace-nowrap">
                AuraSport
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 shrink-0">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden md:inline whitespace-nowrap">
              Gestión Integral Fútbol & Vóley
            </span>
          </div>
        </div>

        {/* Center Section: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Sport Switcher & Admin Auth Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Sport Switcher Segmented Control */}
          <div className="flex items-center p-0.5 sm:p-1 bg-slate-900 border border-slate-800 rounded-lg shrink-0">
            <button
              onClick={() => onSportChange('futbol')}
              title="Modo Fútbol"
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentSport === 'futbol'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs">⚽</span>
              <span className="hidden sm:inline">Fútbol</span>
            </button>
            <button
              onClick={() => onSportChange('voley')}
              title="Modo Vóley"
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentSport === 'voley'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs">🏐</span>
              <span className="hidden sm:inline">Vóley</span>
            </button>
          </div>

          {/* Quick Share Link button for current space */}
          <button
            onClick={onOpenSpaceSelector}
            title="Compartir enlace de esta Liga con seguidores o jugadores"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-400 transition-colors text-xs shrink-0 shadow-sm active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline text-xs font-semibold">Compartir</span>
          </button>

          {/* Admin Role Management (Logged-in Badge vs Public Spectator Login) */}
          {userRole === 'admin' ? (
            <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-600/50 p-1 rounded-lg shrink-0">
              <div
                title={`Sesión activa: ${adminEmail}`}
                className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-bold text-amber-300"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline max-w-[80px] md:max-w-[110px] truncate text-[11px]">
                  {adminEmail.split('@')[0]}
                </span>
                <span className="sm:hidden text-[10px]">Admin</span>
              </div>
              <button
                onClick={onLogoutAdmin}
                title="Cerrar sesión de administrador"
                className="p-1 hover:bg-amber-900/60 text-amber-400 hover:text-white rounded transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              title="Iniciar sesión con tu cuenta de Supabase"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm transition-all shrink-0 active:scale-95"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap text-xs">Acceso Admin</span>
              <span className="sm:hidden whitespace-nowrap text-[11px]">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile & Tablet Navigation Bar (smooth scrolling tabs) */}
      <div className="flex lg:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 overflow-x-auto gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors shrink-0 ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700/80'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
