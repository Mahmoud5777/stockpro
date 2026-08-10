import { apiClient } from "@/lib/axios";
import type { Page } from "@/types/common";
import { buildListParams } from "@/features/administration/shared/services/buildListParams";
import type { AuditLog } from "../types/audit.types";

/**
 * Le backend (AuditLogController) utilise le moteur universel de recherche
 * (Specifications) : paramètre `search` (login/endpoint/adresse IP, contient,
 * insensible à la casse) + filtre déclaré `action` (valeur exacte de l'enum).
 */
export const auditService = {
  async list(params: {
    page: number;
    size: number;
    sort?: string;
    search?: string;
    filters?: Record<string, string | boolean | undefined>;
  }): Promise<Page<AuditLog>> {
    const { data } = await apiClient.get<Page<AuditLog>>("/audit-logs", {
      params: buildListParams(params),
    });
    return data;
  },
};