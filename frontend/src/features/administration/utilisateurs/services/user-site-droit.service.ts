import { apiClient } from "@/lib/axios";
import type { UserSiteDroit, UserSiteDroitInput } from "../types/user.types";

/**
 * Gère les affectations de profil/groupe/rôle à un utilisateur sur un site donné
 * (table USER_SITE_DROITS). C'est ce qui permet, depuis la fiche utilisateur,
 * de faire "Affecter ce profil à l'utilisateur" (onglet Sites & droits).
 */
export const userSiteDroitService = {
  async listByUserSite(idUtilSite: string): Promise<UserSiteDroit[]> {
    const { data } = await apiClient.get<UserSiteDroit[]>(`/user-site-droits/user-site/${idUtilSite}`);
    return data;
  },
  async create(input: UserSiteDroitInput): Promise<UserSiteDroit> {
    const { data } = await apiClient.post<UserSiteDroit>("/user-site-droits", input);
    return data;
  },
  async update(id: string, input: UserSiteDroitInput): Promise<UserSiteDroit> {
    const { data } = await apiClient.put<UserSiteDroit>(`/user-site-droits/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/user-site-droits/${id}`);
  },
};
