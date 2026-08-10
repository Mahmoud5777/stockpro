"use client";

import { FiLogIn, FiLogOut, FiRefreshCw, FiActivity, FiXCircle } from "react-icons/fi";
import { useAuditLogs } from "../hooks/useAuditLogs";
import type { AuditLog, AuditActionType } from "../types/audit.types";
import type { FilterConfig } from "@/features/administration/shared/types/filter-config.types";
import { CrudPageHeader } from "@/features/administration/shared/components/CrudPageHeader";
import { PageCard } from "@/features/administration/shared/components/PageCard";
import { SearchToolbar } from "@/features/administration/shared/components/SearchToolbar";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/utils/date";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// Valeurs alignées sur l'enum backend AuditAction.java (voir audit.types.ts).
const ACTION_CONFIG: Record<AuditActionType, { label: string; variant: "success" | "danger" | "neutral" | "brand" | "warning"; icon: typeof FiLogIn }> = {
  LOGIN_SUCCESS: { label: "Connexion réussie", variant: "success", icon: FiLogIn },
  LOGIN_FAILURE: { label: "Échec de connexion", variant: "danger", icon: FiXCircle },
  LOGOUT: { label: "Déconnexion", variant: "neutral", icon: FiLogOut },
  REFRESH_TOKEN: { label: "Rafraîchissement token", variant: "brand", icon: FiRefreshCw },
  ACCES_API: { label: "Appel API", variant: "warning", icon: FiActivity },
};

const ACTION_OPTIONS = Object.entries(ACTION_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

const FILTERS_CONFIG: FilterConfig[] = [
  {
    key: "action",
    label: "Événement",
    type: "select",
    options: ACTION_OPTIONS,
    className: "w-56",
  },
];

/**
 * Page 100% lecture seule : consultation du journal des accès
 * (connexions, échecs, déconnexions, refresh de token, appels API authentifiés).
 * Aucune action de création/modification/suppression n'est proposée ici.
 */
export function AuditPage() {
  const { page, setPage, search, setSearch, filters, updateFilters, resetFilters, sortKey, sortDirection, onSortChange, listQuery } = useAuditLogs();

  const columns: DataTableColumn<AuditLog>[] = [
    { key: "dateAcces", label: "Date & heure", sortable: true, render: (row) => formatDate(row.dateAcces, true) },
    { key: "login", label: "Utilisateur", render: (row) => row.login },
    {
      key: "action",
      label: "Événement",
      render: (row) => {
        const cfg = ACTION_CONFIG[row.action];
        if (!cfg) return row.action;
        const Icon = cfg.icon;
        return (
          <Badge variant={cfg.variant}>
            <span className="flex items-center gap-1"><Icon size={12} /> {cfg.label}</span>
          </Badge>
        );
      },
    },
    {
      key: "endpoint",
      label: "Endpoint",
      render: (row) => (
        <span className="text-xs">
          {row.methodeHttp && <span className="font-mono font-medium text-slate-500 dark:text-slate-400">{row.methodeHttp}</span>}{" "}
          {row.endpoint ?? "-"}
          {row.statutHttp != null && (
            <span className={row.statutHttp >= 400 ? "ml-1 text-red-500" : "ml-1 text-slate-400"}>
              ({row.statutHttp})
            </span>
          )}
        </span>
      ),
    },
    { key: "adresseIp", label: "Adresse IP", render: (row) => row.adresseIp ?? "-" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <CrudPageHeader
        title="Audit des accès"
        description="Consultez l'historique des connexions, déconnexions et appels API (lecture seule)."
        breadcrumb={[{ label: "Administration" }, { label: "Audit des accès" }]}
      />
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Rechercher par login, endpoint, IP..."
        filters={filters}
        updateFilters={updateFilters}
        resetFilters={resetFilters}
        filtersConfig={FILTERS_CONFIG}
      />
      <PageCard>
        <DataTable
          columns={columns}
          data={listQuery.data?.content ?? []}
          rowKey={(row) => row.idLog}
          isLoading={listQuery.isLoading}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          emptyTitle="Aucun événement d'accès"
          emptyDescription="Aucune connexion ou tentative d'accès enregistrée pour ces critères."
        />
        <Pagination
          page={page}
          totalPages={listQuery.data?.totalPages ?? 0}
          totalElements={listQuery.data?.totalElements ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </PageCard>
    </div>
  );
}
