"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchToolbar } from "@/features/administration/shared/components/SearchToolbar";
import type { FilterConfig } from "@/features/administration/shared/types/filter-config.types";
import { DataTable, Pagination, Button, ConfirmDialog } from "@/components/ui";
import { useEntityCrud } from "@/features/administration/shared/hooks/useEntityCrud";
import { userService } from "@/features/administration/utilisateurs/services/user.service";
import { siteService } from "@/features/administration/sites/services/site.service";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { UserFormModal } from "@/features/administration/utilisateurs/components/UserFormModal";
import type { Utilisateur, UtilisateurInput } from "@/features/administration/utilisateurs/types/user.types";

const FILTERS_CONFIG: FilterConfig[] = [
  {
    key: "etatCompte",
    label: "État",
    type: "select",
    options: [
      { value: "true", label: "Actif" },
      { value: "false", label: "Inactif" },
    ],
    className: "w-44",
  },
  {
    key: "siteId",
    label: "Site",
    type: "select",
    fetchOptions: async () => {
      const sites = await siteService.listAll();
      return sites.map((s) => ({ value: s.idSite, label: s.nomSite }));
    },
    className: "w-72",
  },
];

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

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleting, setDeleting] = useState<Utilisateur | null>(null);

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

      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un utilisateur..."
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        filtersConfig={FILTERS_CONFIG}
      />

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