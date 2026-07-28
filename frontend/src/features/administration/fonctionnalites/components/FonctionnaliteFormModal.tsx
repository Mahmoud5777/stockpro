"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { fonctionnaliteSchema, type FonctionnaliteFormValues } from "../validation/fonctionnalite.validation";
import type { Fonctionnalite } from "../types/fonctionnalite.types";
import { fonctionnaliteService } from "../services/fonctionnalite.service";
import { applicationService } from "@/features/administration/shared/services/application.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FonctionnaliteFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Fonctionnalite | null;
}

export function FonctionnaliteFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const { data: all } = useQuery({ queryKey: ["fonctionnalites", "all"], queryFn: fonctionnaliteService.listAll, enabled: isOpen });
  const { data: applications } = useQuery({ queryKey: ["applications", "all"], queryFn: applicationService.listAll, enabled: isOpen });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FonctionnaliteFormValues>({
    resolver: zodResolver(fonctionnaliteSchema),
    defaultValues: { actif: true },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              codeFonc: initialData.codeFonc,
              libelle: initialData.libelle,
              description: initialData.description ?? "",
              url: initialData.url ?? "",
              icone: initialData.icone ?? "",
              orderAffichage: initialData.orderAffichage ?? 0,
              actif: initialData.actif,
              idApp: initialData.idApp,
              idFoncMere: initialData.idFoncMere ?? "",
            }
          : { codeFonc: "", libelle: "", description: "", url: "", icone: "", orderAffichage: 0, actif: true, idApp: "", idFoncMere: "" }
      );
    }
  }, [isOpen, initialData, reset]);

  const parentOptions = (all ?? [])
    .filter((f) => f.idFonc !== initialData?.idFonc)
    .map((f) => ({ value: f.idFonc, label: f.libelle }));

  const applicationOptions = (applications ?? []).map((a) => ({ value: a.idApp, label: a.nomApp }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier la fonctionnalité" : "Nouvelle fonctionnalité"}
      size="lg"
      footer={<>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Enregistrer" : "Créer"}</Button>
      </>}
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code" error={errors.codeFonc?.message} {...register("codeFonc")} />
        <Input label="Libellé" error={errors.libelle?.message} {...register("libelle")} />
        <Input label="URL" placeholder="/administration/utilisateurs" error={errors.url?.message} {...register("url")} />
        <Input label="Icône (react-icons)" placeholder="FiUsers" error={errors.icone?.message} {...register("icone")} />
        <Controller
          control={control}
          name="idApp"
          render={({ field }) => (
            <Select label="Application" placeholder="Sélectionner..." options={applicationOptions} error={errors.idApp?.message} value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        <Input label="Ordre d'affichage" type="number" error={errors.orderAffichage?.message} {...register("orderAffichage")} />
        <Controller
          control={control}
          name="idFoncMere"
          render={({ field }) => (
            <Select label="Fonctionnalité parente" placeholder="Aucune (menu racine)" options={parentOptions} value={field.value ?? ""} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="actif"
          render={({ field }) => (
            <div className="flex items-center pt-6">
              <Checkbox label="Fonctionnalité active" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
            </div>
          )}
        />
        <Input label="Description" className="sm:col-span-2" error={errors.description?.message} {...register("description")} />
      </form>
    </Modal>
  );
}
