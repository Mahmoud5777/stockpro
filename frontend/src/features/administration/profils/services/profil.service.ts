import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import { buildListParams } from "@/features/administration/shared/services/buildListParams";
import type { Profil, ProfilInput, ProfilDroitLigne } from "../types/profil.types";
import type { DroitsFonctionnalite } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";

// Forme brute de PROFIL renvoyée par le backend (ProfilDTO : sans les droits).
interface RawProfil {
  idPr: string;
  codeProfil: string;
  libelle: string;
  description?: string;
}

// Forme brute d'une ligne PROFIL_DROIT (ProfilDroitDTO).
interface RawProfilDroit {
  idProfilDroit: string;
  idPr: string;
  idFonc: string;
  consultation?: boolean;
  ajout?: boolean;
  modification?: boolean;
  suppression?: boolean;
  export?: boolean;
  impression?: boolean;
}

function toDroits(raw: RawProfilDroit): DroitsFonctionnalite {
  return {
    consultation: !!raw.consultation,
    ajout: !!raw.ajout,
    modification: !!raw.modification,
    suppression: !!raw.suppression,
    export: !!raw.export,
    impression: !!raw.impression,
  };
}

function hasAnyDroit(droits: DroitsFonctionnalite): boolean {
  return droits.consultation || droits.ajout || droits.modification || droits.suppression || droits.export || droits.impression;
}

async function fetchDroits(idPr: string): Promise<ProfilDroitLigne[]> {
  const { data } = await apiClient.get<RawProfilDroit[]>(`/profil-droits/profil/${idPr}`);
  return data.map((d) => ({ idFonctionnalite: d.idFonc, libFonctionnalite: "", droits: toDroits(d) }));
}

/**
 * Enregistre la matrice de droits d'un profil en synchronisant la table PROFIL_DROIT
 * via les endpoints dédiés /api/profil-droits (ProfilDTO ne porte pas ces données).
 */
async function syncDroits(idPr: string, droits: { idFonctionnalite: string; droits: DroitsFonctionnalite }[]): Promise<void> {
  const { data: existing } = await apiClient.get<RawProfilDroit[]>(`/profil-droits/profil/${idPr}`);
  const existingByFonc = new Map(existing.map((d) => [d.idFonc, d]));

  await Promise.all(
    droits.map(async (ligne) => {
      const current = existingByFonc.get(ligne.idFonctionnalite);
      const anyDroit = hasAnyDroit(ligne.droits);

      if (anyDroit && current) {
        await apiClient.put(`/profil-droits/${current.idProfilDroit}`, {
          idPr,
          idFonc: ligne.idFonctionnalite,
          ...ligne.droits,
        });
      } else if (anyDroit && !current) {
        await apiClient.post("/profil-droits", {
          idPr,
          idFonc: ligne.idFonctionnalite,
          ...ligne.droits,
        });
      } else if (!anyDroit && current) {
        await apiClient.delete(`/profil-droits/${current.idProfilDroit}`);
      }
    })
  );
}

export const profilService = {
  async list(params: PageRequest): Promise<Page<Profil>> {
    const { data } = await apiClient.get<Page<RawProfil>>("/profils", {
      params: buildListParams(params),
    });
    const content = await Promise.all(
      data.content.map(async (p) => ({ ...p, droits: await fetchDroits(p.idPr) }))
    );
    return { ...data, content };
  },
  async create(input: ProfilInput): Promise<Profil> {
    const { data } = await apiClient.post<RawProfil>("/profils", {
      codeProfil: input.codeProfil,
      libelle: input.libelle,
      description: input.description,
    });
    await syncDroits(data.idPr, input.droits);
    return { ...data, droits: await fetchDroits(data.idPr) };
  },
  async update(id: string, input: ProfilInput): Promise<Profil> {
    const { data } = await apiClient.put<RawProfil>(`/profils/${id}`, {
      codeProfil: input.codeProfil,
      libelle: input.libelle,
      description: input.description,
    });
    await syncDroits(id, input.droits);
    return { ...data, droits: await fetchDroits(id) };
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/profils/${id}`);
  },
  async listAll(): Promise<Profil[]> {
    const { data } = await apiClient.get<RawProfil[]>("/profils/all");
    return data.map((p) => ({ ...p, droits: [] }));
  },
} satisfies CrudService<Profil, ProfilInput>;
