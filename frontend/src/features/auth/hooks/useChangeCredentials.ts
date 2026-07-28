import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AxiosError } from "axios";
import { authService } from "../services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/lib/constants";
import { toast } from "@/store/toast.store";
import type { ChangeCredentialsPayload } from "../types/auth.types";

export function useChangeCredentials() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: ChangeCredentialsPayload) => authService.changeCredentials(payload),
    onMutate: () => setErrorMessage(null),
    onSuccess: async (_data, variables) => {
      // Recharge le profil complet (fonctionnalites/sites résolues) maintenant
      // que le compte n'est plus temporaire, plutôt que de patcher localement
      // un objet dont on ne connaît pas encore les vrais droits.
      const refreshed = await authService.me();
      setUser({
        ...refreshed,
        login: variables.newLogin?.trim() ? variables.newLogin.trim() : refreshed.login,
      });
      toast({
        title: "Identifiants mis à jour",
        description: "Vous pouvez maintenant accéder à l'application.",
        variant: "success",
      });
      router.replace(ROUTES.dashboard);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ??
        "Impossible de changer les identifiants. Vérifiez le mot de passe actuel.";
      setErrorMessage(message);
      toast({ title: "Échec", description: message, variant: "error" });
    },
  });

  return { ...mutation, errorMessage };
}
