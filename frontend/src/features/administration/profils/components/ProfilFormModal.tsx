"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { profilSchema, type ProfilFormValues } from "../validation/profil.validation";
import type { Profil } from "../types/profil.types";
import { fonctionnaliteService } from "@/features/administration/fonctionnalites/services/fonctionnalite.service";
import { ProfilDroitsMatrix } from "./ProfilDroitsMatrix";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ProfilFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Profil | null;
}

const EMPTY_DROITS = { consultation: false, ajout: false, modification: false, suppression: false, export: false, impression: false };

export function ProfilFormModal({ isOpen, onClose, onSubmit, isSubmitting, initialData }: Props) {
  const isEdit = !!initialData;
  const { data: fonctionnalites, isLoading: loadingFoncs } = useQuery({
    queryKey: ["fonctionnalites", "all"],
    queryFn: fonctionnaliteService.listAll,
    enabled: isOpen,
  });

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ProfilFormValues>({
    resolver: zodResolver(profilSchema),
  });

  useEffect(() => {
    if (isOpen && fonctionnalites) {
      const droits = fonctionnalites.map((f) => {
        const existing = initialData?.droits.find((d) => d.idFonctionnalite === f.idFonc);
        return { idFonctionnalite: f.idFonc, droits: existing?.droits ?? EMPTY_DROITS };
      });
      reset(
        initialData
          ? { codeProfil: initialData.codeProfil, libelle: initialData.libelle, description: initialData.description ?? "", droits }
          : { codeProfil: "", libelle: "", description: "", droits }
      );
    }
  }, [isOpen, initialData, fonctionnalites, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Modifier le profil" : "Nouveau profil"}
      description="Définissez les droits d'accès (consultation, ajout, modification, suppression, export, impression) par fonctionnalité."
      size="xl"
      footer={<>
        <Button variant="outline" onClick={onClose}>Annuler</Button>
        <Button isLoading={isSubmitting} onClick={handleSubmit(onSubmit)}>{isEdit ? "Enregistrer" : "Créer"}</Button>
      </>}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Code profil" error={errors.codeProfil?.message} {...register("codeProfil")} />
          <Input label="Libellé" error={errors.libelle?.message} {...register("libelle")} />
          <Input label="Description" className="sm:col-span-2" error={errors.description?.message} {...register("description")} />
        </div>

        {loadingFoncs ? (
          <Loader label="Chargement des fonctionnalités..." />
        ) : (
          <ProfilDroitsMatrix control={control} fonctionnalites={fonctionnalites ?? []} />
        )}
      </form>
    </Modal>
  );
}
