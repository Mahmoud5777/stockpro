import { z } from "zod";

const droitsSchema = z.object({
  consultation: z.boolean(),
  ajout: z.boolean(),
  modification: z.boolean(),
  suppression: z.boolean(),
  export: z.boolean(),
  impression: z.boolean(),
});

export const profilSchema = z.object({
  codeProfil: z.string().min(1, "Le code est requis"),
  libelle: z.string().min(2, "Le libellé est requis"),
  description: z.string().optional(),
  droits: z.array(z.object({ idFonctionnalite: z.string(), droits: droitsSchema })),
});

export type ProfilFormValues = z.infer<typeof profilSchema>;
