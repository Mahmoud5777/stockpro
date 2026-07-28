"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { groupeService } from "../services/groupe.service";

export function useGroupes() {
  return useEntityCrud(groupeService, { resourceKey: "groupes", entityLabel: "le groupe" });
}
