"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FiChevronDown, FiPackage, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { cn } from "@/utils/cn";
import { useMenu } from "@/features/navigation/useMenu";
import { useUiStore } from "@/store/ui.store";
import type { MenuItem } from "@/features/navigation/menu.config";

function MenuNode({ item, collapsed }: { item: MenuItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActiveParent = item.children?.some((c) => c.href && pathname.startsWith(c.href));
  const [open, setOpen] = useState(!!isActiveParent);
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            "text-slate-300 hover:bg-white/5 hover:text-white",
            isActiveParent && "text-white"
          )}
        >
          <span className="flex items-center gap-3">
            <Icon size={18} />
            {!collapsed && item.label}
          </span>
          {!collapsed && (
            <FiChevronDown size={14} className={cn("transition-transform", open && "rotate-180")} />
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-4 mt-1 flex flex-col gap-0.5 border-l border-white/10 pl-3">
            {item.children.map((child) => (
              <MenuNode key={child.label} item={child} collapsed={collapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const active = item.href && pathname.startsWith(item.href);

  return (
    <Link
      href={item.href ?? "#"}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white",
        active && "bg-brand-600/90 text-white hover:bg-brand-600"
      )}
    >
      <Icon size={18} />
      {!collapsed && item.label}
    </Link>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const menu = useMenu();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 268 }}
      transition={{ duration: 0.2 }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col bg-[#0f1424] lg:flex"
    >
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <FiPackage size={18} />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display text-lg font-semibold text-white">StockERP</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {menu.map((item) => (
          <MenuNode key={item.label} item={item} collapsed={sidebarCollapsed} />
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center gap-2 border-t border-white/10 py-3 text-slate-400 hover:text-white"
      >
        {sidebarCollapsed ? <FiChevronsRight size={16} /> : <FiChevronsLeft size={16} />}
      </button>
    </motion.aside>
  );
}
