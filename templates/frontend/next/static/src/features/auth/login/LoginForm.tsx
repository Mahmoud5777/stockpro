"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/axios";
import { useAuth } from "@/features/auth/useAuth";

const schema = z.object({
  login: z.string().min(1, "Login requis"),
  password: z.string().min(1, "Mot de passe requis"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const router = useRouter();
  const { setAuth } = useAuth();

  const onSubmit = async (values: FormValues) => {
    const res = await apiClient.post("/api/auth/login", values);
    setAuth(res.data.token, res.data);
    router.replace("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Login</label>
        <input
          {...register("login")}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {errors.login && (
          <p className="text-sm text-red-500">{errors.login.message}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">Mot de passe</label>
        <input
          type="password"
          {...register("password")}
          className="mt-1 w-full rounded border px-3 py-2"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
