/*==============================================================*/
/* Script complÃ©mentaire â SÃ©curitÃ© & Audit                     */
/* Ã exÃ©cuter APRÃS crebas.sql (dÃ©pend de la table UTILISATEUR) */
/*==============================================================*/

DROP TABLE IF EXISTS LOG_ACCES CASCADE;
DROP TABLE IF EXISTS REFRESH_TOKEN CASCADE;

/*==============================================================*/
/* Table : REFRESH_TOKEN                                        */
/* Un refresh token opaque (UUID), stockÃ© cÃ´tÃ© serveur pour      */
/* pouvoir Ãªtre rÃ©voquÃ© (contrairement Ã  un JWT classique).     */
/*==============================================================*/
CREATE TABLE REFRESH_TOKEN (
   ID_REFRESH_TOKEN     ID              not null,
   TOKEN                VARCHAR(255)    not null,
   ID_UTIL              ID              not null,
   DATE_EXPIRATION      TIMESTAMP       not null,
   REVOKED              BOOL            not null default false,
   DATE_CREATION        TIMESTAMP       not null default now(),
   constraint PK_REFRESH_TOKEN primary key (ID_REFRESH_TOKEN),
   constraint AK_TOKEN_REFRESH_TOKEN unique (TOKEN),
   constraint FK_REFRESH_TOKEN_UTIL foreign key (ID_UTIL)
      references UTILISATEUR (ID_UTIL)
      on delete cascade on update restrict
);

create index IDX_REFRESH_TOKEN_UTIL on REFRESH_TOKEN (ID_UTIL);

/*==============================================================*/
/* Table : LOG_ACCES                                            */
/* Audit des accÃ¨s : connexions (succÃ¨s/Ã©chec), dÃ©connexions,   */
/* rafraÃ®chissements de token, et appels API authentifiÃ©s.      */
/* Pas de FK stricte vers UTILISATEUR : une tentative de login  */
/* avec un login inconnu doit quand mÃªme Ãªtre tracÃ©e.           */
/*==============================================================*/
CREATE TABLE LOG_ACCES (
   ID_LOG               ID              not null,
   LOGIN                VARCHAR(100)    null,
   ID_UTIL              ID              null,
   ACTION               VARCHAR(30)     not null,
   METHODE_HTTP         VARCHAR(10)     null,
   ENDPOINT             VARCHAR(255)    null,
   STATUT_HTTP          INT4            null,
   ADRESSE_IP           VARCHAR(45)     null,
   USER_AGENT           VARCHAR(255)    null,
   DETAILS              TEXT            null,
   DATE_ACCES           TIMESTAMP       not null default now(),
   constraint PK_LOG_ACCES primary key (ID_LOG)
);

create index IDX_LOG_ACCES_LOGIN on LOG_ACCES (LOGIN);
create index IDX_LOG_ACCES_DATE on LOG_ACCES (DATE_ACCES);
create index IDX_LOG_ACCES_ACTION on LOG_ACCES (ACTION);
