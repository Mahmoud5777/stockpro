/**
 * Wrapper de stockage sécurisé pour les tokens.
 * Utilise sessionStorage par défaut (effacé à la fermeture de l'onglet),
 * ce qui limite l'exposition du token en cas de XSS persistant,
 * combiné à un cookie httpOnly pouvant être mis en place côté backend si besoin.
 */
const ACCESS_TOKEN_KEY = "erp_access_token";
const REFRESH_TOKEN_KEY = "erp_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
