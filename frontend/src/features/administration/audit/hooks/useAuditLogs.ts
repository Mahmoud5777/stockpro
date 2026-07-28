"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/audit.service";
import type { AuditActionType } from "../types/audit.types";
import type { SortDirection } from "@/types/common";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export function useAuditLogs() {
  const [page, setPage] = useState(0);
  const [search, setSearchState] = useState(""); // filtre sur le login (voir audit.service.ts)
  const [action, setActionState] = useState<AuditActionType | "">("");
  // Tri par défaut aligné sur le champ réel du backend (LOG_ACCES.DATE_ACCES).
  const [sortKey, setSortKey] = useState<string | undefined>("dateAcces");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sort = sortKey ? `${sortKey},${sortDirection}` : undefined;

  const listQuery = useQuery({
    queryKey: ["audit-acces", "list", { page, search, action, sort }],
    queryFn: () => auditService.list({ page, size: DEFAULT_PAGE_SIZE, login: search, action, sort }),
    placeholderData: (prev) => prev,
  });

  function onSortChange(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDirection("asc");
    } else {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  return {
    page,
    setPage,
    search,
    setSearch: (v: string) => { setSearchState(v); setPage(0); },
    action,
    setAction: (v: string) => { setActionState(v as AuditActionType | ""); setPage(0); },
    sortKey,
    sortDirection,
    onSortChange,
    listQuery,
  };
}
