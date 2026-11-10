"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { appConfig, entitiesRegistry } from "@/lib/entities-registry";

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const modules = [...new Set(entitiesRegistry.map((entity) => entity.module))];
  return <>
    {open && <button aria-label="Fermer le menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
    <aside aria-label="Navigation principale" className={`sidebar fixed inset-y-0 left-0 z-40 flex w-[268px] shrink-0 flex-col transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <Link href="/dashboard" onClick={onClose} className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">S</span>
        <span className="text-lg font-semibold text-white">{appConfig.name}</span>
      </Link>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <Link href="/dashboard" onClick={onClose} aria-current={pathname === "/dashboard" ? "page" : undefined} className={`sidebar-link ${pathname === "/dashboard" ? "active" : ""}`}>Tableau de bord</Link>
        {modules.map((module) => <div key={module}><p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">{module}</p>
          <div className="space-y-1">{entitiesRegistry.filter((entity) => entity.module === module).map((entity) => <Link key={entity.kebab} href={`/${entity.kebab}`} onClick={onClose}
            aria-current={pathname === `/${entity.kebab}` ? "page" : undefined} className={`sidebar-link ${pathname === `/${entity.kebab}` ? "active" : ""}`}>{entity.label}</Link>)}</div>
        </div>)}
      </nav>
      <div className="border-t border-white/10 p-5 text-xs text-slate-400">{entitiesRegistry.length} modules de données</div>
    </aside>
  </>;
}
