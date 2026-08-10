import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import { buildListParams } from "@/features/administration/shared/services/buildListParams";
import type { Groupe, GroupeInput } from "../types/groupe.types";
import { profilService } from "@/features/administration/profils/services/profil.service";
import { roleService } from "@/features/administration/roles/services/role.service";

// Forme brute de GROUPE renvoyée par le backend (GroupeDTO : sans les associations).
interface RawGroupe {
  idGr: string;
  codeGroupe: string;
  libelle: string;
  description?: string;
}

interface RawGroupeProfil {
  idGroupeProfil: string;
  idGr: string;
  idPr: string;
}

interface RawGroupeRole {
  idGroupeRole: string;
  idGr: string;
  idRl: string;
}

async function enrich(raw: RawGroupe, profilLabels: Map<string, string>, roleLabels: Map<string, string>): Promise<Groupe> {
  const [groupeProfils, groupeRoles] = await Promise.all([
    apiClient.get<RawGroupeProfil[]>(`/groupe-profils/groupe/${raw.idGr}`).then((r) => r.data),
    apiClient.get<RawGroupeRole[]>(`/groupe-roles/groupe/${raw.idGr}`).then((r) => r.data),
  ]);
  return {
    ...raw,
    profils: groupeProfils.map((gp) => ({ idPr: gp.idPr, libelle: profilLabels.get(gp.idPr) ?? gp.idPr })),
    roles: groupeRoles.map((gr) => ({ idRl: gr.idRl, libelle: roleLabels.get(gr.idRl) ?? gr.idRl })),
  };
}

/** Synchronise les associations groupe<->profils et groupe<->rôles via les endpoints dédiés. */
async function syncAssociations(idGr: string, profilIds: string[], roleIds: string[]): Promise<void> {
  const [currentProfils, currentRoles] = await Promise.all([
    apiClient.get<RawGroupeProfil[]>(`/groupe-profils/groupe/${idGr}`).then((r) => r.data),
    apiClient.get<RawGroupeRole[]>(`/groupe-roles/groupe/${idGr}`).then((r) => r.data),
  ]);

  const toAddProfils = profilIds.filter((id) => !currentProfils.some((gp) => gp.idPr === id));
  const toRemoveProfils = currentProfils.filter((gp) => !profilIds.includes(gp.idPr));
  const toAddRoles = roleIds.filter((id) => !currentRoles.some((gr) => gr.idRl === id));
  const toRemoveRoles = currentRoles.filter((gr) => !roleIds.includes(gr.idRl));

  await Promise.all([
    ...toAddProfils.map((idPr) => apiClient.post("/groupe-profils", { idGr, idPr, actif: true })),
    ...toRemoveProfils.map((gp) => apiClient.delete(`/groupe-profils/${gp.idGroupeProfil}`)),
    ...toAddRoles.map((idRl) => apiClient.post("/groupe-roles", { idGr, idRl, actif: true })),
    ...toRemoveRoles.map((gr) => apiClient.delete(`/groupe-roles/${gr.idGroupeRole}`)),
  ]);
}

export const groupeService = {
  async list(params: PageRequest): Promise<Page<Groupe>> {
    const { data } = await apiClient.get<Page<RawGroupe>>("/groupes", {
      params: buildListParams(params),
    });
    const [profils, roles] = await Promise.all([profilService.listAll(), roleService.listAll()]);
    const profilLabels = new Map(profils.map((p) => [p.idPr, p.libelle]));
    const roleLabels = new Map(roles.map((r) => [r.idRl, r.libelle]));
    const content = await Promise.all(data.content.map((g) => enrich(g, profilLabels, roleLabels)));
    return { ...data, content };
  },
  async create(input: GroupeInput): Promise<Groupe> {
    const { data } = await apiClient.post<RawGroupe>("/groupes", {
      codeGroupe: input.codeGroupe,
      libelle: input.libelle,
      description: input.description,
    });
    await syncAssociations(data.idGr, input.profilIds, input.roleIds);
    return { ...data, profils: [], roles: [] };
  },
  async update(id: string, input: GroupeInput): Promise<Groupe> {
    const { data } = await apiClient.put<RawGroupe>(`/groupes/${id}`, {
      codeGroupe: input.codeGroupe,
      libelle: input.libelle,
      description: input.description,
    });
    await syncAssociations(id, input.profilIds, input.roleIds);
    return { ...data, profils: [], roles: [] };
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/groupes/${id}`);
  },
  /** Liste complète (non paginée), utilisée dans les selects d'autres modules (ex: Sites & droits). */
  async listAll(): Promise<Groupe[]> {
    const { data } = await apiClient.get<RawGroupe[]>("/groupes/all");
    return data.map((g) => ({ ...g, profils: [], roles: [] }));
  },
} satisfies CrudService<Groupe, GroupeInput>;