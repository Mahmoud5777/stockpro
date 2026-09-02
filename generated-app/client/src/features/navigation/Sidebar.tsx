"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { entitiesRegistry } from "@/lib/entities-registry";
import { useAuth } from "@/features/auth/useAuth";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-60 flex-col bg-slate-900 text-slate-100">
      <div className="p-4 text-lg font-semibold">StockPro</div>
      <nav className="flex-1 space-y-1 p-2">
        <Link
          href="/dashboard"
          className="block rounded px-3 py-2 hover:bg-slate-700"
        >
          Tableau de bord
        </Link>
        {entitiesRegistry.map((e) => {
          const active = pathname === `/${e.kebab}`;
          return (
            <Link
              key={e.kebab}
              href={`/${e.kebab}`}
              className={`block rounded px-3 py-2 hover:bg-slate-700 ${
                active ? "bg-slate-700" : ""
              }`}
            >
              {e.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-700 p-4 text-sm">
        <div className="mb-2">{user?.login ?? ""}</div>
        <button onClick={logout} className="text-red-300 hover:underline">
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
