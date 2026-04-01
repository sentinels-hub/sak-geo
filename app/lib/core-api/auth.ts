/**
 * Auth service — JWT authentication against Sentinels Core API.
 */

import {
  coreApiFetch,
  setStoredToken,
  setStoredRefreshToken,
  getStoredRefreshToken
} from './client';
import type { TokenPair, AuthUser, EnvelopeResponse } from './types';

/**
 * Login with username/password. Returns JWT token pair.
 */
export async function login(
  username: string,
  password: string
): Promise<TokenPair> {
  const response = await coreApiFetch<TokenPair>('/auth/token/', {
    method: 'POST',
    body: { username, password },
    skipAuth: true
  });

  setStoredToken(response.access);
  setStoredRefreshToken(response.refresh);

  return response;
}

/**
 * Refresh the JWT access token using the stored refresh token.
 */
export async function refreshToken(): Promise<string | null> {
  const refresh = getStoredRefreshToken();
  if (!refresh) return null;

  try {
    const response = await coreApiFetch<{ access: string }>(
      '/auth/token/refresh/',
      {
        method: 'POST',
        body: { refresh },
        skipAuth: true
      }
    );

    setStoredToken(response.access);
    return response.access;
  } catch {
    // Refresh token expired — clear everything
    setStoredToken(null);
    setStoredRefreshToken(null);
    return null;
  }
}

/**
 * Get the current authenticated user profile.
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await coreApiFetch<EnvelopeResponse<AuthUser>>(
    '/accounts/users/me/'
  );
  return response.data;
}

/**
 * Logout — clear stored tokens.
 */
export function logout() {
  setStoredToken(null);
  setStoredRefreshToken(null);
}
