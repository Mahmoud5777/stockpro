/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 8                                  */
/* Date de création :  16/07/2026 19:44:26                      */
/*==============================================================*/


-- Suppression des tables associatives
DROP TABLE IF EXISTS USER_SITE_DROITS CASCADE;
DROP TABLE IF EXISTS USER_SITE CASCADE;
DROP TABLE IF EXISTS GROUPE_PROFIL CASCADE;
DROP TABLE IF EXISTS GROUPE_ROLE CASCADE;
DROP TABLE IF EXISTS PROFIL_DROIT CASCADE;

-- Suppression des tables principales
DROP TABLE IF EXISTS FONCTIONNALITE CASCADE;
DROP TABLE IF EXISTS APPLICATION CASCADE;
DROP TABLE IF EXISTS GROUPE CASCADE;
DROP TABLE IF EXISTS PROFIL CASCADE;
DROP TABLE IF EXISTS ROLE CASCADE;
DROP TABLE IF EXISTS SITE CASCADE;
DROP TABLE IF EXISTS UTILISATEUR CASCADE;

-- Suppression des domaines
DROP DOMAIN IF EXISTS CODE CASCADE;
DROP DOMAIN IF EXISTS DESCRIPTION CASCADE;
DROP DOMAIN IF EXISTS EMAIL CASCADE;
DROP DOMAIN IF EXISTS ICONE CASCADE;
DROP DOMAIN IF EXISTS ID CASCADE;
DROP DOMAIN IF EXISTS LIBELLE CASCADE;
DROP DOMAIN IF EXISTS LOGIN CASCADE;
DROP DOMAIN IF EXISTS MOTDEPASSE CASCADE;
DROP DOMAIN IF EXISTS NOM_COMPLET CASCADE;
DROP DOMAIN IF EXISTS ORDRE CASCADE;
DROP DOMAIN IF EXISTS URL CASCADE;
DROP DOMAIN IF EXISTS VERSION CASCADE;

/*==============================================================*/
/* Domaine : CODE                                               */
/*==============================================================*/
create domain CODE as VARCHAR(30);

/*==============================================================*/
/* Domaine : DESCRIPTION                                        */
/*==============================================================*/
create domain DESCRIPTION as TEXT;

/*==============================================================*/
/* Domaine : EMAIL                                              */
/*==============================================================*/
create domain EMAIL as VARCHAR(150);

/*==============================================================*/
/* Domaine : ICONE                                              */
/*==============================================================*/
create domain ICONE as VARCHAR(255);

/*==============================================================*/
/* Domaine : ID                                                 */
/*==============================================================*/
create domain ID as CHAR(32);

/*==============================================================*/
/* Domaine : LIBELLE                                            */
/*==============================================================*/
create domain LIBELLE as VARCHAR(100);

/*==============================================================*/
/* Domaine : LOGIN                                              */
/*==============================================================*/
create domain LOGIN as VARCHAR(100);

/*==============================================================*/
/* Domaine : MOTDEPASSE                                         */
/*==============================================================*/
create domain MOTDEPASSE as VARCHAR(255);

/*==============================================================*/
/* Domaine : NOM_COMPLET                                        */
/*==============================================================*/
create domain NOM_COMPLET as VARCHAR(150);

/*==============================================================*/
/* Domaine : ORDRE                                              */
/*==============================================================*/
create domain ORDRE as INT4;

/*==============================================================*/
/* Domaine : URL                                                */
/*==============================================================*/
create domain URL as VARCHAR(255);

/*==============================================================*/
/* Domaine : VERSION                                            */
/*==============================================================*/
create domain VERSION as VARCHAR(20);

/*==============================================================*/
/* Table : APPLICATION                                          */
/*==============================================================*/
create table APPLICATION (
   COD_APPLICATION      CODE                 null,
   LIB_APPLICATION      LIBELLE              null,
   DESCRIPTION          DESCRIPTION          null,
   VERSION              VERSION              null,
   ID_APPLICATION       ID                   not null,
   constraint PK_APPLICATION primary key (ID_APPLICATION)
);

/*==============================================================*/
/* Index : APPLICATION_PK                                       */
/*==============================================================*/
create unique index APPLICATION_PK on APPLICATION (
ID_APPLICATION
);

/*==============================================================*/
/* Table : FONCTIONNALITE                                       */
/*==============================================================*/
create table FONCTIONNALITE (
   COD_FONCTIONNALITE   CODE                 null,
   DESCRIPTION          DESCRIPTION          null,
   URL                  URL                  null,
   ICONE                ICONE                null,
   ORDER_AFFICHAGE      ORDRE                null,
   F_ACTIF              BOOL                 null,
   ID_FONCTIONNALITE    ID                   not null,
   ID_APPLICATION       ID                   not null,
   FON_ID_FONCTIONNALITE ID                   null,
   LIB_FONCTIONNALITE   VARCHAR(150)             null,
   constraint PK_FONCTIONNALITE primary key (ID_FONCTIONNALITE)
);

