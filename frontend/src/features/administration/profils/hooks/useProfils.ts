"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { profilService } from "../services/profil.service";

export function useProfils() {
  return useEntityCrud(profilService, { resourceKey: "profils", entityLabel: "le profil" });
}
