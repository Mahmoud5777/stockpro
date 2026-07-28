import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthenticatedUser } from "@/features/auth/types/auth.types";

interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthenticatedUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "erp-auth-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
