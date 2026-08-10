import type { PageRequest } from "@/types/common";

/**
 * Transforme un PageRequest (dont le champ `filters`) en paramètres de requête HTTP plats.
 * Les filtres sont aplatis au niveau racine (ex: { siteId: "x" } -> ?siteId=x)
 * pour correspondre au moteur universel de recherche backend (Specifications).
 */
export function buildListParams(params: PageRequest): Record<string, unknown> {
  const { filters, ...rest } = params;
  const queryParams: Record<string, unknown> = { ...rest };

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== "") {
        queryParams[key] = value;
      }
    }
  }

  return queryParams;
}