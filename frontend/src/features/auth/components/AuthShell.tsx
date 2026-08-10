import type { ReactNode } from "react";
import { AnimatedAuthBackground } from "./AnimatedAuthBackground";

interface AuthShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Coque des écrans d'authentification : carte "verre dépoli" centrée sur
 * le fond bleu animé. Le wrapper `.dark` force les composants partagés
 * (Input, Button…) à utiliser leur variante sombre, lisible sur le bleu.
 */
export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <AnimatedAuthBackground />

      <div className="w-full max-w-md animate-slide-up">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-brand-950/40 backdrop-blur-2xl sm:p-10">
          <h1 className="font-display text-2xl font-semibold text-white">{title}</h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-brand-100/85">{description}</p>
          )}

          <div className="dark mt-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-xs text-brand-100/60">
          © {new Date().getFullYear()} StockERP — Tous droits réservés
        </p>
      </div>
    </div>
  );
}