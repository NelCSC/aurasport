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
 * Helper to log in as Administrator using strict Supabase Auth
 * Only users actually registered in Supabase Authentication are granted access.
 */
export async function loginAdminWithSupabase(email: string, password: string) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return {
      user: null,
      error: new Error('Por favor ingresa tanto el correo electrónico como la contraseña.'),
    };
  }

  // If Supabase is not configured in environment variables
  if (!supabase) {
    return {
      user: null,
      error: new Error(
        'Supabase no está configurado en las variables de entorno (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY). Solo los usuarios creados en Supabase pueden acceder.'
      ),
      authMethod: 'unconfigured',
    };
  }

  // Strictly authenticate against Supabase Auth
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error || !data?.user) {
      const errorMsg =
        error?.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Este usuario o contraseña no existen en tu panel de Supabase.'
          : error?.message || 'Error al autenticar con Supabase.';

      return {
        user: null,
        error: new Error(errorMsg),
      };
    }

    return {
      user: data.user,
      error: null,
      authMethod: 'supabase',
    };
  } catch (err: any) {
    return {
      user: null,
      error: new Error(err?.message || 'Error de red o conexión al contactar Supabase.'),
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
