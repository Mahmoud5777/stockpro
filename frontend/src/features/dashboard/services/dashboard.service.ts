import { apiClient } from "@/lib/axios";
import type { DashboardStats, StockMovementPoint, RecentActivityItem, RecentLoginItem } from "../types/dashboard.types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
    return data;
  },
  async getMovements(): Promise<StockMovementPoint[]> {
    const { data } = await apiClient.get<StockMovementPoint[]>("/dashboard/mouvements-stock");
    return data;
  },
  async getRecentActivity(): Promise<RecentActivityItem[]> {
    const { data } = await apiClient.get<RecentActivityItem[]>("/dashboard/activites-recentes");
    return data;
  },
  async getRecentLogins(): Promise<RecentLoginItem[]> {
    const { data } = await apiClient.get<RecentLoginItem[]>("/dashboard/dernieres-connexions");
    return data;
  },
};