/*==============================================================*/
/* Index : FONCTIONNALITE_PK                                    */
/*==============================================================*/
create unique index FONCTIONNALITE_PK on FONCTIONNALITE (
ID_FONCTIONNALITE
);

/*==============================================================*/
/* Index : CONTIENT_FK                                          */
/*==============================================================*/
create  index CONTIENT_FK on FONCTIONNALITE (
ID_APPLICATION
);

/*==============================================================*/
/* Index : FONCTIONFILLE_FK                                     */
/*==============================================================*/
create  index FONCTIONFILLE_FK on FONCTIONNALITE (
FON_ID_FONCTIONNALITE
);

/*==============================================================*/
/* Table : GROUPE                                               */
/*==============================================================*/
create table GROUPE (
   COD_GROUPE           CODE                 null,
   DESCRIPTION          DESCRIPTION          null,
   ID_GR                ID                   not null,
   LIB_GROUPE           LIBELLE              null,
   constraint PK_GROUPE primary key (ID_GR)
);

/*==============================================================*/
/* Index : GROUPE_PK                                            */
/*==============================================================*/
create unique index GROUPE_PK on GROUPE (
ID_GR
);

/*==============================================================*/
/* Table : GROUPE_PROFIL                                        */
/*==============================================================*/
create table GROUPE_PROFIL (
   ID_GROUPE_PROFIL     ID                   not null,
   ID_GR                ID                   not null,
   ID_PR                ID                   not null,
   F_ACTIF              BOOL                 null,
   DAT_CREATION         DATE                 null,
   constraint PK_GROUPE_PROFIL primary key (ID_GROUPE_PROFIL)
);

/*==============================================================*/
/* Index : GROUPE_PROFIL_PK                                     */
/*==============================================================*/
create unique index GROUPE_PROFIL_PK on GROUPE_PROFIL (
ID_GROUPE_PROFIL
);

/*==============================================================*/
/* Index : CONTIENTPROFIL_FK                                    */
/*==============================================================*/
create  index CONTIENTPROFIL_FK on GROUPE_PROFIL (
ID_GR
);

/*==============================================================*/
/* Index : ESTASSOCIEA_FK                                       */
/*==============================================================*/
create  index ESTASSOCIEA_FK on GROUPE_PROFIL (
ID_PR
);

/*==============================================================*/
/* Table : GROUPE_ROLE                                          */
/*==============================================================*/
create table GROUPE_ROLE (
   ID_GROUPE_ROLE       ID                   not null,
   ID_RL                ID                   not null,
   ID_GR                ID                   not null,
   F_ACTIF              BOOL                 null,
   DAT_CREATION         DATE                 null,
   constraint PK_GROUPE_ROLE primary key (ID_GROUPE_ROLE)
);

/*==============================================================*/
/* Index : GROUPE_ROLE_PK                                       */
/*==============================================================*/
create unique index GROUPE_ROLE_PK on GROUPE_ROLE (
ID_GROUPE_ROLE
);

/*==============================================================*/
/* Index : POSSEDEROLE_FK                                       */
/*==============================================================*/
create  index POSSEDEROLE_FK on GROUPE_ROLE (
ID_GR
);

/*==============================================================*/
/* Index : APPARTIENTGROUPE_FK                                  */
/*==============================================================*/
create  index APPARTIENTGROUPE_FK on GROUPE_ROLE (
ID_RL
);

/*==============================================================*/
/* Table : PROFIL                                               */
/*==============================================================*/
create table PROFIL (
   ID_PR                ID                   not null,
   COD_PROFIL           CODE                 not null,
   DESCRIPTION          DESCRIPTION          null,
   LIB_PROFIL           LIBELLE              null,
   constraint PK_PROFIL primary key (ID_PR),
   constraint AK_COD_PROFILE_PROFIL unique (COD_PROFIL)
);

/*==============================================================*/
/* Index : PROFIL_PK                                            */
/*==============================================================*/
create unique index PROFIL_PK on PROFIL (
ID_PR
);

