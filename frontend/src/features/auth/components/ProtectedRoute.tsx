"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { ROUTES } from "@/lib/constants";
import { Loader } from "@/components/ui/Loader";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.replace(ROUTES.login);
      return;
    }
    // Compte avec un mot de passe temporaire : on empêche l'accès à toute
    // page protégée (URL directe incluse) tant que le changement n'a pas eu lieu.
    if (!isInitializing && isAuthenticated && user?.doitChangerMdp) {
      router.replace(ROUTES.changePassword);
    }
  }, [isInitializing, isAuthenticated, user, router]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-light dark:bg-surface-dark">
        <Loader label="Vérification de la session..." />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (user?.doitChangerMdp) return null;

  return <>{children}</>;
}
