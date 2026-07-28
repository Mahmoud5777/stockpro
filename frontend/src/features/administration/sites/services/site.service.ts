import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import type { Site, SiteInput } from "../types/site.types";

// Forme brute renvoyée par le backend (SiteDTO : sans le libellé du parent résolu).
type RawSite = Omit<Site, "parentNomSite">;

function enrichParents(sites: RawSite[]): Site[] {
  const byId = new Map(sites.map((s) => [s.idSite, s]));
  return sites.map((s) => ({
    ...s,
    parentNomSite: s.idSiteParent ? byId.get(s.idSiteParent)?.nomSite ?? null : null,
  }));
}

export const siteService = {
  async list(params: PageRequest): Promise<Page<Site>> {
    const [{ data }, all] = await Promise.all([
      apiClient.get<Page<RawSite>>("/sites", { params }),
      apiClient.get<RawSite[]>("/sites/all").then((r) => r.data),
    ]);
    const byId = new Map(all.map((s) => [s.idSite, s]));
    const content = data.content.map((s) => ({
      ...s,
      parentNomSite: s.idSiteParent ? byId.get(s.idSiteParent)?.nomSite ?? null : null,
    }));
    return { ...data, content };
  },
  async create(input: SiteInput): Promise<Site> {
    const { data } = await apiClient.post<RawSite>("/sites", input);
    return { ...data, parentNomSite: null };
  },
  async update(id: string, input: SiteInput): Promise<Site> {
    const { data } = await apiClient.put<RawSite>(`/sites/${id}`, input);
    return { ...data, parentNomSite: null };
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/sites/${id}`);
  },
  /** Liste complète (non paginée) utilisée dans les selects d'autres modules (utilisateurs, hiérarchie sites). */
  async listAll(): Promise<Site[]> {
    const { data } = await apiClient.get<RawSite[]>("/sites/all");
    return enrichParents(data);
  },
} satisfies CrudService<Site, SiteInput>;
