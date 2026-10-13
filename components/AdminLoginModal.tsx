'use client';

import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, X, KeyRound, Sparkles, Database } from 'lucide-react';
import { loginAdminWithSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const performLogin = async (targetEmail: string, targetPass: string) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const cleanEmail = targetEmail.trim();
      const cleanPass = targetPass.trim();

      if (!cleanEmail || !cleanPass) {
        setIsLoading(false);
        setErrorMessage('Por favor ingresa tu correo y contraseña.');
        return;
      }

      const { user, error } = await loginAdminWithSupabase(cleanEmail, cleanPass);

      if (error || !user) {
        setIsLoading(false);
        setErrorMessage(
          error?.message ||
            'Credenciales no válidas en Supabase. Verifica tu usuario o regístralo en el panel.'
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
      setErrorMessage(err.message || 'Error al conectar con Supabase.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Acceso Administrador</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Autenticación segura con Supabase</p>
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Supabase Status Pill */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-medium">Servidor Auth:</span>
            </div>
            {isSupabaseConfigured ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Supabase Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Configurar variables .env
              </span>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Correo Electrónico Registrado</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tudominio.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Contraseña de Supabase</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-950 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <span>Validando en Supabase...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </div>

          {/* Supabase User Creation Guide (Collapsible) */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between text-[11px] text-amber-400/90 hover:text-amber-300 font-semibold py-1.5 px-2 rounded-lg bg-amber-950/30 border border-amber-900/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>¿Cómo registrar usuarios en tu Supabase?</span>
              </span>
              <span>{showGuide ? '▲ Ocultar' : '▼ Ver pasos'}</span>
            </button>

            {showGuide && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-2 animate-in fade-in">
                <p className="font-bold text-white text-xs">Pautas para crear administradores:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                  <li>
                    Ingresa a tu consola en <span className="text-cyan-400 font-mono">supabase.com</span> y abre tu proyecto.
                  </li>
                  <li>
                    En el menú de la izquierda, entra a <strong className="text-white">Authentication</strong> &gt; <strong className="text-white">Users</strong>.
                  </li>
                  <li>
                    Haz clic en el botón verde <strong className="text-emerald-400">&quot;Add user&quot;</strong> &gt; <strong className="text-white">&quot;Create user&quot;</strong>.
                  </li>
                  <li>
                    Escribe el correo y la contraseña que desees asignarle a ese usuario.
                  </li>
                  <li>
                    (Opcional) En <strong className="text-white">User Metadata</strong> agrega: <code className="text-amber-300 font-mono">{`{"role": "admin"}`}</code>.
                  </li>
                  <li>
                    Haz clic en <strong className="text-white">Create user</strong>. ¡Listo! El usuario ya podrá ingresar en esta pantalla.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
