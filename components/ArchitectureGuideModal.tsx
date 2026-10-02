'use client';

import React, { useState } from 'react';
import {
  SUPABASE_SQL_SCHEMA,
  CLEAN_ARCHITECTURE_VSCODE_STRUCTURE,
  CLOUDINARY_SETUP_GUIDE,
} from '@/lib/architecture-guide';
import { X, Copy, Check, Database, Cloud, FolderTree, Code, Terminal, Layers } from 'lucide-react';

interface ArchitectureGuideModalProps {
  onClose: () => void;
}

export const ArchitectureGuideModal: React.FC<ArchitectureGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'vscode' | 'supabase' | 'cloudinary'>('vscode');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Guía de Arquitectura, Supabase & Cloudinary para VS Code
              </h3>
              <p className="text-xs text-slate-400">
                Paso a paso para desplegar en tu entorno local con Clean Architecture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('vscode')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'vscode'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>1. Estructura Clean Architecture en VS Code</span>
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'supabase'
                ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>2. Schema SQL Supabase (PostgreSQL)</span>
          </button>
          <button
            onClick={() => setActiveTab('cloudinary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === 'cloudinary'
                ? 'bg-slate-800 text-purple-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>3. Conexión Multimedia Cloudinary</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs sm:text-sm text-slate-300">
          {activeTab === 'vscode' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Pasos para inicializar el proyecto en Visual Studio Code:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pl-1">
                  <li>
                    <strong className="text-white">Abrir terminal en tu carpeta:</strong>
                    <code className="block bg-slate-900 border border-slate-800 p-2 rounded text-emerald-400 font-mono text-xs my-1">
                      npx create-next-app@latest sportmaster-pro --typescript --tailwind --app --eslint
                    </code>
                  </li>
                  <li>
                    <strong className="text-white">Instalar las dependencias requeridas:</strong>
                    <code className="block bg-slate-900 border border-slate-800 p-2 rounded text-emerald-400 font-mono text-xs my-1">
                      npm install @supabase/supabase-js cloudinary lucide-react clsx tailwind-merge motion
                    </code>
                  </li>
                  <li>
                    <strong className="text-white">Crear la estructura modular limpia por capas (Dominio, Infraestructura, Presentación):</strong>
                  </li>
                </ol>
              </div>

              {/* VS Code Tree */}
              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-semibold text-white">Estructura de Directorios Recomendada:</span>
                  <button
                    onClick={() => handleCopy(CLEAN_ARCHITECTURE_VSCODE_STRUCTURE, 'vscode')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                  >
                    {copiedKey === 'vscode' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'vscode' ? '¡Copiado!' : 'Copiar Estructura'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto">
                  {CLEAN_ARCHITECTURE_VSCODE_STRUCTURE}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Pasos para configurar Supabase:</span>
                </h4>
                <p className="text-xs text-slate-300">
                  1. Crea un proyecto en <strong>supabase.com</strong>.
                  <br />
                  2. Ve al menú <strong>SQL Editor</strong> en la barra lateral izquierda.
                  <br />
                  3. Pega el siguiente script completo y haz clic en <strong>Run</strong>. Se crearán todas las tablas, relaciones, enums y políticas de seguridad RLS para admin y público.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-semibold text-white">Script DDL SQL para Supabase:</span>
                  <button
                    onClick={() => handleCopy(SUPABASE_SQL_SCHEMA, 'sql')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 rounded border border-cyan-700 transition-colors"
                  >
                    {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sql' ? '¡Script Copiado!' : 'Copiar SQL Completo'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-cyan-300/90 overflow-x-auto max-h-96">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'cloudinary' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2 text-sm">
                  <Cloud className="w-4 h-4 text-purple-400" />
                  <span>Pasos para configurar Cloudinary:</span>
                </h4>
                <p className="text-xs text-slate-300">
                  1. Regístrate gratis en <strong>cloudinary.com</strong> y copia tu Cloud Name, API Key y API Secret del Dashboard.
                  <br />
                  2. En Settings &gt; Upload, crea un Upload Preset con modo "Unsigned" o usa el proxy seguro en Next.js.
                  <br />
                  3. Agrega las credenciales en tu archivo <code className="text-purple-300">.env.local</code>.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between pb-2">
                  <span className="font-semibold text-white">Código de integración Next.js API Route:</span>
                  <button
                    onClick={() => handleCopy(CLOUDINARY_SETUP_GUIDE, 'cloudinary')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 rounded border border-purple-700 transition-colors"
                  >
                    {copiedKey === 'cloudinary' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cloudinary' ? '¡Código Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-purple-300/90 overflow-x-auto max-h-96">
                  {CLOUDINARY_SETUP_GUIDE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
