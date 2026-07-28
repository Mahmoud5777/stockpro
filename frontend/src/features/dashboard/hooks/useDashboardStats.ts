import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard.service";

export function useDashboardStats() {
  return useQuery({ queryKey: ["dashboard", "stats"], queryFn: dashboardService.getStats });
}

export function useStockMovements() {
  return useQuery({ queryKey: ["dashboard", "movements"], queryFn: dashboardService.getMovements });
}

export function useRecentActivity() {
  return useQuery({ queryKey: ["dashboard", "recent-activity"], queryFn: dashboardService.getRecentActivity });
}

export function useRecentLogins() {
  return useQuery({ queryKey: ["dashboard", "recent-logins"], queryFn: dashboardService.getRecentLogins });
}
