"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
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
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const router = useRouter();
  const { setAuth } = useAuth();

  const onSubmit = async (values: FormValues) => {
    setError("");
    try {
      const res = await apiClient.post("/api/auth/login", values);
      setAuth(res.data.token, res.data);
      router.replace("/dashboard");
    } catch {
      setError("Connexion impossible. Vérifiez vos identifiants et la disponibilité du serveur.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <div>
        <label htmlFor="login" className="block text-sm font-medium">Login</label>
        <input
          {...register("login")}
          id="login" autoComplete="username" className="input mt-1"
        />
        {errors.login && (
          <p className="text-sm text-red-500">{errors.login.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Mot de passe</label>
        <input
          type="password"
          {...register("password")}
          id="password" autoComplete="current-password" className="input mt-1"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn btn-primary w-full"
      >
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
