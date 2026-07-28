-- =====================================================================
-- Seed : Application + FonctionnalitÃ©s + Profil "Super Administrateur"
--        + Site + affectation Ã  votre compte admin
-- Ordre d'exÃ©cution : crebas.sql -> sql-audit-security.sql
--                     -> sql-admin-temporaire.sql -> CE FICHIER
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Application (obligatoire : une FONCTIONNALITE rÃ©fÃ©rence toujours une APPLICATION)
--    Pas de contrainte unique sur COD_APPLICATION dans crebas.sql -> on garde idempotent via NOT EXISTS.
INSERT INTO APPLICATION (ID_APPLICATION, COD_APPLICATION, LIB_APPLICATION, VERSION)
SELECT REPLACE(gen_random_uuid()::text, '-', ''), 'STOCKPRO', 'StockPro', '1.0'
WHERE NOT EXISTS (SELECT 1 FROM APPLICATION WHERE COD_APPLICATION = 'STOCKPRO');

-- 2. FonctionnalitÃ©s correspondant aux Ã©crans dÃ©jÃ  codÃ©s dans le frontend
--    (voir erp-frontend/src/features/navigation/menu.config.ts, propriÃ©tÃ© "code")
--    Pas de contrainte unique sur COD_FONCTIONNALITE non plus -> idempotent via NOT EXISTS.
INSERT INTO FONCTIONNALITE (ID_FONCTIONNALITE, ID_APPLICATION, COD_FONCTIONNALITE, LIB_FONCTIONNALITE, ORDER_AFFICHAGE, F_ACTIF)
SELECT REPLACE(gen_random_uuid()::text, '-', ''), a.ID_APPLICATION, v.code, v.libelle, v.ordre, TRUE
FROM APPLICATION a,
     (VALUES
        ('ADMIN_UTILISATEURS',   'Users',      1),
        ('ADMIN_SITES',          'Sites',      2),
        ('ADMIN_PROFILS',        'Profils',    3),
        ('ADMIN_ROLES',          'Roles',      4),
        ('ADMIN_GROUPES',        'Groupes',    5),
        ('ADMIN_FONCTIONNALITES','Fonctions',  6),
        ('ADMIN_AUDIT',          'Audit',      7)
     ) AS v(code, libelle, ordre)
WHERE a.COD_APPLICATION = 'STOCKPRO'
  AND NOT EXISTS (SELECT 1 FROM FONCTIONNALITE f WHERE f.COD_FONCTIONNALITE = v.code);

-- 3. Profil "Super Administrateur" : tous les droits sur toutes les fonctionnalitÃ©s ci-dessus
INSERT INTO PROFIL (ID_PR, COD_PROFIL, LIB_PROFIL, DESCRIPTION)
VALUES (REPLACE(gen_random_uuid()::text, '-', ''), 'SUPERADMIN', 'Super Administrateur',
        'AccÃ¨s complet Ã  toutes les fonctionnalitÃ©s (crÃ©Ã© automatiquement pour le premier compte admin)')
ON CONFLICT DO NOTHING;

INSERT INTO PROFIL_DROIT (ID_PROFIL_DROIT, ID_PR, ID_FONCTIONNALITE,
                          F_CONSULTATION, F_AJOUT, F_MODIFICATION, F_SUPPRESSION, F_IMPRESSION, F_EXPORT)
SELECT REPLACE(gen_random_uuid()::text, '-', ''), p.ID_PR, f.ID_FONCTIONNALITE,
       TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM PROFIL p
JOIN FONCTIONNALITE f ON TRUE
WHERE p.COD_PROFIL = 'SUPERADMIN'
  AND NOT EXISTS (
      SELECT 1 FROM PROFIL_DROIT pd WHERE pd.ID_PR = p.ID_PR AND pd.ID_FONCTIONNALITE = f.ID_FONCTIONNALITE
  );

-- 4. Site par dÃ©faut ("SiÃ¨ge")
INSERT INTO SITE (ID_SITE, COD_SITE, LIB_SITE)
VALUES (REPLACE(gen_random_uuid()::text, '-', ''), 'SIEGE', 'SiÃ¨ge')
ON CONFLICT DO NOTHING;

-- 5. Affectation : votre compte admin <-> Site "SiÃ¨ge" <-> Profil "Super Administrateur"
--    (identifiÃ© par login, pas par ID fixe, car ce login peut avoir Ã©tÃ© renommÃ©
--    depuis l'Ã©cran "changement obligatoire" â adaptez le login ci-dessous si besoin)
INSERT INTO USER_SITE (ID_UTIL_SITE, ID_SITE, ID_UTIL)
SELECT REPLACE(gen_random_uuid()::text, '-', ''), s.ID_SITE, u.ID_UTIL
FROM SITE s, UTILISATEUR u
WHERE s.COD_SITE = 'SIEGE'
  AND u.LOGIN IN ('admin.temp', 'admin')  -- adaptez si vous avez choisi un autre login
  AND NOT EXISTS (
      SELECT 1 FROM USER_SITE us WHERE us.ID_UTIL = u.ID_UTIL AND us.ID_SITE = s.ID_SITE
  );

INSERT INTO USER_SITE_DROITS (ID_USER_SITE_DROIT, ID_UTIL_SITE, ID_PR)
SELECT REPLACE(gen_random_uuid()::text, '-', ''), us.ID_UTIL_SITE, p.ID_PR
FROM USER_SITE us
JOIN UTILISATEUR u ON u.ID_UTIL = us.ID_UTIL
JOIN SITE s ON s.ID_SITE = us.ID_SITE AND s.COD_SITE = 'SIEGE'
JOIN PROFIL p ON p.COD_PROFIL = 'SUPERADMIN'
WHERE u.LOGIN IN ('admin.temp', 'admin')
  AND NOT EXISTS (
      SELECT 1 FROM USER_SITE_DROITS d WHERE d.ID_UTIL_SITE = us.ID_UTIL_SITE AND d.ID_PR = p.ID_PR
  );