/*==============================================================*/
/* Table : PROFIL_DROIT                                         */
/*==============================================================*/
create table PROFIL_DROIT (
   ID_PROFIL_DROIT      ID                   not null,
   ID_PR                ID                   not null,
   ID_FONCTIONNALITE    ID                   not null,
   F_CONSULTATION       BOOL                 null,
   F_AJOUT              BOOL                 null,
   F_SUPPRESSION        BOOL                 null,
   F_IMPRESSION         BOOL                 null,
   F_EXPORT             BOOL                 null,
   F_MODIFICATION       BOOL                 null,
   constraint PK_PROFIL_DROIT primary key (ID_PROFIL_DROIT)
);

/*==============================================================*/
/* Index : DROITPROFIL_PK                                       */
/*==============================================================*/
create unique index DROITPROFIL_PK on PROFIL_DROIT (
ID_PROFIL_DROIT
);

/*==============================================================*/
/* Index : POSSEDEDROIT_FK                                      */
/*==============================================================*/
create  index POSSEDEDROIT_FK on PROFIL_DROIT (
ID_PR
);

/*==============================================================*/
/* Index : CONCERNE_FK                                          */
/*==============================================================*/
create  index CONCERNE_FK on PROFIL_DROIT (
ID_FONCTIONNALITE
);

/*==============================================================*/
/* Table : ROLE                                                 */
/*==============================================================*/
create table ROLE (
   COD_ROLE             CODE                 null,
   DESCRIPTION          DESCRIPTION          null,
   ID_RL                ID                   not null,
   LIB_ROLE             LIBELLE              null,
   constraint PK_ROLE primary key (ID_RL),
   constraint AK_COD_ROLE_ROLE unique (COD_ROLE)
);

/*==============================================================*/
/* Index : ROLE_PK                                              */
/*==============================================================*/
create unique index ROLE_PK on ROLE (
ID_RL
);

/*==============================================================*/
/* Table : SITE                                                 */
/*==============================================================*/
create table SITE (
   COD_SITE             CODE                 null,
   LIB_SITE             LIBELLE              null,
   DESCRIPTION          DESCRIPTION          null,
   ADDRESS              DESCRIPTION          null,
   ID_SITE              ID                   not null,
   SIT_ID_SITE          ID                   null,
   constraint PK_SITE primary key (ID_SITE),
   constraint AK_COD_SITE_SITE unique (COD_SITE)
);

/*==============================================================*/
/* Index : SITE_PK                                              */
/*==============================================================*/
create unique index SITE_PK on SITE (
ID_SITE
);

/*==============================================================*/
/* Index : HEARCHIE_FK                                          */
/*==============================================================*/
create  index HEARCHIE_FK on SITE (
SIT_ID_SITE
);

/*==============================================================*/
/* Table : USER_SITE                                            */
/*==============================================================*/
create table USER_SITE (
   ID_UTIL_SITE         ID                   not null,
   ID_SITE              ID                   not null,
   ID_UTIL              ID                   not null,
   DAT_AFFECTATION      DATE                 null,
   constraint PK_USER_SITE primary key (ID_UTIL_SITE)
);

/*==============================================================*/
/* Index : UTILISATEURSITE_PK                                   */
/*==============================================================*/
create unique index UTILISATEURSITE_PK on USER_SITE (
ID_UTIL_SITE
);

/*==============================================================*/
/* Index : POSSEDE_FK                                           */
/*==============================================================*/
create  index POSSEDE_FK on USER_SITE (
ID_UTIL
);

/*==============================================================*/
/* Index : ESTRATTACHEA_FK                                      */
/*==============================================================*/
create  index ESTRATTACHEA_FK on USER_SITE (
ID_SITE
);

/*==============================================================*/
/* Table : USER_SITE_DROITS                                     */
/*==============================================================*/
create table USER_SITE_DROITS (
   ID_USER_SITE_DROIT   ID                   not null,
   ID_RL                ID                   null,
   ID_UTIL_SITE         ID                   not null,
   ID_PR                ID                   null,
   ID_GR                ID                   null,
   DAT_AFFECTATION      DATE                 null,
   constraint PK_USER_SITE_DROITS primary key (ID_USER_SITE_DROIT)
);

/*==============================================================*/
/* Index : USER_SITE_DROITS_PK                                  */
/*==============================================================*/
create unique index USER_SITE_DROITS_PK on USER_SITE_DROITS (
ID_USER_SITE_DROIT
);

/*==============================================================*/
/* Index : AFFECTEPROFIL_FK                                     */
/*==============================================================*/
create  index AFFECTEPROFIL_FK on USER_SITE_DROITS (
ID_PR
);

/*==============================================================*/
/* Index : DISPOSEDE_FK                                         */
/*==============================================================*/
create  index DISPOSEDE_FK on USER_SITE_DROITS (
ID_UTIL_SITE
);

