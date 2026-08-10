"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FiKey, FiLock, FiUser } from "react-icons/fi";
import {
  changeCredentialsSchema,
  type ChangeCredentialsFormValues,
} from "../validation/change-credentials.validation";
import { useChangeCredentials } from "../hooks/useChangeCredentials";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ChangeCredentialsForm() {
  const { mutate, isPending, errorMessage } = useChangeCredentials();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangeCredentialsFormValues>({
    resolver: zodResolver(changeCredentialsSchema),
    reValidateMode: "onChange",
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutate({
          currentPassword: values.currentPassword,
          newLogin: values.newLogin,
          newPassword: values.newPassword,
        })
      )}
      className="flex flex-col gap-4"
    >
      <Input
        label="Mot de passe actuel (temporaire)"
        type="password"
        placeholder="••••••••"
        leftIcon={<FiKey size={16} />}
        error={errors.currentPassword?.message}
        autoComplete="current-password"
        {...register("currentPassword")}
      />

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <Input
        label="Nouveau login (optionnel)"
        placeholder="ex: jdupont"
        leftIcon={<FiUser size={16} />}
        hint="Laissez vide pour garder le login actuel"
        error={errors.newLogin?.message}
        autoComplete="username"
        {...register("newLogin")}
      />
      <Input
        label="Nouveau mot de passe"
        type="password"
        placeholder="••••••••"
        leftIcon={<FiLock size={16} />}
        error={errors.newPassword?.message}
        autoComplete="new-password"
        {...register("newPassword")}
      />
      <Input
        label="Confirmer le nouveau mot de passe"
        type="password"
        placeholder="••••••••"
        leftIcon={<FiLock size={16} />}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        {...register("confirmPassword")}
      />

      {errorMessage && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      <Button type="submit" isLoading={isPending} className="mt-2 w-full">
        Valider et continuer
      </Button>
    </form>
  );
}
