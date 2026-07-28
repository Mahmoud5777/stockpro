"use client";

import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number; // 0-based
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, totalElements, pageSize, onPageChange }: PaginationProps) {
  if (totalElements === 0) return null;

  const start = page * pageSize + 1;
  const end = Math.min(totalElements, (page + 1) * pageSize);

  const btnBase =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800";

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 sm:flex-row">
      <span>
        Affichage de <span className="font-medium text-slate-700 dark:text-slate-200">{start}</span> à{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{end}</span> sur{" "}
        <span className="font-medium text-slate-700 dark:text-slate-200">{totalElements}</span>
      </span>
      <div className="flex items-center gap-1.5">
        <button className={cn(btnBase)} disabled={page === 0} onClick={() => onPageChange(0)} aria-label="Première page">
          <FiChevronsLeft size={16} />
        </button>
        <button className={cn(btnBase)} disabled={page === 0} onClick={() => onPageChange(page - 1)} aria-label="Page précédente">
          <FiChevronLeft size={16} />
        </button>
        <span className="px-2 text-slate-600 dark:text-slate-300">
          Page {totalPages === 0 ? 0 : page + 1} / {totalPages}
        </span>
        <button
          className={cn(btnBase)}
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Page suivante"
        >
          <FiChevronRight size={16} />
        </button>
        <button
          className={cn(btnBase)}
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(totalPages - 1)}
          aria-label="Dernière page"
        >
          <FiChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
