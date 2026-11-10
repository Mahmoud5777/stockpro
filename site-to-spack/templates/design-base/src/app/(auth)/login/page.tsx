import LoginForm from "@/features/auth/login/LoginForm";
import { appConfig } from "@/lib/entities-registry";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold">{appConfig.name}</h1>
        <LoginForm />
      </div>
    </main>
  );
}
