"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import { useUsers } from "../hooks/useUsers";
import { UserFormModal } from "../components/UserFormModal";
import type { Utilisateur } from "../types/user.types";
import type { UserFormValues } from "../validation/user.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { formatDate } from "@/utils/date";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const PERMISSION_CODE = "ADMIN_UTILISATEURS";

export function UsersPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useUsers();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleting, setDeleting] = useState<Utilisateur | null>(null);

  function handleSubmit(values: UserFormValues) {
    const input = { ...values, motPasse: values.motPasse || undefined };
    if (editing) {
      updateMutation.mutate({ id: editing.idUtil, input }, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
    }
  }

  const columns: DataTableColumn<Utilisateur>[] = [
    { key: "nomComplet", label: "Nom complet", sortable: true },
    { key: "login", label: "Login", sortable: true },
    { key: "email", label: "Email" },
    { key: "sites", label: "Sites", render: (row) => row.sites.map((s) => s.nomSite).join(", ") || "-" },
    {
      key: "etatCompte",
      label: "État",
      render: (row) => (
        <Badge variant={row.etatCompte ? "success" : "danger"}>
          {row.etatCompte ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    { key: "dateCreation", label: "Créé le", render: (row) => formatDate(row.dateCreation) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Utilisateurs"
        description="Gérez les comptes utilisateurs et leurs sites d'affectation."
        breadcrumb={[{ label: "Administration" }, { label: "Utilisateurs" }]}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un utilisateur..."
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiUserPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              Nouvel utilisateur
            </Button>
          </RequirePermission>
        }
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
              <RequirePermission code={PERMISSION_CODE} action="modification">
                <button
                  onClick={() => { setEditing(row); setFormOpen(true); }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
                  aria-label="Modifier"
                >
                  <FiEdit2 size={15} />
                </button>
              </RequirePermission>
              <RequirePermission code={PERMISSION_CODE} action="suppression">
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
        onConfirm={() => deleting && removeMutation.mutate(deleting.idUtil, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
