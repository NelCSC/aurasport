'use client';

import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, X, KeyRound, Sparkles } from 'lucide-react';
import { loginAdminWithSupabase } from '@/lib/supabaseClient';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('admin@aurasport.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const cleanEmail = targetEmail.trim();
      const cleanPass = targetPass.trim();

      const { user, error } = await loginAdminWithSupabase(cleanEmail, cleanPass);

      if (error || !user) {
        setIsLoading(false);
        setErrorMessage(
          error?.message ||
            'Credenciales no válidas. Usa el botón "Ingresar con 1 Clic" o la clave "admin123".'
        );
        return;
      }

      if (rememberMe) {
        try {
          localStorage.setItem(
            'sportmaster_admin_session',
            JSON.stringify({ email: user.email || cleanEmail, loggedAt: Date.now() })
          );
        } catch (err) {
          console.warn('Could not save session', err);
        }
      }

      setIsLoading(false);
      onLoginSuccess(user.email || cleanEmail);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Error al iniciar sesión');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const handleQuickDemoLogin = async () => {
    setEmail('admin@aurasport.com');
    setPassword('admin123');
    await performLogin('admin@aurasport.com', 'admin123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Acceso de Administrador</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Control de partidos, planteles y pizarras</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {/* Quick 1-Click Access Button (Recommended for fast login) */}
          <div className="p-3 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-600/50 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Acceso Instantáneo
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Demo Master</span>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Ingresar con 1 Clic (Admin Demo)</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Accede de inmediato sin tener que teclear usuario ni contraseña.
            </p>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              O ingresar credenciales manuales
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Correo Electrónico / Usuario</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aurasport.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Contraseña</label>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@aurasport.com');
                  setPassword('admin123');
                  setErrorMessage(null);
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                Autocompletar
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-500 hover:text-slate-300 absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me option */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-400"
              />
              <span>Recordar sesión en este navegador</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
            >
              Seguir como Espectador
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-950 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <span>Verificando...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};