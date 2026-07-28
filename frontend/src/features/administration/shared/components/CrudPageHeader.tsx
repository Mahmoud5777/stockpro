"use client";

import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { SearchBar } from "@/components/ui/SearchBar";

interface CrudPageHeaderProps {
  title: string;
  description?: string;
  breadcrumb: BreadcrumbItem[];
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
}

export function CrudPageHeader({
  title,
  description,
  breadcrumb,
  search,
  onSearchChange,
  searchPlaceholder,
  actions,
}: CrudPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={breadcrumb} />
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={onSearchChange} placeholder={searchPlaceholder} />
          {actions}
        </div>
      </div>
    </div>
  );
}
