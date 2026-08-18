"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useFonctionnalites } from "../hooks/useFonctionnalites";
import { FonctionnaliteFormModal } from "../components/FonctionnaliteFormModal";
import type { Fonctionnalite } from "../types/fonctionnalite.types";
import type { FonctionnaliteFormValues } from "../validation/fonctionnalite.validation";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchToolbar } from "@/features/administration/shared/components/SearchToolbar";
import type { FilterConfig } from "@/features/administration/shared/types/filter-config.types";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RequirePermission } from "@/features/auth/components/RequirePermission";
import { applicationService } from "@/features/administration/shared/services/application.service";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { downloadSpreadsheet } from "@/lib/download";
import { toast } from "@/store/toast.store";

const PERMISSION_CODE = "ADMIN_FONCTIONNALITES";

const FILTERS_CONFIG: FilterConfig[] = [
  {
    key: "applicationId",
    label: "Application",
    type: "select",
    fetchOptions: async () => {
      const apps = await applicationService.listAll();
      return apps.map((a) => ({ value: a.idApp, label: a.nomApp }));
    },
    className: "w-72",
  },
];

export function FonctionnalitesPage() {
  const { page, setPage, search, setSearch, filters, updateFilters, resetFilters, sortKey, sortDirection, onSortChange, listQuery, createMutation, updateMutation, removeMutation } = useFonctionnalites();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Fonctionnalite | null>(null);
  const [deleting, setDeleting] = useState<Fonctionnalite | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadSpreadsheet(
        "/fonctionnalites/export",
        {
          search,
          filters,
          sort: sortKey ? `${sortKey},${sortDirection}` : undefined,
        },
        "fonctionnalites.xlsx"
      );
      toast({ title: "Export réussi", description: "Le fichier Excel a été téléchargé.", variant: "success" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'exporter les fonctionnalités.", variant: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  function handleSubmit(values: FonctionnaliteFormValues) {
    const input = { ...values, idFoncMere: values.idFoncMere || null };
    if (editing) updateMutation.mutate({ id: editing.idFonc, input }, { onSuccess: () => setFormOpen(false) });
    else createMutation.mutate(input, { onSuccess: () => setFormOpen(false) });
  }

  const columns: DataTableColumn<Fonctionnalite>[] = [
    { key: "codeFonc", label: "Code", sortable: true },
    { key: "libelle", label: "Libellé", sortable: true },
    { key: "url", label: "URL", render: (row) => row.url ?? "-" },
    { key: "orderAffichage", label: "Ordre", align: "center", render: (row) => row.orderAffichage ?? "-" },
    { key: "actif", label: "Statut", render: (row) => <Badge variant={row.actif ? "success" : "neutral"}>{row.actif ? "Active" : "Inactive"}</Badge> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Fonctionnalités"
        description="Définissez les fonctionnalités de l'application et leur menu associé."
        breadcrumb={[{ label: "Administration" }, { label: "Fonctionnalités" }]}
        actions={
          <RequirePermission code={PERMISSION_CODE} action="ajout">
            <Button leftIcon={<FiPlus size={16} />} onClick={() => { setEditing(null); setFormOpen(true); }}>Nouvelle fonctionnalité</Button>
          </RequirePermission>
        }
      />
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher une fonctionnalité..."
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        filtersConfig={FILTERS_CONFIG}
        permissionCode={PERMISSION_CODE}
        onExport={handleExport}
        isExporting={isExporting}
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idFonc}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="Aucune fonctionnalité"
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
      <FonctionnaliteFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isSubmitting={createMutation.isPending || updateMutation.isPending} initialData={editing} />
      <ConfirmDialog
        isOpen={!!deleting}
        title="Supprimer la fonctionnalité"
        description={`Voulez-vous vraiment supprimer "${deleting?.libelle}" ?`}
        isLoading={removeMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={() => deleting && removeMutation.mutate(deleting.idFonc, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  );
}
