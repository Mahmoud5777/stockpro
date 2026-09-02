"use client";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
