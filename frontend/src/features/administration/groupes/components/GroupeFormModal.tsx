"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { groupeSchema, type GroupeFormValues } from "../validation/groupe.validation";
import type { Groupe } from "../types/groupe.types";
import { profilService } from "@/features/administration/profils/services/profil.service";
import { roleService } from "@/features/administration/roles/services/role.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: GroupeFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Groupe | null;
}

export function GroupeFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const { data: profils } = useQuery({ queryKey: ["profils", "all"], queryFn: profilService.listAll, enabled: isOpen });
  const { data: roles } = useQuery({ queryKey: ["roles", "all"], queryFn: roleService.listAll, enabled: isOpen });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<GroupeFormValues>({
    resolver: zodResolver(groupeSchema),
    defaultValues: { profilIds: [], roleIds: [] },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              codeGroupe: initialData.codeGroupe,
              libelle: initialData.libelle,
              description: initialData.description ?? "",
              profilIds: initialData.profils.map((p) => p.idPr),
              roleIds: initialData.roles.map((r) => r.idRl),
            }
          : { codeGroupe: "", libelle: "", description: "", profilIds: [], roleIds: [] }
      );
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier le groupe" : "Nouveau groupe"}
      description="Un groupe combine un ou plusieurs profils et rôles, attribuables aux utilisateurs par site."
      size="lg"
      footer={<>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Enregistrer" : "Créer"}</Button>
      </>}
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code groupe" error={errors.codeGroupe?.message} {...register("codeGroupe")} />
        <Input label="Libellé" error={errors.libelle?.message} {...register("libelle")} />
        <Input label="Description" className="sm:col-span-2" error={errors.description?.message} {...register("description")} />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Profils</label>
          <Controller
            control={control}
            name="profilIds"
            render={({ field }) => (
              <select
                multiple
                className="h-32 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={field.value}
                onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
              >
                {(profils ?? []).map((p) => (
                  <option key={p.idPr} value={p.idPr}>{p.libelle}</option>
                ))}
              </select>
            )}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Rôles</label>
          <Controller
            control={control}
            name="roleIds"
            render={({ field }) => (
              <select
                multiple
                className="h-32 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                value={field.value}
                onChange={(e) => field.onChange(Array.from(e.target.selectedOptions, (o) => o.value))}
              >
                {(roles ?? []).map((r) => (
                  <option key={r.idRl} value={r.idRl}>{r.libelle}</option>
                ))}
              </select>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
