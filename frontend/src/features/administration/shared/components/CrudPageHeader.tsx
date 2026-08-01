"use client";

import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { SearchBar } from "@/components/ui/SearchBar";

interface CrudPageHeaderProps {
  title: string;
  description?: string;
  breadcrumb: BreadcrumbItem[];
  search?: string;
  onSearchChange?: (value: string) => void;
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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-1">
        <Breadcrumb items={breadcrumb} />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {search !== undefined && onSearchChange && (
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}
        {actions}
      </div>
    </div>
  );
}