// Journal d'audit des accès (connexions, refus/erreurs d'accès, refresh de token,
// et TOUS les appels API authentifiés — voir AuditLoggingFilter côté backend).
// Champs alignés 1:1 sur LogAccesDTO.java / l'entité LOG_ACCES — ne pas renommer
// sans renommer aussi côté backend, sinon la page reste vide.

export type AuditActionType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "LOGOUT"
  | "REFRESH_TOKEN"
  | "ACCES_API";

export interface AuditLog {
  idLog: string;
  login: string;
  idUtil?: string;
  action: AuditActionType;
  methodeHttp?: string;
  endpoint?: string;
  statutHttp?: number;
  adresseIp?: string;
  userAgent?: string;
  details?: string;
  dateAcces: string;
}
