import type { DroitsFonctionnalite } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";

// Basé sur PROFIL (champs alignés sur ProfilDTO.java) + PROFIL_DROIT
// (géré via des appels dédiés à /api/profil-droits, voir profil.service.ts,
// car ProfilDTO backend ne porte pas nativement la liste des droits).
export interface Profil {
  idPr: string;
  codeProfil: string;
  libelle: string;
  description?: string;
  droits: ProfilDroitLigne[];
}

export interface ProfilDroitLigne {
  idFonctionnalite: string;
  libFonctionnalite: string;
  droits: DroitsFonctionnalite;
}

export interface ProfilInput {
  codeProfil: string;
  libelle: string;
  description?: string;
  droits: { idFonctionnalite: string; droits: DroitsFonctionnalite }[];
}
