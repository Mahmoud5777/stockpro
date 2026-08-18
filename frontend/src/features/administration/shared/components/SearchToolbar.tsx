"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiPlus, FiX, FiDownload } from "react-icons/fi";
import { Select, Button } from "@/components/ui";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import type { SelectOption } from "@/types/common";
import type { FilterConfig } from "../types/filter-config.types";
import { cn } from "@/utils/cn";

export interface SearchToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters: Record<string, string | boolean | undefined>;
  updateFilters: (patch: Record<string, string | boolean | undefined>) => void;
  resetFilters: () => void;
  filtersConfig: FilterConfig[];
  /** Code de fonctionnalité (ex: "ADMIN_UTILISATEURS") requis pour afficher le bouton d'export. */
  permissionCode?: string;
  /** Déclenche l'export Excel des résultats de la recherche (bouton vert à côté de la barre). */
  onExport?: () => void;
  isExporting?: boolean;
}

function getOptions(config: FilterConfig): SelectOption[] {
  if (config.options?.length) return config.options;
  if (config.type === "boolean") {
    return [
      { value: "true", label: "Oui" },
      { value: "false", label: "Non" },
    ];
  }
  return [];
}

/**
 * Barre de recherche universelle (système de recherche réutilisable par toutes les
 * sections Administration) : champ plein texte + filtres dynamiques ajoutables/
 * supprimables + bouton "Réinitialiser". Le contenu est piloté par `filtersConfig`.
 */
export function SearchToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Rechercher...",
  filters,
  updateFilters,
  resetFilters,
  filtersConfig,
  permissionCode,
  onExport,
  isExporting,
}: SearchToolbarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  useEffect(() => setLocalSearch(search), [search]);
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localSearch !== search) onSearchChange(localSearch);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const availableConfigs = useMemo(
    () => filtersConfig.filter((c) => !activeFilters.includes(c.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeFilters]
  );

  const hasActiveCriteria =
    activeFilters.length > 0 ||
    Boolean(search) ||
    Object.values(filters).some((v) => v !== undefined && v !== "");

  const addFilter = (key: string) => {
    setActiveFilters((prev) => [...prev, key]);
    setFilterMenuOpen(false);
  };

  const removeFilter = (key: string) => {
    setActiveFilters((prev) => prev.filter((k) => k !== key));
    updateFilters({ [key]: undefined });
  };

  const resetAll = () => {
    setActiveFilters([]);
    resetFilters();
    setLocalSearch("");
    onSearchChange("");
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-stretch gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-brand-500"
          />
        </div>

        {onExport && (
          <RequirePermission code={permissionCode ?? ""} action="export">
            <Button
              variant="success"
              size="md"
              className="h-[42px] shrink-0"
              onClick={onExport}
              isLoading={isExporting}
              leftIcon={<FiDownload size={16} />}
            >
              Export Excel
            </Button>
          </RequirePermission>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
        {filtersConfig
          .filter((c) => activeFilters.includes(c.key))
          .map((config) => (
            <FilterControl
              key={config.key}
              config={config}
              value={filters[config.key]}
              onChange={(value) => updateFilters({ [config.key]: value || undefined })}
              onRemove={() => removeFilter(config.key)}
            />
          ))}

        {availableConfigs.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setFilterMenuOpen((v) => !v)}
              className="mb-1.5 flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
            >
              <FiPlus size={16} />
              Ajouter un filtre
            </button>

            {filterMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterMenuOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {availableConfigs.map((config) => (
                    <button
                      key={config.key}
                      onClick={() => addFilter(config.key)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <FiPlus size={14} className="text-brand-500" />
                      {config.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {hasActiveCriteria && (
          <div className="ml-auto">
            <Button variant="outline" onClick={resetAll} size="sm">
              Réinitialiser
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface FilterControlProps {
  config: FilterConfig;
  value: string | boolean | undefined;
  onChange: (value: string | undefined) => void;
  onRemove: () => void;
}

function FilterControl({ config, value, onChange, onRemove }: FilterControlProps) {
  const [options, setOptions] = useState<SelectOption[]>(() => getOptions(config));

  useQuery({
    queryKey: ["search-toolbar", "options", config.key],
    queryFn: async () => {
      if (!config.fetchOptions) return null;
      const fetched = await config.fetchOptions();
      setOptions(fetched);
      return fetched;
    },
    enabled: Boolean(config.fetchOptions),
  });

  const rawValue = typeof value === "string" ? value : value === true ? "true" : value === false ? "false" : "";

  return (
    <div
      className={cn(
        "flex items-end gap-1",
        config.className ?? (config.type === "text" ? "w-64" : "w-44")
      )}
    >
      {config.type === "text" ? (
        <input
          type="text"
          value={rawValue}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder={config.placeholder ?? config.label}
          className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      ) : (
        <Select
          label={config.label}
          value={rawValue}
          onChange={(e) => onChange(e.target.value || undefined)}
          options={[{ value: "", label: "Tous" }, ...options]}
          className="w-full"
        />
      )}
      <button
        onClick={onRemove}
        className="mb-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
        aria-label={`Retirer le filtre ${config.label}`}
      >
        <FiX size={14} />
      </button>
    </div>
  );
}