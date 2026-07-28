"use client";

import { FiEdit2, FiPlusCircle, FiTrash2, FiLogIn } from "react-icons/fi";
import type { RecentActivityItem } from "../types/dashboard.types";
import { timeAgo } from "@/utils/date";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loader } from "@/components/ui/Loader";

const iconByType = {
  creation: { icon: FiPlusCircle, color: "text-emerald-500" },
  modification: { icon: FiEdit2, color: "text-brand-500" },
  suppression: { icon: FiTrash2, color: "text-red-500" },
  connexion: { icon: FiLogIn, color: "text-amber-500" },
};

export function RecentActivity({ items, isLoading }: { items?: RecentActivityItem[]; isLoading?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-medium text-slate-800 dark:text-slate-100">Activité récente</h3>
      {isLoading && <Loader label="Chargement de l'activité..." />}
      {!isLoading && (!items || items.length === 0) && (
        <EmptyState title="Aucune activité récente" />
      )}
      {!isLoading && items && items.length > 0 && (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const config = iconByType[item.type];
            const Icon = config.icon;
            return (
              <li key={item.id} className="flex items-start gap-3">
                <span className={`mt-0.5 ${config.color}`}>
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{item.libelle}</p>
                  <p className="text-xs text-slate-400">
                    {item.utilisateur} · {timeAgo(item.date)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
