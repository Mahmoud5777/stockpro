/**
 * Fond animé des écrans d'authentification : ombré bleu en mouvement
 * (même palette brand-950/900/800 que l'ancien panneau gauche) + orbes
 * lumineux flottants en boucles lentes. Respecte prefers-reduced-motion.
 */
export function AnimatedAuthBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 bg-[length:200%_200%] animate-gradient-pan" />

      <div className="absolute -top-32 left-[8%] h-96 w-96 rounded-full bg-brand-400/25 blur-3xl animate-blob-a" />
      <div className="absolute top-[30%] -right-28 h-[28rem] w-[28rem] rounded-full bg-brand-300/15 blur-3xl animate-blob-b" />
      <div className="absolute -bottom-36 left-[28%] h-[30rem] w-[30rem] rounded-full bg-white/10 blur-3xl animate-blob-c" />
      <div className="absolute bottom-[12%] right-[14%] h-72 w-72 rounded-full bg-brand-500/20 blur-3xl animate-blob-a [animation-delay:-9s]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.07),transparent_55%)]" />
    </div>
  );
}