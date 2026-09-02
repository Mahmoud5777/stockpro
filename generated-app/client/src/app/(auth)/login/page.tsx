import LoginForm from "@/features/auth/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-2xl font-semibold text-center">StockPro</h1>
        <LoginForm />
      </div>
    </main>
  );
}
