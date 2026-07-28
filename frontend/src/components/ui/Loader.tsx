"use client";

import { FiLoader } from "react-icons/fi";

export function Loader({ label = "Chargement..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-slate-500 dark:text-slate-400">
      <FiLoader className="animate-spin" size={28} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
