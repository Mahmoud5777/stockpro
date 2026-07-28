// Basé sur la table FONCTIONNALITE du schéma SQL.
// Les noms de champs ci-dessous correspondent EXACTEMENT à FonctionnaliteDTO.java
// (backend) afin d'éviter tout désalignement de contrat JSON.

export type DroitAction =
  | "consultation"
  | "ajout"
  | "modification"
  | "suppression"
  | "export"
  | "impression";

export interface DroitsFonctionnalite {
  consultation: boolean;
  ajout: boolean;
  modification: boolean;
  suppression: boolean;
  export: boolean;
  impression: boolean;
}

/** CRUD administratif d'une fonctionnalité (endpoints /api/fonctionnalites). */
export interface Fonctionnalite {
  idFonc: string;
  codeFonc: string;
  libelle: string;
  description?: string;
  url?: string;
  icone?: string;
  orderAffichage?: number;
  actif: boolean;
  idApp: string;
  idFoncMere?: string | null;
}

export interface FonctionnaliteInput {
  codeFonc: string;
  libelle: string;
  description?: string;
  url?: string;
  icone?: string;
  orderAffichage?: number;
  actif: boolean;
  idApp: string;
  idFoncMere?: string | null;
}
