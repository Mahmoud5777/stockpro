"use client";

import { useState } from "react";
import { FiBell, FiChevronDown, FiLogOut, FiMenu, FiUser } from "react-icons/fi";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUiStore } from "@/store/ui.store";

export function Topbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useUiStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-surface-dark/80">
      <button
        onClick={toggleSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <FiMenu size={18} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          <FiBell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300">
              <FiUser size={16} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.nomComplet ?? "Utilisateur"}</p>
              <p className="text-xs text-slate-400">{user?.login}</p>
            </div>
            <FiChevronDown size={14} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white py-1.5 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <button
                onClick={() => logout()}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <FiLogOut size={15} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
