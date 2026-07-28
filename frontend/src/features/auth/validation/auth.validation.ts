import { z } from "zod";

export const loginSchema = z.object({
  login: z.string().min(1, "Le login est requis"),
  motPasse: z.string().min(1, "Le mot de passe est requis"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
