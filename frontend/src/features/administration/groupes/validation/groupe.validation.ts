import { z } from "zod";

export const groupeSchema = z.object({
  codeGroupe: z.string().min(1, "Le code est requis"),
  libelle: z.string().min(2, "Le libellé est requis"),
  description: z.string().optional(),
  profilIds: z.array(z.string()).default([]),
  roleIds: z.array(z.string()).default([]),
});

export type GroupeFormValues = z.infer<typeof groupeSchema>;
