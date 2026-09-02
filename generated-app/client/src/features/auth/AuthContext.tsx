"use client";

import { create } from "zustand";
import apiClient from "@/lib/axios";

export interface AuthUser {
  idUtil?: string;
  login?: string;
  nomComplet?: string;
  email?: string;
  [key: string]: unknown;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
}

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stockpro_token");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getInitialToken(),
  user: null,
  setAuth: (token, user) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stockpro_token", token);
    }
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("stockpro_token");
    }
    set({ token: null, user: null });
  },
  loadUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await apiClient.get("/api/auth/me");
      set({ user: res.data });
    } catch {
      get().logout();
    }
  },
}));
