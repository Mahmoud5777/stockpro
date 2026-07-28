export interface DashboardStats {
  totalArticles: number;
  totalUtilisateurs: number;
  totalSites: number;
  totalFournisseurs: number;
  entreesStockMois: number;
  sortiesStockMois: number;
  valeurStock: number;
  variationStockPct: number;
}

export interface StockMovementPoint {
  mois: string;
  entrees: number;
  sorties: number;
}

export interface RecentActivityItem {
  id: string;
  libelle: string;
  utilisateur: string;
  date: string;
  type: "creation" | "modification" | "suppression" | "connexion";
}

export interface RecentLoginItem {
  idUtil: string;
  nomComplet: string;
  login: string;
  dateConnexion: string;
  adresseIp?: string;
  statut: "succes" | "echec";
}
