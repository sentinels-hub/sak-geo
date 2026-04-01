/**
 * Login page — authenticates against Sentinels Core API via JWT.
 */

import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { login, getCurrentUser } from 'app/lib/core-api';
import {
  isAuthenticatedAtom,
  currentUserAtom,
  authErrorAtom
} from 'state/auth';
import { getCoreApiUrl } from 'app/lib/core-api';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setAuthError = useSetAtom(authErrorAtom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      await login(username, password);
      const user = await getCurrentUser();
      setCurrentUser(user);
      setAuthenticated(true);
    } catch (err: any) {
      const message =
        err?.status === 401
          ? 'Invalid credentials'
          : err?.message || 'Connection failed';
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SAK-Geo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sentinels Device Placement
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm"
              placeholder="your.username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg
                       font-medium text-sm hover:bg-blue-700
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Connection info */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Connecting to{' '}
          <span className="font-mono">{getCoreApiUrl()}</span>
        </p>
      </div>
    </div>
  );
}
