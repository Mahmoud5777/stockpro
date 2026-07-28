"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CrudService } from "../types/crud-service.types";
import type { SortDirection } from "@/types/common";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { toast } from "@/store/toast.store";

interface UseEntityCrudOptions {
  resourceKey: string;
  entityLabel: string; // ex: "l'utilisateur", "le site" -- pour les messages
}

/**
 * Hook générique factorisant la logique CRUD (liste paginée/triée/recherchée,
 * création, modification, suppression) pour un module d'administration donné.
 * Chaque module (utilisateurs, sites, profils, ...) l'utilise avec son propre
 * service typé, ce qui évite toute duplication de logique entre modules.
 */
export function useEntityCrud<TEntity, TInput>(
  service: CrudService<TEntity, TInput>,
  { resourceKey, entityLabel }: UseEntityCrudOptions
) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sort = sortKey ? `${sortKey},${sortDirection}` : undefined;

  const listQuery = useQuery({
    queryKey: [resourceKey, "list", { page, search, sort }],
    queryFn: () => service.list({ page, size: DEFAULT_PAGE_SIZE, search, sort }),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: [resourceKey, "list"] });

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
    listQuery,
    createMutation,
    updateMutation,
    removeMutation,
  };
}
