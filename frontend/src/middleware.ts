import { NextResponse, type NextRequest } from "next/server";

/**
 * Le JWT est stocké côté client (sessionStorage) et non dans un cookie,
 * il n'est donc pas accessible depuis le middleware Edge de Next.js.
 * La protection des routes est assurée côté client par <ProtectedRoute />
 * (voir src/features/auth/components/ProtectedRoute.tsx), qui redirige
 * vers /login si l'utilisateur n'est pas authentifié après vérification
 * de session via GET /auth/me.
 *
 * Ce middleware reste un point d'extension pour, par exemple, ajouter des
 * en-têtes de sécurité globaux ou gérer un cookie httpOnly si le backend
 * Spring Security est configuré pour en émettre un en complément du JWT.
 */
export function middleware(request: NextRequest) {
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
