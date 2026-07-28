import { apiClient } from "@/lib/axios";
import type { Page } from "@/types/common";
import type { AuditLog, AuditActionType } from "../types/audit.types";

/**
 * Le backend (AuditLogController) filtre uniquement par `login` (contient, insensible
 * à la casse) et `action` (valeur exacte de l'enum) — pas de filtre par date ni de
 * recherche plein texte générique.
 */
export interface AuditLogFilters {
  page: number;
  size: number;
  sort?: string;
  login?: string;
  action?: AuditActionType | "";
}

/**
 * Service en LECTURE SEULE : le journal d'audit n'est jamais créé, modifié
 * ou supprimé depuis le frontend, il est uniquement consulté.
 */
export const auditService = {
  async list(params: AuditLogFilters): Promise<Page<AuditLog>> {
    const { data } = await apiClient.get<Page<AuditLog>>("/audit-logs", {
      params: {
        page: params.page,
        size: params.size,
        sort: params.sort,
        login: params.login || undefined,
        action: params.action || undefined,
      },
    });
    return data;
  },
};
