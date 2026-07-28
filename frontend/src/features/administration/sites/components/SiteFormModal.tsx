"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { siteSchema, type SiteFormValues } from "../validation/site.validation";
import type { Site } from "../types/site.types";
import { siteService } from "../services/site.service";

interface SiteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: SiteFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Site | null;
}

export function SiteFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: SiteFormModalProps) {
  const isEdit = !!initialData;
  const { data: sites } = useQuery({ queryKey: ["sites", "all"], queryFn: siteService.listAll, enabled: isOpen });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<SiteFormValues>({ resolver: zodResolver(siteSchema) });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              codeSite: initialData.codeSite,
              nomSite: initialData.nomSite,
              description: initialData.description ?? "",
              address: initialData.address ?? "",
              idSiteParent: initialData.idSiteParent ?? "",
            }
          : { codeSite: "", nomSite: "", description: "", address: "", idSiteParent: "" }
      );
    }
  }, [isOpen, initialData, reset]);

  const parentOptions = (sites ?? [])
    .filter((s) => s.idSite !== initialData?.idSite)
    .map((s) => ({ value: s.idSite, label: s.nomSite }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier le site" : "Nouveau site"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Enregistrer" : "Créer"}</Button>
        </>
      }
    >
      <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Code site" error={errors.codeSite?.message} {...register("codeSite")} />
        <Input label="Libellé" error={errors.nomSite?.message} {...register("nomSite")} />
        <Input label="Adresse" className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
        <Controller
          control={control}
          name="idSiteParent"
          render={({ field }) => (
            <Select
              label="Site parent (optionnel)"
              placeholder="Aucun"
              options={parentOptions}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />
        <Input label="Description" className="sm:col-span-2" error={errors.description?.message} {...register("description")} />
      </form>
    </Modal>
  );
}
