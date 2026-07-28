"use client";

import { Controller, type Control } from "react-hook-form";
import { Checkbox } from "@/components/ui/Checkbox";
import type { ProfilFormValues } from "../validation/profil.validation";
import type { Fonctionnalite, DroitAction } from "@/features/administration/fonctionnalites/types/fonctionnalite.types";

const ACTIONS: { key: DroitAction; label: string }[] = [
  { key: "consultation", label: "Consultation" },
  { key: "ajout", label: "Ajout" },
  { key: "modification", label: "Modification" },
  { key: "suppression", label: "Suppression" },
  { key: "export", label: "Export" },
  { key: "impression", label: "Impression" },
];

interface Props {
  control: Control<ProfilFormValues>;
  fonctionnalites: Fonctionnalite[];
}

/**
 * Matrice fonctionnalités x actions (CRUD + export/impression), reflétant
 * la table PROFIL_DROIT du backend (une ligne par fonctionnalité et par profil).
 */
export function ProfilDroitsMatrix({ control, fonctionnalites }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
            <th className="px-3 py-2.5 font-medium">Fonctionnalité</th>
            {ACTIONS.map((a) => (
              <th key={a.key} className="px-3 py-2.5 text-center font-medium">{a.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fonctionnalites.map((fonc, index) => (
            <tr key={fonc.idFonc} className="border-b border-slate-50 dark:border-slate-800/60">
              <td className="px-3 py-2 text-slate-700 dark:text-slate-200">{fonc.libelle}</td>
              {ACTIONS.map((a) => (
                <td key={a.key} className="px-3 py-2 text-center">
                  <Controller
                    control={control}
                    name={`droits.${index}.droits.${a.key}` as `droits.${number}.droits.consultation`}
                    render={({ field }) => (
                      <Checkbox checked={field.value ?? false} onChange={(e) => field.onChange(e.target.checked)} />
                    )}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
