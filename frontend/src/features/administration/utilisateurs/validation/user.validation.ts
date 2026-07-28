import { z } from "zod";

export const userSchema = z.object({
  nomComplet: z.string().min(2, "Le nom complet est requis"),
  login: z.string().min(3, "Le login doit contenir au moins 3 caractères"),
  email: z.string().email("Adresse email invalide"),
  telephone: z.string().optional(),
  etatCompte: z.boolean(),
  motPasse: z.string().min(8, "Minimum 8 caractères").optional().or(z.literal("")),
  siteIds: z.array(z.string()).min(1, "Sélectionnez au moins un site"),
});

export type UserFormValues = z.infer<typeof userSchema>;
