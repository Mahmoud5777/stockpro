import { apiClient } from "@/lib/axios";
import { tokenStorage } from "@/utils/storage";
import type {
  ChangeCredentialsPayload,
  LoginPayload,
  LoginResponse,
} from "../types/auth.types";

// Forme brute renvoyée par le backend Spring Boot (AuthResponseDTO).
// Diffère volontairement de LoginResponse (shape "riche" utilisée côté front) :
// on adapte ici, une seule fois, plutôt que de propager le format backend partout.
interface RawAuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  login: string;
  idUtil: string;
  expiresInMs: number;
  doitChangerMdp: boolean;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<RawAuthResponse>("/auth/login", {
      login: payload.login,
      password: payload.motPasse,
    });

    return {
      accessToken: data.token,
      refreshToken: data.refreshToken,
      doitChangerMdp: data.doitChangerMdp,
      user: {
        idUtil: data.idUtil,
        nomComplet: data.login,
        login: data.login,
        email: "",
        sites: [],
        fonctionnalites: [],
        doitChangerMdp: data.doitChangerMdp,
      },
    };
  },

  /**
   * Le refreshToken est transmis explicitement afin que le backend
   * (Spring Security) puisse le révoquer côté serveur (blacklist / suppression en base).
   */
  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    await apiClient.post("/auth/logout", { refreshToken });
  },

  async me(): Promise<LoginResponse["user"]> {
    const { data } = await apiClient.get<{
      idUtil: string;
      nomComplet: string;
      login: string;
      email: string;
      doitChangerMdp: boolean;
      sites: { idSite: string; libSite: string }[];
      fonctionnalites: LoginResponse["user"]["fonctionnalites"];
    }>("/auth/me");

    return {
      idUtil: data.idUtil,
      nomComplet: data.nomComplet,
      login: data.login,
      email: data.email,
      sites: data.sites,
      fonctionnalites: data.fonctionnalites,
      doitChangerMdp: data.doitChangerMdp,
    };
  },

  /**
   * Change le login/mot de passe de l'utilisateur connecté.
   * Utilisé pour l'écran obligatoire de changement d'identifiants
   * (comptes temporaires : DOIT_CHANGER_MDP = true côté backend).
   *
   * IMPORTANT : si le login change, l'ancien access token devient invalide
   * (son "subject" JWT ne correspond plus à aucun utilisateur). Le backend
   * renvoie donc un NOUVEAU couple access/refresh token, qu'il faut stocker
   * immédiatement avant tout autre appel — sinon la requête suivante (y compris
   * un éventuel /auth/me) échoue avec "Utilisateur introuvable".
   */
  async changeCredentials(payload: ChangeCredentialsPayload): Promise<void> {
    const { data } = await apiClient.post<RawAuthResponse>("/auth/change-password", payload);
    tokenStorage.setTokens(data.token, data.refreshToken);
  },
};
