export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export const ROUTES = {
  login: "/login",
  changePassword: "/change-password",
  dashboard: "/dashboard",
  administration: {
    utilisateurs: "/administration/utilisateurs",
    sites: "/administration/sites",
    profils: "/administration/profils",
    roles: "/administration/roles",
    groupes: "/administration/groupes",
    fonctionnalites: "/administration/fonctionnalites",
    audit: "/administration/audit",
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;
