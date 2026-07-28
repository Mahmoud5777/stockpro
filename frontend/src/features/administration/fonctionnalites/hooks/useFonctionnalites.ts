"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { fonctionnaliteService } from "../services/fonctionnalite.service";

export function useFonctionnalites() {
  return useEntityCrud(fonctionnaliteService, { resourceKey: "fonctionnalites", entityLabel: "la fonctionnalité" });
}
