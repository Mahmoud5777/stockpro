"use client";

import { useMemo } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasPermission } from "@/lib/permissions";
import { MENU_CONFIG, type MenuItem } from "./menu.config";

/**
 * Filtre dynamiquement le menu en fonction des fonctionnalités/droits renvoyés
 * par le backend pour l'utilisateur connecté. Aucune permission n'est codée en dur.
 */
export function useMenu(): MenuItem[] {
  const { user } = useAuth();

  return useMemo(() => {
    function filterItems(items: MenuItem[]): MenuItem[] {
      return items
        .map((item) => {
          if (item.children) {
            const children = filterItems(item.children);
            if (children.length === 0) return null;
            return { ...item, children };
          }
          if (item.code === null) return item;
          return hasPermission(user?.fonctionnalites, item.code, "consultation") ? item : null;
        })
        .filter((item): item is MenuItem => item !== null);
    }
    return filterItems(MENU_CONFIG);
  }, [user]);
}
