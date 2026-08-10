"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useProfils } from "../hooks/useProfils";
import { ProfilFormModal } from "../components/ProfilFormModal";
import type { Profil } from "../types/profil.types";
import type { ProfilFormValues } from "../validation/profil.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchToolbar } from "@/features/administration/shared/components/SearchToolbar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const PERMISSION_CODE = "ADMIN_PROFILS";

export function ProfilsPage() {
  const { page, setPage, search, setSearch, filters, updateFilters, resetFilters, sortKey, sortDirection, onSortChange, listQuery, createMutation, updateMutation, removeMutation } = useProfils();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profil | null>(null);
  const [deleting, setDeleting] = useState<Profil | null>(null);

  function handleSubmit(values: ProfilFormValues) {
    if (editing) updateMutation.mutate({ id: editing.idPr, input: values }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Profil>[] = [
    { key: "codeProfil", label: "Code", sortable: true },
    { key: "libelle", label: "Libellé", sortable: true },
    { key: "description", label: "Description", render: (row) => row.description ?? "-" },
    {
      key: "droits",
      label: "Fonctionnalités",
      align: "center",
      render: (row) => <Badge variant="brand">{row.droits.filter((d) => d.droits.consultation).length}</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Profils"
        description="Définissez des profils de droits réutilisables, applicables via les groupes."
        breadcrumb={[{ label: "Administration" }, { label: "Profils" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>Nouveau profil</Button>
          </RequirePermission>
        }
      />
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un profil..."
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        filtersConfig={[]}
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idPr}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="Aucun profil"
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <RequirePermission code={PERMISSION_CODE} action="modification">
                <button onClick={() => { setEditing(row); setFormOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"><FiEdit2 size={15} /></button>
              </RequirePermission>
              <RequirePermission code={PERMISSION_CODE} action="suppression">
                <button onClick={() => setDeleting(row)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"><FiTrash2 size={15} /></button>
              </RequirePermission>
            </div>
          )}
        />
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} totalElements={listQuery.data?.totalElements ?? 0} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </PageCard>
      <ProfilFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Supprimer le profil"
        description={`Voulez-vous vraiment supprimer "${deleting?.libelle}" ?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idPr, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
