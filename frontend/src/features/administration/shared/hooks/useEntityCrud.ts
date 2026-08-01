"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CrudService } from "../types/crud-service.types";
import type { SortDirection } from "@/types/common";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { toast } from "@/store/toast.store";

interface UseEntityCrudOptions {
  resourceKey: string;
  entityLabel: string;
}

export function useEntityCrud<TItem, TInput>(
  service: CrudService<TItem, TInput>,
  { resourceKey, entityLabel }: UseEntityCrudOptions
) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filters, setFilters] = useState<Record<string, string | boolean | undefined>>({});

  const sort = sortKey ? `${sortKey},${sortDirection}` : undefined;

  const listQuery = useQuery({
    queryKey: [resourceKey, "list", { page, search, sort, filters }],
    queryFn: () => service.list({ page, size: DEFAULT_PAGE_SIZE, search, sort, filters }),
    placeholderData: (prev) => prev,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [resourceKey, "list"] });

  const createMutation = useMutation({
    mutationFn: (input: TInput) => service.create(input),
    onSuccess: () => {
      toast({ title: "Créé avec succès", description: `${entityLabel} a été ajouté(e).`, variant: "success" });
      invalidate();
    },
    onError: () => toast({ title: "Erreur", description: `Impossible de créer ${entityLabel}.`, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TInput }) => service.update(id, input),
    onSuccess: () => {
      toast({ title: "Modifié avec succès", description: `${entityLabel} a été mis(e) à jour.`, variant: "success" });
      invalidate();
    },
    onError: () => toast({ title: "Erreur", description: `Impossible de modifier ${entityLabel}.`, variant: "error" }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => service.remove(id),
    onSuccess: () => {
      toast({ title: "Supprimé", description: `${entityLabel} a été supprimé(e).`, variant: "success" });
      invalidate();
    },
    onError: () => toast({ title: "Erreur", description: `Impossible de supprimer ${entityLabel}.`, variant: "error" }),
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
    setSearch: (value: string) => {
      setSearch(value);
      setPage(0);
    },
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
  };
}