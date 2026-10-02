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
 * Helper to log in as Administrator using Supabase Auth
 */
export async function loginAdminWithSupabase(email: string, password: string) {
  if (!supabase) {
    // Fallback if Supabase is not yet connected in .env.local
    if (
      (email.toLowerCase() === 'admin@aurasport.com' || email.toLowerCase() === 'admin') &&
      (password === 'admin123' || password === 'admin')
    ) {
      return { user: { email, role: 'admin' }, error: null };
    }
    return { user: null, error: new Error('Supabase no está configurado aún en .env.local. Usa las credenciales demo: admin@aurasport.com / admin123') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

/**
 * Helper to log out
 */
export async function logoutAdminWithSupabase() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}
