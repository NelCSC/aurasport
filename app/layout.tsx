import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'AuraSport PRO - Plataforma de Gestión Deportiva',
  description: 'SaaS para la gestión integral de ligas y torneos de fútbol y vóley con pizarra táctica interactiva, registro de jugadores, control de fixtures y estadísticas automatizadas.',
  openGraph: {
    title: 'AuraSport PRO - Plataforma de Gestión Deportiva',
    description: 'SaaS para la gestión integral de ligas y torneos de fútbol y vóley con pizarra táctica interactiva, registro de jugadores, control de fixtures y estadísticas automatizadas.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuraSport PRO - Plataforma de Gestión Deportiva',
    description: 'SaaS para la gestión integral de ligas y torneos de fútbol y vóley con pizarra táctica interactiva, registro de jugadores, control de fixtures y estadísticas automatizadas.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className="dark">
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
