"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiEdit2, FiTrash2, FiUserPlus, FiSearch, FiPlus, FiX } from "react-icons/fi";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, Pagination, Button, Select, ConfirmDialog } from "@/components/ui";
import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { userService } from "@/features/administration/utilisateurs/services/user.service";
import { siteService } from "@/features/administration/sites/services/site.service";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { UserFormModal } from "@/features/administration/utilisateurs/components/UserFormModal";
import type { Utilisateur, UtilisateurInput } from "@/features/administration/utilisateurs/types/user.types";

const ALL_FILTERS = ["etatCompte", "siteId"] as const;
type FilterKey = (typeof ALL_FILTERS)[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  etatCompte: "État",
  siteId: "Site",
};

// ═══ NAMED EXPORT (pas default) — obligatoire car page.tsx fait : import { UsersPage } ═══
export function UsersPage() {
  const {
    page,
    setPage,
    search,
    setSearch,
    sortKey,
    sortDirection,
    onSortChange,
    filters,
    updateFilters,
    resetFilters,
    listQuery,
    createMutation,
    updateMutation,
    removeMutation,
  } = useEntityCrud(userService, { resourceKey: "users", entityLabel: "l'utilisateur" });

  // ═══ Sites pour le dropdown : liste complète (non paginée) ═══
  const { data: allSites } = useQuery({
    queryKey: ["sites", "all"],
    queryFn: () => siteService.listAll(),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleting, setDeleting] = useState<Utilisateur | null>(null);
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const statusValue = filters.etatCompte === undefined ? "" : String(filters.etatCompte);

  const availableFilterKeys = ALL_FILTERS.filter((f) => !activeFilters.includes(f));

  const addFilter = (key: FilterKey) => {
    setActiveFilters((prev) => [...prev, key]);
    setFilterMenuOpen(false);
  };

  const removeFilter = (key: FilterKey) => {
    setActiveFilters((prev) => prev.filter((k) => k !== key));
    updateFilters({ [key]: undefined });
  };

  const resetAll = () => {
    setActiveFilters([]);
    resetFilters();
    setSearch("");
  };

  const handleSubmit = (data: UtilisateurInput) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.idUtil, input: data },
        { onSuccess: () => setFormOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
    }
  };

  const columns = [
    { key: "nomComplet", label: "Nom complet", sortable: true },
    { key: "login", label: "Login", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "etatCompte",
      label: "État",
      render: (row: Utilisateur) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            row.etatCompte
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.etatCompte ? "Actif" : "Inactif"}
        </span>
      ),
    },
    {
      key: "sites",
      label: "Sites",
      render: (row: Utilisateur) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {row.sites.map((s) => s.nomSite).join(", ") || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Utilisateurs"
        description="Gérez les comptes utilisateurs et leurs sites d'affectation."
        breadcrumb={[{ label: "Administration" }, { label: "Utilisateurs" }]}
        actions={
          <RequirePermission code="ADMIN_UTILISATEURS" action="ajout">
            <Button
              leftIcon={<FiUserPlus size={16} />}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Nouvel utilisateur
            </Button>
          </RequirePermission>
        }
      />

      {/* ═══ RECHERCHE PLEINE LARGEUR ═══ */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-brand-500"
          />
        </div>
      </div>

      {/* ═══ FILTRES DYNAMIQUES ═══ */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-end gap-3">
          {activeFilters.includes("etatCompte") && (
            <div className="flex items-end gap-1">
              <Select
                label="État"
                value={statusValue}
                onChange={(e) => {
                  const value = e.target.value;
                  updateFilters({
                    etatCompte: value === "" ? undefined : value === "true",
                  });
                }}
                options={[
                  { value: "", label: "Tous" },
                  { value: "true", label: "Actif" },
                  { value: "false", label: "Inactif" },
                ]}
                className="w-44"
              />
              <button
                onClick={() => removeFilter("etatCompte")}
                className="mb-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                aria-label="Retirer le filtre État"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          {activeFilters.includes("siteId") && (
            <div className="flex items-end gap-1">
              <Select
                label="Site"
                value={typeof filters.siteId === "string" ? filters.siteId : ""}
                onChange={(e) =>
                  updateFilters({ siteId: e.target.value || undefined })
                }
                options={[
                  { value: "", label: "Tous" },
                  ...(allSites ?? []).map((site) => ({
                    value: site.idSite,
                    label: site.nomSite,
                  })),
                ]}
                className="w-72"
              />
              <button
                onClick={() => removeFilter("siteId")}
                className="mb-2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                aria-label="Retirer le filtre Site"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          {availableFilterKeys.length > 0 && (
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
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFilterMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                    {availableFilterKeys.map((key) => (
                      <button
                        key={key}
                        onClick={() => addFilter(key)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <FiPlus size={14} className="text-brand-500" />
                        {FILTER_LABELS[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {(activeFilters.length > 0 ||
            search ||
            Object.values(filters).some(Boolean)) && (
            <div className="ml-auto">
              <Button variant="outline" onClick={resetAll} size="sm">
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
      </div>

      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idUtil}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="Aucun utilisateur"
          emptyDescription="Commencez par créer votre premier utilisateur."
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <RequirePermission code="ADMIN_UTILISATEURS" action="modification">
                <button
                  onClick={() => {
                    setEditing(row);
                    setFormOpen(true);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                  aria-label="Modifier"
                >
                  <FiEdit2 size={15} />
                </button>
              </RequirePermission>
              <RequirePermission code="ADMIN_UTILISATEURS" action="suppression">
                <button
                  onClick={() => setDeleting(row)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                  aria-label="Supprimer"
                >
                  <FiTrash2 size={15} />
                </button>
              </RequirePermission>
            </div>
          )}
        />
        <Pagination
          page={page}
          totalPages={listQuery.data?.totalPages ?? 0}
          totalElements={listQuery.data?.totalElements ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </PageCard>

      <UserFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        initialData={editing}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        title="Supprimer l'utilisateur"
        description={`Voulez-vous vraiment supprimer "${deleting?.nomComplet}" ? Cette action est irréversible.`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          removeMutation.mutate(deleting.idUtil, {
            onSuccess: () => setDeleting(null),
          })
        }
      />
    </div>
  );
}