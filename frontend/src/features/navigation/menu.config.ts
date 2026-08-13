import type { ComponentType } from "react";
import {
  FiGrid,
  FiUsers,
  FiMapPin,
  FiShield,
  FiKey,
  FiLayers,
  FiSliders,
  FiBox,
  FiTag,
  FiTruck,
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiClipboard,
  FiBarChart2,
  FiFileText,
} from "react-icons/fi";
import { ROUTES } from "@/lib/constants";

export interface MenuItem {
  label: string;
  href?: string;
  icon: ComponentType<any>;
  /** Code de la fonctionnalité côté backend, utilisé pour le filtrage des droits. Null = toujours visible (ex: Dashboard). */
  code: string | null;
  children?: MenuItem[];
}

export const MENU_CONFIG: MenuItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: FiGrid, code: null },
  {
    label: "Administration",
    icon: FiSliders,
    code: "ADMINISTRATION",
    children: [
      { label: "Utilisateurs", href: ROUTES.administration.utilisateurs, icon: FiUsers, code: "ADMIN_UTILISATEURS" },
      { label: "Sites", href: ROUTES.administration.sites, icon: FiMapPin, code: "ADMIN_SITES" },
      { label: "Profils", href: ROUTES.administration.profils, icon: FiShield, code: "ADMIN_PROFILS" },
      { label: "Rôles", href: ROUTES.administration.roles, icon: FiKey, code: "ADMIN_ROLES" },
      { label: "Groupes", href: ROUTES.administration.groupes, icon: FiLayers, code: "ADMIN_GROUPES" },
      { label: "Fonctionnalités", href: ROUTES.administration.fonctionnalites, icon: FiSliders, code: "ADMIN_FONCTIONNALITES" },
      { label: "Audit des accès", href: ROUTES.administration.audit, icon: FiFileText, code: "ADMIN_AUDIT" },
    ],
  },
  { label: "Articles", href: "/articles", icon: FiBox, code: "ARTICLES" },
  { label: "Catégories", href: "/categories", icon: FiTag, code: "CATEGORIES" },
  { label: "Fournisseurs", href: "/fournisseurs", icon: FiTruck, code: "FOURNISSEURS" },
  { label: "Entrées Stock", href: "/entrees-stock", icon: FiArrowDownCircle, code: "ENTREES_STOCK" },
  { label: "Sorties Stock", href: "/sorties-stock", icon: FiArrowUpCircle, code: "SORTIES_STOCK" },
  { label: "Inventaire", href: "/inventaire", icon: FiClipboard, code: "INVENTAIRE" },
  { label: "Rapports", href: "/rapports", icon: FiBarChart2, code: "RAPPORTS" },
];
