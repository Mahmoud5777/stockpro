"use client";

import type { ReactNode } from "react";
import { FiArrowDown, FiArrowUp, FiChevronDown } from "react-icons/fi";
import { Loader } from "./Loader";
import { EmptyState } from "./EmptyState";
import { cn } from "@/utils/cn";
import type { SortDirection } from "@/types/common";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string) => void;
  actions?: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  isLoading,
  emptyTitle = "Aucune donnée",
  emptyDescription = "Aucun enregistrement à afficher pour le moment.",
  sortKey,
  sortDirection,
  onSortChange,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 font-medium",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortable && "cursor-pointer select-none hover:text-slate-600"
                )}
                onClick={() => col.sortable && onSortChange?.(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortable &&
                    (sortKey === col.key ? (
                      sortDirection === "asc" ? (
                        <FiArrowUp size={12} />
                      ) : (
                        <FiArrowDown size={12} />
                      )
                    ) : (
                      <FiChevronDown size={12} className="opacity-40" />
                    ))}
                </span>
              </th>
            ))}
            {actions && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {!isLoading &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-b border-slate-50 text-slate-700 transition-colors hover:bg-slate-50/70 dark:border-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800/40"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-4 py-3",
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {col.render ? col.render(row) : (row as Record<string, ReactNode>)[col.key]}
                  </td>
                ))}
                {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
              </tr>
            ))}
        </tbody>
      </table>
      {isLoading && <Loader label="Chargement des données..." />}
      {!isLoading && data.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  );
}
