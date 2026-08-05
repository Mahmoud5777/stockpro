"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { userSchema, type UserFormValues } from "../validation/user.validation";
import type { Utilisateur } from "../types/user.types";
import { siteService } from "@/features/administration/sites/services/site.service";
import { UserSiteDroitsTab } from "./UserSiteDroitsTab";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Utilisateur | null;
}

type TabKey = "infos" | "droits";

export function UserFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const [tab, setTab] = useState<TabKey>("infos");
  const { data: sites } = useQuery({ queryKey: ["sites", "all"], queryFn: siteService.listAll, enabled: isOpen });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { etatCompte: true, siteIds: [] },
  });

  useEffect(() => {
    if (isOpen) setTab("infos");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              nomComplet: initialData.nomComplet,
              login: initialData.login,
              email: initialData.email,
              telephone: initialData.telephone ?? "",
              etatCompte: initialData.etatCompte,
              motPasse: "",
              siteIds: initialData.sites.map((s) => s.idSite),
            }
          : { nomComplet: "", login: "", email: "", telephone: "", etatCompte: true, motPasse: "", siteIds: [] }
      );
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      size="lg"
      footer={
        tab === "infos" ? (
          <>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Enregistrer" : "Créer"}</Button>
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>Fermer</Button>
        )
      }
    >
      <div className="mb-4 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setTab("infos")}
          className={cn(
            "border-b-2 px-3 pb-2 text-sm font-medium transition-colors",
            tab === "infos"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          Informations
        </button>
        <button
          type="button"
          disabled={!isEdit}
          onClick={() => isEdit && setTab("droits")}
          title={!isEdit ? "Enregistrez d'abord l'utilisateur pour affecter des profils/groupes/rôles" : undefined}
          className={cn(
            "border-b-2 px-3 pb-2 text-sm font-medium transition-colors",
            tab === "droits"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300",
            !isEdit && "cursor-not-allowed opacity-40"
          )}
        >
          Sites & droits
        </button>
      </div>

      {tab === "infos" ? (
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Nom complet" error={errors.nomComplet?.message} {...register("nomComplet")} />
          <Input label="Login" error={errors.login?.message} {...register("login")} />
          <Input label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <Input label="Téléphone" error={errors.telephone?.message} {...register("telephone")} />
          <Input
            label={isEdit ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}
            type="password"
            autoComplete="new-password"
            spellCheck={false}
            error={errors.motPasse?.message}
            {...register("motPasse")}
          />
          <Controller
            control={control}
            name="etatCompte"
            render={({ field }) => (
              <div className="flex items-center pt-6">
                <Checkbox label="Compte actif" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
              </div>
            )}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Sites affectés</label>
            <Controller
              control={control}
              name="siteIds"
              render={({ field }) => (
                <select
                  multiple
                  className="h-32 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  value={field.value}
                  onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
                >
                  {(sites ?? []).map((s) => (
                    <option key={s.idSite} value={s.idSite}>{s.nomSite}</option>
                  ))}
                </select>
              )}
            />
            {errors.siteIds && <p className="mt-1 text-xs text-red-500">{errors.siteIds.message}</p>}
            <p className="mt-1 text-xs text-slate-400">
              Après avoir enregistré, utilisez l&apos;onglet &quot;Sites & droits&quot; pour affecter un profil,
              un groupe ou un rôle à l&apos;utilisateur sur chacun de ces sites.
            </p>
          </div>
        </form>
      ) : (
        initialData && <UserSiteDroitsTab user={initialData} />
      )}
    </Modal>
  );
}
