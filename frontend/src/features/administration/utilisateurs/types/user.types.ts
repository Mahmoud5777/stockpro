// Basé sur la table UTILISATEUR (champs alignés sur UserDTO.java) + USER_SITE
// (affectation aux sites gérée via /api/user-sites, voir user.service.ts).
//
// etatCompte est un booléen côté backend (colonne ETAT_COMPTE BOOL en base) :
// pas d'enum ACTIF/INACTIF/SUSPENDU, qui n'existe pas dans le schéma SQL.
export interface Utilisateur {
  idUtil: string;
  nomComplet: string;
  login: string;
  email: string;
  telephone?: string;
  etatCompte: boolean;
  dateCreation: string;
  // idUtilSite = clé de la ligne USER_SITE, nécessaire pour affecter un profil/groupe/rôle
  // à cet utilisateur sur ce site précis (table USER_SITE_DROITS).
  sites: { idSite: string; nomSite: string; idUtilSite: string }[];
}

export interface UtilisateurInput {
  nomComplet: string;
  login: string;
  email: string;
  telephone?: string;
  etatCompte: boolean;
  motPasse?: string; // requis à la création, optionnel en modification (réinitialisation)
  siteIds: string[];
}

/**
 * Basé sur USER_SITE_DROITS (champs alignés sur UserSiteDroitsDTO.java) :
 * affecte, pour un utilisateur sur un site donné (idUtilSite), UN SEUL de
 * idPr (profil), idGr (groupe) ou idRl (rôle) — les trois autres champs restent nuls.
 */
export interface UserSiteDroit {
  idUserSiteDroit: string;
  idUtilSite: string;
  idPr?: string | null;
  idGr?: string | null;
  idRl?: string | null;
  dateAffectation?: string;
}

export interface UserSiteDroitInput {
  idUtilSite: string;
  idPr?: string | null;
  idGr?: string | null;
  idRl?: string | null;
}
