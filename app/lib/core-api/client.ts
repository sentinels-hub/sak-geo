/**
 * Base HTTP client for Sentinels Core API.
 * All API calls go through this client.
 */

const CORE_API_URL =
  import.meta.env.VITE_CORE_API_URL || 'https://core.sentinels.pro/api/v1';

export class CoreApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'CoreApiError';
    this.status = status;
    this.data = data;
  }
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('sak-geo-token');
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('sak-geo-token', token);
    } else {
      localStorage.removeItem('sak-geo-token');
    }
  } catch {
    // localStorage may be unavailable
  }
}

export function setStoredRefreshToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('sak-geo-refresh-token', token);
    } else {
      localStorage.removeItem('sak-geo-refresh-token');
    }
  } catch {
    // localStorage may be unavailable
  }
}

export function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem('sak-geo-refresh-token');
  } catch {
    return null;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

/**
 * Make an authenticated request to the Core API.
 * Automatically adds JWT Authorization header.
 * Returns parsed JSON response.
 */
export async function coreApiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth, ...init } = options;
  const url = `${CORE_API_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>)
  };

  if (!skipAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (response.status === 401 && !skipAuth) {
    // Token expired — clear and redirect to login
    setStoredToken(null);
    setStoredRefreshToken(null);
    window.dispatchEvent(new CustomEvent('sak-geo:auth-expired'));
    throw new CoreApiError(401, 'Authentication expired');
  }

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new CoreApiError(
      response.status,
      `Core API error: ${response.status} ${response.statusText}`,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getCoreApiUrl(): string {
  return CORE_API_URL;
}
