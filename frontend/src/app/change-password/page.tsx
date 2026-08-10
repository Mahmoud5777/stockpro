"use client";

import { ChangeCredentialsForm } from "@/features/auth/components/ChangeCredentialsForm";
import { RequireTemporaryAccount } from "@/features/auth/components/RequireTemporaryAccount";
import { AuthShell } from "@/features/auth/components/AuthShell";

export default function ChangePasswordPage() {
  return (
    <RequireTemporaryAccount>
      <AuthShell
        title="Changement obligatoire"
        description="Pour des raisons de sécurité, vous devez définir un nouveau mot de passe (et éventuellement un nouveau login) avant d'accéder à l'application."
      >
        <ChangeCredentialsForm />
      </AuthShell>
    </RequireTemporaryAccount>
  );
}