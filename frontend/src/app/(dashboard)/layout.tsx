"use client";

import type { ReactNode } from "react";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}
