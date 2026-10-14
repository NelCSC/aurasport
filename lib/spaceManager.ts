/**
 * Multi-Admin Space Manager for AuraSport PRO
 * Allows each Supabase Administrator to have an isolated, persistent space
 * for their tournaments, matches, teams, and player rosters.
 * Spectators and followers can view exclusively that admin's events via direct link.
 */

export interface AdminSpaceInfo {
  id: string;
  name: string;
  adminEmail: string;
  tournamentsCount: number;
  matchesCount: number;
  playersCount: number;
  lastUpdated?: string | number;
  isCurrent?: boolean;
}

/**
 * Derives a consistent, sanitized space ID from an administrator's email or identifier
 * e.g. "admin@copaperu.com" -> "space_admin_copaperu_com"
 */
export function getSpaceIdFromEmail(email: string): string {
  if (!email || email === 'global' || email === 'default') {
    return 'global_state';
  }
  const clean = email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_');
  return `space_${clean}`;
}

/**
 * Returns a human-readable name for a space ID
 */
export function getSpaceDisplayName(spaceId: string, email?: string): string {
  if (!spaceId || spaceId === 'global_state') {
    return 'Liga Central (Global)';
  }

  if (email && email !== 'admin@aurasport.com') {
    const username = email.split('@')[0];
    const capitalized = username.charAt(0).toUpperCase() + username.slice(1);
    return `Liga de ${capitalized}`;
  }

  // If we only have spaceId like "space_nelzoncsc_gmail_com"
  const raw = spaceId
    .replace(/^space_/, '')
    .replace(/^admin_/, '')
    .replace(/_gmail_com$/, '')
    .replace(/_hotmail_com$/, '')
    .replace(/_outlook_com$/, '')
    .replace(/_yahoo_com$/, '');
  const parts = raw.split('_').filter(Boolean);
  if (parts.length > 0) {
    const formatted = parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ');
    return `Liga ${formatted}`;
  }

  return 'Espacio Deportivo';
}

/**
 * Generates the shareable follower URL for a specific space
 */
export function generateFollowerShareUrl(spaceId: string, baseUrl?: string): string {
  const origin =
    baseUrl ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://aurasport.vercel.app');
  return `${origin}/?space=${encodeURIComponent(spaceId)}`;
}
