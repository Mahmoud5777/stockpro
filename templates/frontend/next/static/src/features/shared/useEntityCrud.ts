"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiList, apiRemove, apiUpdate, type ListQuery } from "./api";

export const DEFAULT_PAGE_SIZE = 10;

export function useEntityCrud(entity: { urlPath: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, filters]);

  const query: ListQuery = {
    page,
    size: DEFAULT_PAGE_SIZE,
  };
  if (debouncedSearch.trim()) query.search = debouncedSearch.trim();
  if (Object.keys(filters).length > 0) query.filters = filters;

  const list = useQuery({
    queryKey: [entity.urlPath, query],
    queryFn: () => apiList<Record<string, unknown>>(entity.urlPath, query),
  });

  const create = useMutation({
    mutationFn: (data: unknown) => apiCreate(entity.urlPath, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity.urlPath] }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      apiUpdate(entity.urlPath, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity.urlPath] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiRemove(entity.urlPath, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [entity.urlPath] }),
  });

  return { list, create, update, remove, search, setSearch, filters, setFilters, page, setPage };
}
