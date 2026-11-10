"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiCreate, apiList, apiRemove, apiUpdate, type ListOptions } from "./api";

export function useEntityCrud(entity: { urlPath: string }, options: ListOptions = {}) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [entity.urlPath, options],
    queryFn: () => apiList(entity.urlPath, options),
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

  return { list, create, update, remove };
}
