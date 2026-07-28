"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useSites } from "../hooks/useSites";
import { SiteFormModal } from "../components/SiteFormModal";
import type { Site } from "../types/site.types";
import type { SiteFormValues } from "../validation/site.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

const PERMISSION_CODE = "ADMIN_SITES";

export function SitesPage() {
  const {
    page, setPage, search, setSearch, sortKey, sortDirection, onSortChange,
    listQuery, createMutation, updateMutation, removeMutation,
  } = useSites();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState<Site | null>(null);

  function handleSubmit(values: SiteFormValues) {
    const input = { ...values, idSiteParent: values.idSiteParent || null };
    if (editing) updateMutation.mutate({ id: editing.idSite, input }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Site>[] = [
    { key: "codeSite", label: "Code", sortable: true },
    { key: "nomSite", label: "Libellé", sortable: true },
    { key: "parentNomSite", label: "Site parent", render: (row) => row.parentNomSite ?? "-" },
    { key: "address", label: "Adresse", render: (row) => row.address ?? "-" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Sites"
        description="Gérez les sites et dépôts, ainsi que leur hiérarchie."
        breadcrumb={[{ label: "Administration" }, { label: "Sites" }]}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un site..."
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
              Nouveau site
            </Button>
          </RequirePermission>
        }
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idSite}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="Aucun site"
          actions={(row) => (
            <div className="flex justify-end gap-1">
              <RequirePermission code={PERMISSION_CODE} action="modification">
                <button onClick={() => { setEditing(row); setFormOpen(true); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800">
                  <FiEdit2 size={15} />
                </button>
              </RequirePermission>
              <RequirePermission code={PERMISSION_CODE} action="suppression">
                <button onClick={() => setDeleting(row)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40">
                  <FiTrash2 size={15} />
                </button>
              </RequirePermission>
            </div>
          )}
        />
        <Pagination page={page} totalPages={listQuery.data?.totalPages ?? 0} totalElements={listQuery.data?.totalElements ?? 0} pageSize={DEFAULT_PAGE_SIZE} onPageChange={setPage} />
      </PageCard>

      <SiteFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Supprimer le site"
        description={`Voulez-vous vraiment supprimer "${deleting?.nomSite}" ?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idSite, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
