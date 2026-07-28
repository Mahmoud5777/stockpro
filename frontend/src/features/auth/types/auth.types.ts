import type { DroitsFonctionnalite } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";

export interface LoginPayload {
  login: string;
  motPasse: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
  // true = compte temporaire : l'utilisateur doit changer login/mot de passe
  // avant d'accéder au reste de l'application (voir /change-password).
  doitChangerMdp: boolean;
}

/**
 * Fonctionnalité + droits résolus pour l'utilisateur connecté.
 * Correspond à FonctionnaliteAvecDroitsDTO côté backend (endpoint /auth/me),
 * qui est INTENTIONNELLEMENT différent du DTO CRUD administratif FonctionnaliteDTO
 * (voir features/administration/fonctionnalites/types/fonctionnalite.types.ts).
 */
export interface FonctionnaliteAvecDroits {
  idFonctionnalite: string;
  codFonctionnalite: string;
  libFonctionnalite: string;
  description?: string;
  url?: string;
  icone?: string;
  orderAffichage?: number;
  actif: boolean;
  idApplication: string;
  parentIdFonctionnalite?: string | null;
  droits: DroitsFonctionnalite;
}

export interface AuthenticatedUser {
  idUtil: string;
  nomComplet: string;
  login: string;
  email: string;
  sites: { idSite: string; libSite: string }[];
  // Fonctionnalités + droits (CRUD) résolues côté backend
  // à partir des profils/rôles/groupes de l'utilisateur.
  fonctionnalites: FonctionnaliteAvecDroits[];
  doitChangerMdp?: boolean;
}

export interface ChangeCredentialsPayload {
  currentPassword: string;
  newLogin?: string;
  newPassword: string;
}
