"use client";

import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import type { DroitAction } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";

interface RequirePermissionProps {
  code: string;
  action?: DroitAction;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Masque son contenu si l'utilisateur ne possède pas le droit demandé.
 * Utilisé pour cacher dynamiquement boutons "Ajouter", "Modifier", "Supprimer", etc.
 */
export function RequirePermission({
  code,
  action = "consultation",
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { can } = useAuth();
  if (!can(code, action)) return <>{fallback}</>;
  return <>{children}</>;
}
