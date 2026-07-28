"use client";

import { FiBox, FiUsers, FiMapPin, FiTruck } from "react-icons/fi";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { MovementsChart } from "@/features/dashboard/components/MovementsChart";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";
import { RecentLogins } from "@/features/dashboard/components/RecentLogins";
import {
  useDashboardStats,
  useStockMovements,
  useRecentActivity,
  useRecentLogins,
} from "@/features/dashboard/hooks/useDashboardStats";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats } = useDashboardStats();
  const { data: movements } = useStockMovements();
  const { data: activity, isLoading: activityLoading } = useRecentActivity();
  const { data: logins, isLoading: loginsLoading } = useRecentLogins();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
          Bonjour {user?.nomComplet?.split(" ")[0] ?? ""} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Voici un aperçu de l&apos;activité de votre stock aujourd&apos;hui.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Articles en stock" value={stats?.totalArticles ?? "-"} icon={FiBox} accent="brand" />
        <StatCard label="Utilisateurs actifs" value={stats?.totalUtilisateurs ?? "-"} icon={FiUsers} accent="emerald" />
        <StatCard label="Sites" value={stats?.totalSites ?? "-"} icon={FiMapPin} accent="amber" />
        <StatCard label="Fournisseurs" value={stats?.totalFournisseurs ?? "-"} icon={FiTruck} accent="rose" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MovementsChart data={movements ?? []} />
        </div>
        <RecentLogins items={logins} isLoading={loginsLoading} />
      </div>

      <RecentActivity items={activity} isLoading={activityLoading} />
    </div>
  );
}
