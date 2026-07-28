import { z } from "zod";

export const fonctionnaliteSchema = z.object({
  codeFonc: z.string().min(1, "Le code est requis").max(30, "30 caractères maximum"),
  libelle: z.string().min(2, "Le libellé est requis").max(100, "100 caractères maximum"),
  description: z.string().optional(),
  url: z.string().optional(),
  icone: z.string().optional(),
  orderAffichage: z.coerce.number().optional(),
  actif: z.boolean(),
  idApp: z.string().min(1, "L'application est requise"),
  idFoncMere: z.string().optional().nullable(),
});

export type FonctionnaliteFormValues = z.infer<typeof fonctionnaliteSchema>;
