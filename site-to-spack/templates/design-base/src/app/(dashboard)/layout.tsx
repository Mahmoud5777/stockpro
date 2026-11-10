"use client";

import ProtectedRoute from "@/features/auth/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function DashboardLayoutRoute({
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
