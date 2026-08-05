"use client";

import type { ElementType } from "react";
import { FiArrowDownRight, FiArrowUpRight } from "react-icons/fi";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ElementType;
  variationPct?: number;
  accent?: "brand" | "emerald" | "amber" | "rose";
}

const accentClasses = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400",
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  rose: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

export function StatCard({ label, value, icon: Icon, variationPct, accent = "brand" }: StatCardProps) {
  const positive = (variationPct ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", accentClasses[accent])}>
          <Icon size={19} />
        </span>
        {typeof variationPct === "number" && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              positive ? "text-emerald-600" : "text-red-500"
            )}
          >
            {positive ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />}
            {Math.abs(variationPct)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </motion.div>
  );
}
