import { z } from "zod";

export const roleSchema = z.object({
  codeRole: z.string().min(1, "Le code est requis"),
  libelle: z.string().min(2, "Le libellé est requis"),
  description: z.string().optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
