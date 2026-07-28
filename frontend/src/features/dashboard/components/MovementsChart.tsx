"use client";

import type { StockMovementPoint } from "../types/dashboard.types";

/**
 * Mini graphique en barres codé sans librairie de charting externe
 * (dépendances du projet: pas de recharts imposé) — volontairement léger.
 */
export function MovementsChart({ data }: { data: StockMovementPoint[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.entrees, d.sorties]));

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-slate-800 dark:text-slate-100">Mouvements de stock (12 derniers mois)</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" /> Entrées</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Sorties</span>
        </div>
      </div>
      <div className="flex h-48 items-end gap-2">
        {data.map((point) => (
          <div key={point.mois} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-40 w-full items-end justify-center gap-0.5">
              <div
                className="w-2.5 rounded-t bg-brand-500"
                style={{ height: `${(point.entrees / max) * 100}%` }}
                title={`Entrées: ${point.entrees}`}
              />
              <div
                className="w-2.5 rounded-t bg-amber-400"
                style={{ height: `${(point.sorties / max) * 100}%` }}
                title={`Sorties: ${point.sorties}`}
              />
            </div>
            <span className="text-[10px] text-slate-400">{point.mois}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
