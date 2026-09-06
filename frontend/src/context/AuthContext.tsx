import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api";

interface AuthContextValue {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      try {
        const meData = await authApi.getMe();
        setUser(meData);
        setIsAuthenticated(!!meData?.access_token);
      } catch {
        setIsAuthenticated(false);
      }
      setLoading(false);
    }
    bootstrap();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await authApi.register(email, password, fullName);
    setIsAuthenticated(true);
    setUser(res.user);
  };

  const logIn = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.access_token) {
      localStorage.setItem("token", res.access_token);
    }
    setIsAuthenticated(true);
    setUser(res);
  };

  const logOut = async () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword(email);
  };

  const resetPassword = async (token: string, newPassword: string) => {
    await authApi.resetPassword(token, newPassword);
  };

  const getMe = async () => {
    const res = await authApi.getMe();
    return res;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, signUp, logIn, logOut, forgotPassword, resetPassword, getMe }}>
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