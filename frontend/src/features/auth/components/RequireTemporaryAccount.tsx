"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { Loader } from "@/components/ui/Loader";

/**
 * Garde dédiée à /change-password : contrairement à <ProtectedRoute />,
 * elle n'exige PAS doitChangerMdp === false (sinon on ne pourrait jamais
 * atteindre cette page). Elle exige seulement d'être authentifié, et renvoie
 * vers le dashboard si le changement n'est déjà plus nécessaire (accès direct
 * à l'URL par un utilisateur "normal").
 */
export function RequireTemporaryAccount({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }
    if (!user?.doitChangerMdp) {
      router.replace(ROUTES.dashboard);
    }
  }, [isInitializing, isAuthenticated, user, router]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader label="Vérification de la session..." />
      </div>
    );
  }

  if (!isAuthenticated || !user?.doitChangerMdp) return null;

  return <>{children}</>;
}
