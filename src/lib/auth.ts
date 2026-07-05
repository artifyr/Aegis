/**
 * AEGIS — Server-side Auth Helper
 * Verifies the aegis_auth_token cookie and returns the role.
 * Import this in every protected API route.
 */
import { cookies } from 'next/headers';

type Role = 'admin' | 'guest';

const VALID_TOKENS: Record<string, Role> = {
  'authenticated_aegis_session_admin': 'admin',
  'authenticated_aegis_session_guest': 'guest',
};

/**
 * Returns the authenticated role, or null if unauthenticated.
 */
export async function getAuthRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('aegis_auth_token')?.value;
  if (!token) return null;
  return VALID_TOKENS[token] ?? null;
}

/**
 * Returns a 401 NextResponse-compatible body/status pair for unauthenticated requests.
 */
export function unauthorizedPayload() {
  return { body: { error: 'Unauthorized', code: 'UNAUTHORIZED' }, status: 401 as const };
}
