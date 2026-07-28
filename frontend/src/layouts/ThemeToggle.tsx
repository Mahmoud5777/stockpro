"use client";

import { useEffect } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { useUiStore } from "@/store/ui.store";

export function ThemeToggle() {
  const { theme, setTheme } = useUiStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
      aria-label="Changer le thème"
    >
      {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
}
