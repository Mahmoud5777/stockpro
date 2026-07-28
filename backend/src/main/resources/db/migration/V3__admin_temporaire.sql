-- =====================================================================
-- Migration : compte admin temporaire + changement obligatoire au login
-- Ordre d'exÃ©cution : crebas.sql -> sql-audit-security.sql -> CE FICHIER
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Nouvelle colonne : force l'utilisateur Ã  changer login/mot de passe
--    au prochain login s'il est Ã  TRUE.
ALTER TABLE UTILISATEUR
    ADD COLUMN IF NOT EXISTS DOIT_CHANGER_MDP BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Compte admin temporaire.
--    Login      : admin.temp
--    Mot de passe : ChangeMoi@2026
--    (hash BCrypt ci-dessous, gÃ©nÃ©rÃ© avec le mÃªme algorithme que Spring Security
--     -> le mot de passe en clair n'est JAMAIS stockÃ©, seul ce hash l'est)
--
--    DOIT_CHANGER_MDP = TRUE : Ã  la premiÃ¨re connexion, le frontend redirige
--    automatiquement l'utilisateur vers l'Ã©cran "changer mes identifiants"
--    avant de lui donner accÃ¨s au reste de l'application.
INSERT INTO UTILISATEUR (ID_UTIL, NOM_COMPLET, LOGIN, MOT_PASSE, EMAIL, ETAT_COMPTE, DATE_CREATION, DOIT_CHANGER_MDP)
VALUES (
    REPLACE(gen_random_uuid()::text, '-', ''),
    'Administrateur (temporaire)',
    'admin.temp',
    '$2b$10$sEOXkc/0ZILS15jUyvJvduMThqbuxJImCT.Ewkrn7hE51ux4.EJiO',
    'admin.temp@stockpro.local',
    TRUE,
    CURRENT_DATE,
    TRUE
)
ON CONFLICT (LOGIN) DO NOTHING;
