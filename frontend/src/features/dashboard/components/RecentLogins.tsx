"use client";

import { Badge } from "@/components/ui/Badge";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/utils/date";
import type { RecentLoginItem } from "../types/dashboard.types";

export function RecentLogins({ items, isLoading }: { items?: RecentLoginItem[]; isLoading?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-medium text-slate-800 dark:text-slate-100">Dernières connexions</h3>
      {isLoading && <Loader label="Chargement..." />}
      {!isLoading && (!items || items.length === 0) && <EmptyState title="Aucune connexion récente" />}
      {!isLoading && items && items.length > 0 && (
        <ul className="flex flex-col divide-y divide-slate-50 dark:divide-slate-800">
          {items.map((item) => (
            <li key={`${item.idUtil}-${item.dateConnexion}`} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.nomComplet}</p>
                <p className="text-xs text-slate-400">{formatDate(item.dateConnexion, true)} {item.adresseIp && `· ${item.adresseIp}`}</p>
              </div>
              <Badge variant={item.statut === "succes" ? "success" : "danger"}>
                {item.statut === "succes" ? "Succès" : "Échec"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
