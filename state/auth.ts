/**
 * Auth state — Jotai atoms for authentication against Sentinels Core API.
 */

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { AuthUser } from 'app/lib/core-api/types';

/** Whether the user is authenticated (has a valid token). */
export const isAuthenticatedAtom = atomWithStorage<boolean>(
  'sak-geo-authenticated',
  false
);

/** Current authenticated user profile from Core API. */
export const currentUserAtom = atom<AuthUser | null>(null);

/** Auth loading state. */
export const authLoadingAtom = atom<boolean>(false);

/** Auth error message. */
export const authErrorAtom = atom<string | null>(null);
