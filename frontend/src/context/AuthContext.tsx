import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getMe: () => Promise<any>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function setAuthToken(token: string | null) {
  if (token && token !== "undefined" && token !== "null") {
    localStorage.setItem("token", token);
    localStorage.setItem("slc_token", token);
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("slc_token");
  }
}

function getStoredToken(): string | null {
  const token = localStorage.getItem("token") || localStorage.getItem("slc_token");
  if (!token || token === "undefined" || token === "null") {
    return null;
  }
  return token;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    async function bootstrap() {
      const token = getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const meData = await authApi.getMe();
        if (meData && (meData.email || meData.id)) {
          setUser(meData);
          setIsAuthenticated(true);
        } else {
          setAuthToken(null);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      const res = await authApi.login(email, password);
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setIsAuthenticated(true);
        setUser({
          id: res.user_id,
          email: res.email,
          full_name: res.full_name,
        });
      } else {
        throw new Error("Invalid credentials or response from server");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to log in";
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleSignup = async (email: string, password: string, fullName: string) => {
    setError(null);
    try {
      const res = await authApi.register(email, password, fullName);
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setIsAuthenticated(true);
        setUser({
          id: res.user_id,
          email: res.email,
          full_name: res.full_name,
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || "Failed to create account";
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleLogout = async () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authApi.resetPassword(token, newPassword);
  };

  const fetchMe = async () => {
    const res = await authApi.getMe();
    if (res && (res.email || res.id)) {
      setUser(res);
      setIsAuthenticated(true);
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        isLoading: loading,
        error,
        clearError,
        signUp: handleSignup,
        signup: handleSignup,
        logIn: handleLogin,
        login: handleLogin,
        logOut: handleLogout,
        logout: handleLogout,
        forgotPassword,
        resetPassword,
        getMe: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}