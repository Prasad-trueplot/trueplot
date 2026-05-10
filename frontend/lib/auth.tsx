"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "./api";
import type { AuthToken, User } from "./types";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    email: string;
    full_name: string;
    password: string;
    phone?: string | null;
    role: User["role"];
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const token = window.localStorage.getItem("trueplot_access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setUser(await api.me());
      } catch {
        window.localStorage.removeItem("trueplot_access_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrentUser();
  }, []);

  function persistAuth(authToken: AuthToken) {
    window.localStorage.setItem("trueplot_access_token", authToken.access_token);
    setUser(authToken.user);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        persistAuth(await api.login({ email, password }));
      },
      signup: async (payload) => {
        persistAuth(await api.signup(payload));
      },
      logout: () => {
        window.localStorage.removeItem("trueplot_access_token");
        setUser(null);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

