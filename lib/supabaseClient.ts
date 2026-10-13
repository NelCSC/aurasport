import { createClient } from '@supabase/supabase-js';

// Supabase credentials configured from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project-id')
);

// Client-side Supabase instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to log in as Administrator using Supabase Auth or Built-in Master Admin
 */
export async function loginAdminWithSupabase(email: string, password: string) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  const isDemoAdminCredentials =
    (cleanEmail === 'admin@aurasport.com' ||
      cleanEmail === 'admin' ||
      cleanEmail === 'admin@ligasport.com' ||
      cleanEmail === 'nelzoncsc@gmail.com') &&
    (cleanPassword === 'admin123' || cleanPassword === 'admin');

  // Master key bypass: If the user provides the demo password 'admin123' or 'admin'
  if (isDemoAdminCredentials || (cleanEmail && cleanPassword === 'admin123')) {
    const finalEmail = cleanEmail.includes('@') ? cleanEmail : `${cleanEmail}@aurasport.com`;
    return {
      user: {
        id: 'master-admin',
        email: finalEmail,
        role: 'admin',
        user_metadata: { role: 'admin', name: 'Administrador Maestro' },
      },
      error: null,
      authMethod: 'master_demo',
    };
  }

  // If Supabase is not configured yet, notify user with demo credentials hint
  if (!supabase) {
    return {
      user: null,
      error: new Error(
        'Supabase aún no está conectado en .env.local. Puedes ingresar con el Admin Maestro: admin@aurasport.com / clave: admin123'
      ),
      authMethod: 'local',
    };
  }

  // If Supabase is configured, attempt authentication against Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      // Fallback: If user entered demo password admin123, grant admin access anyway
      if (cleanPassword === 'admin123' || cleanPassword === 'admin') {
        return {
          user: {
            id: 'demo-admin-fallback',
            email: cleanEmail || 'admin@aurasport.com',
            role: 'admin',
          },
          error: null,
          authMethod: 'master_fallback',
        };
      }
      return {
        user: null,
        error: new Error(
          `Supabase Auth: ${error.message}. Usa la clave demo "admin123" o registra el usuario en tu consola de Supabase.`
        ),
      };
    }

    return { user: data.user, error: null, authMethod: 'supabase' };
  } catch (err: any) {
    return {
      user: null,
      error: new Error(err?.message || 'Error al conectar con el servidor de autenticación.'),
    };
  }
}

/**
 * Helper to log out
 */
export async function logoutAdminWithSupabase() {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error during Supabase signout', e);
    }
  }
}