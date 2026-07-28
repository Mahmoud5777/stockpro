import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import type { Fonctionnalite, FonctionnaliteInput } from "../types/fonctionnalite.types";

export const fonctionnaliteService = {
  async list(params: PageRequest): Promise<Page<Fonctionnalite>> {
    const { data } = await apiClient.get<Page<Fonctionnalite>>("/fonctionnalites", { params });
    return data;
  },
  async create(input: FonctionnaliteInput): Promise<Fonctionnalite> {
    const { data } = await apiClient.post<Fonctionnalite>("/fonctionnalites", input);
    return data;
  },
  async update(id: string, input: FonctionnaliteInput): Promise<Fonctionnalite> {
    const { data } = await apiClient.put<Fonctionnalite>(`/fonctionnalites/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/fonctionnalites/${id}`);
  },
  /** Liste complète non paginée, utilisée dans les selects (parent) et la matrice de droits des profils. */
  async listAll(): Promise<Fonctionnalite[]> {
    const { data } = await apiClient.get<Fonctionnalite[]>("/fonctionnalites/all");
    return data;
  },
} satisfies CrudService<Fonctionnalite, FonctionnaliteInput>;
