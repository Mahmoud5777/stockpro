"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useGroupes } from "../hooks/useGroupes";
import { GroupeFormModal } from "../components/GroupeFormModal";
import type { Groupe } from "../types/groupe.types";
import type { GroupeFormValues } from "../validation/groupe.validation";
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
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";

const PERMISSION_CODE = "ADMIN_GROUPES";

export function GroupesPage() {
  const { page, setPage, search, setSearch, filters, updateFilters, resetFilters, sortKey, sortDirection, onSortChange, listQuery, createMutation, updateMutation, removeMutation } = useGroupes();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Groupe | null>(null);
  const [deleting, setDeleting] = useState<Groupe | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet(
        "/groupes/export",
        {
          search,
          filters,
          sort: sortKey ? `${sortKey},${sortDirection}` : undefined,
        },
        "groupes.xlsx"
      );
      toast({ title: "Export réussi", description: "Le fichier Excel a été téléchargé.", variant: "success" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'exporter les groupes.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: GroupeFormValues) {
    if (editing) updateMutation.mutate({ id: editing.idGr, input: values }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(values, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Groupe>[] = [
    { key: "codeGroupe", label: "Code", sortable: true },
    { key: "libelle", label: "Libellé", sortable: true },
    { key: "profils", label: "Profils", render: (row) => row.profils.map((p) => p.libelle).join(", ") || "-" },
    { key: "roles", label: "Rôles", render: (row) => <div className="flex flex-wrap gap-1">{row.roles.map((r) => <Badge key={r.idRl} variant="neutral">{r.libelle}</Badge>)}</div> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Groupes"
        description="Combinez profils et rôles en groupes attribuables aux utilisateurs par site."
        breadcrumb={[{ label: "Administration" }, { label: "Groupes" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>Nouveau groupe</Button>
          </RequirePermission>
        }
      />
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher un groupe..."
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        filtersConfig={[]}
        permissionCode={PERMISSION_CODE}
        onExport={handleExport}
        isExporting={isExporting}
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idGr}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="Aucun groupe"
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
      <GroupeFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Supprimer le groupe"
        description={`Voulez-vous vraiment supprimer "${deleting?.libelle}" ?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idGr, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
