"use client";

import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { userService } from "../services/user.service";

export function useUsers() {
  return useEntityCrud(userService, { resourceKey: "utilisateurs", entityLabel: "l'utilisateur" });
}
