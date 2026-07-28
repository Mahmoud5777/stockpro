import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "./useAuth";
import type { LoginPayload } from "../types/auth.types";
import { toast } from "@/store/toast.store";
import type { AxiosError } from "axios";

export function useLogin() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onMutate: () => setErrorMessage(null),
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ??
        "Identifiants invalides. Veuillez réessayer.";
      setErrorMessage(message);
      toast({ title: "Échec de connexion", description: message, variant: "error" });
    },
  });

  return { ...mutation, errorMessage };
}
