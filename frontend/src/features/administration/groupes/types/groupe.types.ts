// Basé sur GROUPE (champs alignés sur GroupeDTO.java) + GROUPE_PROFIL + GROUPE_ROLE
// (associations gérées via /api/groupe-profils et /api/groupe-roles, voir groupe.service.ts).
export interface Groupe {
  idGr: string;
  codeGroupe: string;
  libelle: string;
  description?: string;
  profils: { idPr: string; libelle: string }[];
  roles: { idRl: string; libelle: string }[];
}

export interface GroupeInput {
  codeGroupe: string;
  libelle: string;
  description?: string;
  profilIds: string[];
  roleIds: string[];
}
