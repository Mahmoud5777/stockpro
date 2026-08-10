import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import { buildListParams } from "@/features/administration/shared/services/buildListParams";
import type { Utilisateur, UtilisateurInput } from "../types/user.types";
import { siteService } from "@/features/administration/sites/services/site.service";

interface RawUser {
  idUtil: string;
  nomComplet: string;
  login: string;
  email: string;
  telephone?: string;
  etatCompte: boolean;
  dateCreation: string;
}

async function syncSites(idUtil: string, siteIds: string[]): Promise<void> {
  const { data: current } = await apiClient.get<{ idUtilSite: string; idSite: string }[]>(`/user-sites/user/${idUtil}`);
  const toAdd = siteIds.filter((id) => !current.some((us) => us.idSite === id));
  const toRemove = current.filter((us) => !siteIds.includes(us.idSite));

  await Promise.all([
    ...toAdd.map((idSite) => apiClient.post("/user-sites", { idUtil, idSite })),
    ...toRemove.map((us) => apiClient.delete(`/user-sites/${us.idUtilSite}`)),
  ]);
}

async function fetchSites(
  idUtil: string,
  siteLabels: Map<string, string>
): Promise<{ idSite: string; nomSite: string; idUtilSite: string }[]> {
  const { data } = await apiClient.get<{ idUtilSite: string; idSite: string }[]>(`/user-sites/user/${idUtil}`);
  return data.map((us) => ({
    idSite: us.idSite,
    nomSite: siteLabels.get(us.idSite) ?? us.idSite,
    idUtilSite: us.idUtilSite,
  }));
}

export const userService = {
  async list(params: PageRequest): Promise<Page<Utilisateur>> {
    const { data } = await apiClient.get<Page<RawUser>>("/users", {
      params: buildListParams(params),
    });
    const allSites = await siteService.listAll();
    const siteLabels = new Map(allSites.map((s) => [s.idSite, s.nomSite]));
    const content = await Promise.all(
      data.content.map(async (u) => ({ ...u, sites: await fetchSites(u.idUtil, siteLabels) }))
    );
    return { ...data, content };
  },

  async create(input: UtilisateurInput): Promise<Utilisateur> {
    const { data } = await apiClient.post<RawUser>("/users", {
      nomComplet: input.nomComplet,
      login: input.login,
      email: input.email,
      telephone: input.telephone,
      etatCompte: input.etatCompte,
      motPasse: input.motPasse,
    });
    await syncSites(data.idUtil, input.siteIds);
    const allSites = await siteService.listAll();
    const siteLabels = new Map(allSites.map((s) => [s.idSite, s.nomSite]));
    return { ...data, sites: await fetchSites(data.idUtil, siteLabels) };
  },

  async update(id: string, input: UtilisateurInput): Promise<Utilisateur> {
    const { data } = await apiClient.put<RawUser>(`/users/${id}`, {
      nomComplet: input.nomComplet,
      login: input.login,
      email: input.email,
      telephone: input.telephone,
      etatCompte: input.etatCompte,
      motPasse: input.motPasse,
    });
    await syncSites(id, input.siteIds);
    const allSites = await siteService.listAll();
    const siteLabels = new Map(allSites.map((s) => [s.idSite, s.nomSite]));
    return { ...data, sites: await fetchSites(id, siteLabels) };
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
} satisfies CrudService<Utilisateur, UtilisateurInput>;