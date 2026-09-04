/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getToken,
  getMe,
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  CurrentUser,
} from '../lib/api';

interface AuthContextValue {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On first load, if a valid-looking token exists, try to resolve the current user.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((me) => setUser(me))
      .catch(() => {
        // Token is invalid/expired - clear it silently and fall back to logged-out state.
        apiLogout();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const token = await apiLogin({ email, password });
      setUser({
        id: token.user_id,
        email: token.email,
        full_name: token.full_name,
        role: 'student',
        created_at: new Date().toISOString(),
      });
      // Refresh with the authoritative record from /auth/me
      getMe().then(setUser).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
      throw err;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, fullName: string) => {
    setError(null);
    try {
      const token = await apiSignup({ email, password, full_name: fullName });
      setUser({
        id: token.user_id,
        email: token.email,
        full_name: token.full_name,
        role: 'student',
        created_at: new Date().toISOString(),
      });
      getMe().then(setUser).catch(() => {});
    } catch (err: any) {
      setError(err?.message || 'Could not create your account.');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        signup,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}