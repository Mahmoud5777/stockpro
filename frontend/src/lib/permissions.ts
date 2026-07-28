import type { DroitAction } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";
import type { FonctionnaliteAvecDroits } from "@/features/auth/types/auth.types";

/**
 * Vérifie si l'utilisateur courant possède le droit demandé sur une fonctionnalité
 * (identifiée par son code, ex: "ADMIN_UTILISATEURS"), en se basant sur la liste
 * de fonctionnalités/droits renvoyée par le backend au login.
 */
export function hasPermission(
  fonctionnalites: FonctionnaliteAvecDroits[] | undefined,
  code: string,
  action: DroitAction = "consultation"
): boolean {
  if (!fonctionnalites) return false;
  const found = fonctionnalites.find((f) => f.codFonctionnalite === code);
  if (!found?.droits) return false;

  switch (action) {
    case "consultation":
      return !!found.droits.consultation;
    case "ajout":
      return !!found.droits.ajout;
    case "modification":
      return !!found.droits.modification;
    case "suppression":
      return !!found.droits.suppression;
    case "export":
      return !!found.droits.export;
    case "impression":
      return !!found.droits.impression;
    default:
      return false;
  }
}
