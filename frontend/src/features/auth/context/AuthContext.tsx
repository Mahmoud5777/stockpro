"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { tokenStorage } from "@/utils/storage";
import { authService } from "../services/auth.service";
import type { AuthenticatedUser, LoginPayload } from "../types/auth.types";
import { ROUTES } from "@/lib/constants";
import { hasPermission } from "@/lib/permissions";
import type { DroitAction } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  can: (code: string, action?: DroitAction) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, setUser, logout: clearStore } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  // Rehydratation de la session au chargement de l'app (si token présent)
  useEffect(() => {
    async function bootstrap() {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }
      try {
        const me = await authService.me();
        setUser(me);
      } catch {
        tokenStorage.clear();
        clearStore();
      } finally {
        setIsInitializing(false);
      }
    }
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload);
      tokenStorage.setTokens(response.accessToken, response.refreshToken);

      // /auth/login ne renvoie que l'essentiel (token + doitChangerMdp) ; les
      // droits réels (fonctionnalites, sites) sont résolus côté backend et
      // exposés uniquement par /auth/me — on l'appelle donc immédiatement
      // après le login pour avoir un profil complet avant d'entrer dans l'app.
      const fullUser = response.doitChangerMdp ? response.user : await authService.me();
      setUser(fullUser);

      // Compte temporaire (ex: admin.temp) : on bloque l'accès au reste de
      // l'application tant que l'utilisateur n'a pas changé son login/mot de passe.
      if (response.doitChangerMdp) {
        router.push(ROUTES.changePassword);
      } else {
        router.push(ROUTES.dashboard);
      }
    },
    [router, setUser]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // on déconnecte côté client même si l'appel serveur échoue
    } finally {
      tokenStorage.clear();
      clearStore();
      router.push(ROUTES.login);
    }
  }, [router, clearStore]);

  const can = useCallback(
    (code: string, action?: DroitAction) => hasPermission(user?.fonctionnalites, code, action),
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      login,
      logout,
      can,
    }),
    [user, isInitializing, login, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext doit être utilisé dans un AuthProvider");
  return ctx;
}
