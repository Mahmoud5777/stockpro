"use client";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { appConfig, entitiesRegistry } from "@/lib/entities-registry";
import { apiList } from "@/features/shared/api";
export default function DashboardHome() {
  const counts = useQueries({ queries: entitiesRegistry.map((entity) => ({
    queryKey: [entity.urlPath, "summary"], queryFn: () => apiList(entity.urlPath, { size: 1 }),
  })) });
  return <div className="space-y-8">
    <div><p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">Vue d'ensemble</p><h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
      <p className="mt-2 text-sm text-muted">Bienvenue dans {appConfig.name}. Retrouvez vos données et vos espaces de travail.</p></div>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{entitiesRegistry.map((entity, index) => <Link href={`/${entity.kebab}`} key={entity.kebab} className="card p-6 transition-shadow hover:shadow-md">
      <div className="mb-5 flex items-center justify-between"><span className="text-sm font-medium text-muted">{entity.label}</span><span className="rounded-lg bg-primary/10 px-3 py-2 text-primary">↗</span></div>
      <p className="text-3xl font-semibold">{counts[index].isPending ? "…" : counts[index].isError ? "—" : counts[index].data?.totalElements}</p>
      <p className="mt-2 text-xs text-muted">{counts[index].isError ? "Données indisponibles" : "Enregistrements"} · {entity.module}</p>
    </Link>)}</div>
    <section className="card p-6"><h2 className="mb-4 text-lg font-semibold">Accès rapide</h2><div className="flex flex-wrap gap-3">{entitiesRegistry.map((entity) => <Link key={entity.kebab} href={`/${entity.kebab}`} className="btn btn-outline">Gérer {entity.label}</Link>)}</div></section>
  </div>;
}