/*==============================================================*/
/* Index : AFFECTEGROUPE_FK                                     */
/*==============================================================*/
create  index AFFECTEGROUPE_FK on USER_SITE_DROITS (
ID_GR
);

/*==============================================================*/
/* Index : AFFECTEROLE_FK                                       */
/*==============================================================*/
create  index AFFECTEROLE_FK on USER_SITE_DROITS (
ID_RL
);

/*==============================================================*/
/* Table : UTILISATEUR                                          */
/*==============================================================*/
create table UTILISATEUR (
   NOM_COMPLET          NOM_COMPLET          null,
   LOGIN                LOGIN                null,
   MOT_PASSE            MOTDEPASSE           null,
   EMAIL                EMAIL                null,
   TELEPHONE            VARCHAR(20)          null,
   ETAT_COMPTE          BOOL                 null,
   DATE_CREATION        DATE                 null,
   ID_UTIL              ID                   not null,
   constraint PK_UTILISATEUR primary key (ID_UTIL),
   constraint AK_LOGIN_UTILISAT unique (LOGIN),
   constraint AK_EMAIL_UTILISAT unique (EMAIL)
);

/*==============================================================*/
/* Index : UTILISATEUR_PK                                       */
/*==============================================================*/
create unique index UTILISATEUR_PK on UTILISATEUR (
ID_UTIL
);

alter table FONCTIONNALITE
   add constraint FK_FONCTION_CONTIENT_APPLICAT foreign key (ID_APPLICATION)
      references APPLICATION (ID_APPLICATION)
      on delete restrict on update restrict;

alter table FONCTIONNALITE
   add constraint FK_FONCTION_FONCTIONF_FONCTION foreign key (FON_ID_FONCTIONNALITE)
      references FONCTIONNALITE (ID_FONCTIONNALITE)
      on delete restrict on update restrict;

alter table GROUPE_PROFIL
   add constraint FK_GROUPE_P_CONTIENTP_GROUPE foreign key (ID_GR)
      references GROUPE (ID_GR)
      on delete restrict on update restrict;

alter table GROUPE_PROFIL
   add constraint FK_GROUPE_P_ESTASSOCI_PROFIL foreign key (ID_PR)
      references PROFIL (ID_PR)
      on delete restrict on update restrict;

alter table GROUPE_ROLE
   add constraint FK_GROUPE_R_APPARTIEN_ROLE foreign key (ID_RL)
      references ROLE (ID_RL)
      on delete restrict on update restrict;

alter table GROUPE_ROLE
   add constraint FK_GROUPE_R_POSSEDERO_GROUPE foreign key (ID_GR)
      references GROUPE (ID_GR)
      on delete restrict on update restrict;

alter table PROFIL_DROIT
   add constraint FK_PROFIL_D_CONCERNE_FONCTION foreign key (ID_FONCTIONNALITE)
      references FONCTIONNALITE (ID_FONCTIONNALITE)
      on delete restrict on update restrict;

alter table PROFIL_DROIT
   add constraint FK_PROFIL_D_POSSEDEDR_PROFIL foreign key (ID_PR)
      references PROFIL (ID_PR)
      on delete restrict on update restrict;

alter table SITE
   add constraint FK_SITE_HEARCHIE_SITE foreign key (SIT_ID_SITE)
      references SITE (ID_SITE)
      on delete restrict on update restrict;

alter table USER_SITE
   add constraint FK_USER_SIT_ESTRATTAC_SITE foreign key (ID_SITE)
      references SITE (ID_SITE)
      on delete restrict on update restrict;

alter table USER_SITE
   add constraint FK_USER_SIT_POSSEDE_UTILISAT foreign key (ID_UTIL)
      references UTILISATEUR (ID_UTIL)
      on delete restrict on update restrict;

alter table USER_SITE_DROITS
   add constraint FK_USER_SIT_AFFECTEGR_GROUPE foreign key (ID_GR)
      references GROUPE (ID_GR)
      on delete restrict on update restrict;

alter table USER_SITE_DROITS
   add constraint FK_USER_SIT_AFFECTEPR_PROFIL foreign key (ID_PR)
      references PROFIL (ID_PR)
      on delete restrict on update restrict;

alter table USER_SITE_DROITS
   add constraint FK_USER_SIT_AFFECTERO_ROLE foreign key (ID_RL)
      references ROLE (ID_RL)
      on delete restrict on update restrict;

alter table USER_SITE_DROITS
   add constraint FK_USER_SIT_DISPOSEDE_USER_SIT foreign key (ID_UTIL_SITE)
      references USER_SITE (ID_UTIL_SITE)
      on delete restrict on update restrict;

