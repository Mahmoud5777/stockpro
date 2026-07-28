"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { roleService } from "../services/role.service";

export function useRoles() {
  return useEntityCrud(roleService, { resourceKey: "roles", entityLabel: "le rôle" });
}
