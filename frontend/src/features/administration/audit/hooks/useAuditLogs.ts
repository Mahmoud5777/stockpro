"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditService } from "../services/audit.service";
import type { AuditActionType } from "../types/audit.types";
import type { SortDirection } from "@/types/common";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export function useAuditLogs() {
  const [page, setPage] = useState(0);
  const [search, setSearchState] = useState("");
  const [filters, setFilters] = useState<Record<string, string | boolean | undefined>>({});
  const [sortKey, setSortKey] = useState<string | undefined>("dateAcces");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sort = sortKey ? `${sortKey},${sortDirection}` : undefined;

  const listQuery = useQuery({
    queryKey: ["audit-acces", "list", { page, search, filters, sort }],
    queryFn: () =>
      auditService.list({ page, size: DEFAULT_PAGE_SIZE, search, filters, sort }),
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

  const updateFilters = (patch: Record<string, string | boolean | undefined>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({});
    setPage(0);
  };

  return {
    page,
    setPage,
    search,
    setSearch: (v: string) => {
      setSearchState(v);
      setPage(0);
    },
    filters,
    updateFilters,
    resetFilters,
    sortKey,
    sortDirection,
    onSortChange,
    listQuery,
  };
}