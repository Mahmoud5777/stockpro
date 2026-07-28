import { FiPackage } from "react-icons/fi";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata = { title: "Connexion — StockERP" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 p-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <FiPackage size={20} />
          </div>
          <span className="font-display text-xl font-semibold">StockERP</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight">
            Pilotez votre stock <br /> en toute simplicité.
          </h1>
          <p className="mt-4 max-w-md text-brand-100/80">
            Gestion des utilisateurs, sites, articles, entrées et sorties de stock, dans une
            interface unique pensée pour les équipes terrain.
          </p>
        </div>
        <p className="text-sm text-brand-200/60">© {new Date().getFullYear()} StockERP</p>
      </div>

      <div className="flex w-full flex-col justify-center px-6 sm:px-16 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">
            Connexion
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Connectez-vous avec les identifiants fournis par votre administrateur.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
