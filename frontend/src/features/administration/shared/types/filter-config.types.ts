import type { SelectOption } from "@/types/common";

/**
 * Configuration déclarative d'un filtre du SearchToolbar universel.
 * Chaque page Administration la fournit (voir le dossier pages de chaque module).
 */
export interface FilterConfig {
  /** Nom du paramètre envoyé au backend (doit correspondre à un champ déclaré côté backend). */
  key: string;
  /** Libellé affiché dans le menu "Ajouter un filtre" et au-dessus du contrôle. */
  label: string;
  type: "text" | "select" | "boolean";
  /** Options statiques (sélecteur). L'option "Tous" est ajoutée automatiquement. */
  options?: SelectOption[];
  /** Options chargées dynamiquement (ex: sites via siteService.listAll()). */
  fetchOptions?: () => Promise<SelectOption[]>;
  /** Classe de largeur du contrôle (ex: "w-44", "w-72"). */
  className?: string;
  /** Placeholder du champ texte (type "text"). */
  placeholder?: string;
}