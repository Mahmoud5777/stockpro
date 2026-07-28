"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { siteService } from "../services/site.service";

export function useSites() {
  return useEntityCrud(siteService, { resourceKey: "sites", entityLabel: "le site" });
}
