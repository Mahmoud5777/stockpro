import type { Page, PageRequest } from "@/types/common";

/**
 * Contrat générique qu'un service d'entité (user.service, site.service, ...)
 * doit respecter pour être utilisable par le hook useEntityCrud.
 */
export interface CrudService<TEntity, TInput> {
  list: (params: PageRequest) => Promise<Page<TEntity>>;
  create: (input: TInput) => Promise<TEntity>;
  update: (id: string, input: TInput) => Promise<TEntity>;
  remove: (id: string) => Promise<void>;
  /** Optionnel : liste complète non paginée, utilisée dans les selects/multi-selects d'autres modules. */
  listAll?: () => Promise<TEntity[]>;
}
