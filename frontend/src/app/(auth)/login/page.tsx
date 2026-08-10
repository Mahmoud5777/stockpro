import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthShell } from "@/features/auth/components/AuthShell";

export const metadata = { title: "Connexion — StockERP" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Connexion"
      description="Connectez-vous avec les identifiants fournis par votre administrateur."
    >
      <LoginForm />
    </AuthShell>
  );
}