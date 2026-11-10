"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/features/navigation/Sidebar";
import { useAuth } from "@/features/auth/useAuth";
import { appConfig, entitiesRegistry } from "@/lib/entities-registry";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const title = entitiesRegistry.find((entity) => pathname === `/${entity.kebab}`)?.label || "Tableau de bord";
  useEffect(() => {
    const enabled = appConfig.theming && localStorage.getItem("stockpro_theme") === "dark";
    setDark(enabled); document.documentElement.classList.toggle("dark", enabled);
  }, []);
  const toggleTheme = () => {
    const enabled = !dark; setDark(enabled);
    localStorage.setItem("stockpro_theme", enabled ? "dark" : "light");
    document.documentElement.classList.toggle("dark", enabled);
  };
  return <div className="flex min-h-screen">
    <Sidebar open={open} onClose={() => setOpen(false)} />
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="topbar sticky top-0 z-20 flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3"><button className="btn btn-outline lg:hidden" aria-label="Ouvrir le menu" aria-expanded={open} onClick={() => setOpen(true)}>☰</button>
          <span className="text-sm text-muted">{title}</span></div>
        <div className="flex items-center gap-3">
          {appConfig.theming && <button className="btn btn-outline" onClick={toggleTheme} aria-label={dark ? "Activer le thème clair" : "Activer le thème sombre"}>{dark ? "Clair" : "Sombre"}</button>}
          <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary sm:block">{user?.nomComplet || user?.login || "Utilisateur"}</span>
          <button className="text-sm text-muted hover:underline" onClick={logout}>Déconnexion</button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      <footer className="px-6 py-4 text-xs text-muted">{appConfig.name} · Espace de gestion</footer>
    </div>
  </div>;
}
