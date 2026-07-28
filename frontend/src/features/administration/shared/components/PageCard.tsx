import type { ReactNode } from "react";

export function PageCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  );
}
