export function Footer() {
  return (
    <footer className="border-t border-slate-100 px-6 py-4 text-center text-xs text-slate-400 dark:border-slate-800">
      © {new Date().getFullYear()} StockERP — Tous droits réservés.
    </footer>
  );
}
