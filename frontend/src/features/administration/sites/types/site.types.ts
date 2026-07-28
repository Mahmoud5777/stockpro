// Basé sur la table SITE (champs alignés sur SiteDTO.java, hiérarchie via idSiteParent)
export interface Site {
  idSite: string;
  codeSite: string;
  nomSite: string;
  description?: string;
  address?: string;
  idSiteParent?: string | null;
  /** Libellé du site parent, résolu côté frontend (non présent dans SiteDTO). */
  parentNomSite?: string | null;
}

export interface SiteInput {
  codeSite: string;
  nomSite: string;
  description?: string;
  address?: string;
  idSiteParent?: string | null;
}
