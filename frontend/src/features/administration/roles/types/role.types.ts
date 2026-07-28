// Basé sur la table ROLE (champs alignés sur RoleDTO.java)
export interface Role {
  idRl: string;
  codeRole: string;
  libelle: string;
  description?: string;
}

export interface RoleInput {
  codeRole: string;
  libelle: string;
  description?: string;
}
