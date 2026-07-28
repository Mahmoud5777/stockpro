import { z } from "zod";

export const changeCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newLogin: z
      .string()
      .trim()
      .refine((val) => val === "" || val.length >= 3, {
        message: "Le login doit contenir au moins 3 caractères",
      })
      .optional(),
    newPassword: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Le nouveau mot de passe doit être différent de l'ancien",
    path: ["newPassword"],
  });

export type ChangeCredentialsFormValues = z.infer<typeof changeCredentialsSchema>;
