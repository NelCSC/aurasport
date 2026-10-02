'use client';

import React from 'react';
import { SportType, UserRole } from '@/types/sports';
import { Shield, Eye, Lock, Database, Trophy, Users, LayoutDashboard, Compass, Activity, LogOut, KeyRound } from 'lucide-react';

interface HeaderProps {
  currentSport: SportType;
  onSportChange: (sport: SportType) => void;
  userRole: UserRole;
  adminEmail?: string;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenArchitectureModal: () => void;
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
  onOpenArchitectureModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tactical', label: 'Pizarra Táctica', icon: Compass },
    { id: 'players', label: 'Jugadores & Plantel', icon: Users },
    { id: 'tournaments', label: 'Torneos & Fixture', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-slate-900 to-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shadow-md shadow-emerald-950/50">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              AuraSport <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">PRO</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Gestión Integral Fútbol & Vóley</span>
          </div>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs lg:text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Controls & Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sport Selector Tabs */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => onSportChange('futbol')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentSport === 'futbol'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>⚽</span>
              <span className="hidden sm:inline">Fútbol</span>
            </button>
            <button
              onClick={() => onSportChange('voley')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                currentSport === 'voley'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🏐</span>
              <span className="hidden sm:inline">Vóley</span>
            </button>
          </div>

          {/* Secure Role Management (Admin Login vs Public Spectator) */}
          {userRole === 'admin' ? (
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-600/50 p-1 rounded-lg">
              <div
                title={`Sesión iniciada como ${adminEmail}`}
                className="flex items-center gap-1.5 px-2 py-1 text-xs font-bold text-amber-300"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline max-w-[100px] truncate">{adminEmail.split('@')[0]}</span>
                <span className="sm:hidden">Admin</span>
              </div>
              <button
                onClick={onLogoutAdmin}
                title="Cerrar sesión de administrador"
                className="p-1 hover:bg-amber-900/60 text-amber-400 hover:text-white rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              title="Iniciar sesión como Administrador"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm transition-all active:scale-[0.98]"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Acceso Admin</span>
            </button>
          )}

          {/* Architecture & Backend Guide */}
          <button
            onClick={onOpenArchitectureModal}
            title="Ver Guía de Arquitectura, Supabase SQL y Cloudinary para VS Code"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">Supabase / VS Code</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="flex md:hidden border-t border-slate-800/80 bg-slate-950 px-2 py-1.5 overflow-x-auto gap-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-slate-800 text-emerald-400'
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
