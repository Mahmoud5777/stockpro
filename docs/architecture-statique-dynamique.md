# Architecture backend StockERP — éléments statiques vs dynamiques

## Définition

- **Statique** : défini une fois (code, DDL, config au démarrage), identique pour tous les utilisateurs/requêtes, ne change jamais au runtime.
- **Dynamique** : créé/modifié au runtime — chaque requête HTTP, chaque ligne de BD, chaque token, chaque droit calculé.

## Tableau 1 — Vue par couche

| Couche / élément | Type | Partie **statique** | Partie **dynamique** |
|---|---|---|---|
| **Migrations Flyway** `V1→V4` | Mixte | DDL figé (tables, 11 domaines, FKs, index) appliqué dans l'ordre, checksums | Seed initial (`admin.temp`, 7 fonctionnalités, profil `SUPERADMIN`, site `SIEGE`, affectations) et version du schéma (`flyway_schema_history`) |
| **Entités JPA** (15) | Statique | Structure `@Entity`/`@Table`/`@Column` — la forme figée d'une ligne | Valeurs des champs par ligne (login, hash bCrypt, dates, booléens) |
| **DTOs** | Statique | Définition des classes + validation `@Valid` (`@NotBlank`, `@Size`, `@Email`) | Contenu d'une requête/réponse à chaque appel |
| **Mappers** (13) | Statique | Règles `Entity↔DTO` écrites en dur (ex : `motPasse` volontairement absent côté sortie) | Objets convertis à chaque appel |
| **Repositories** (15) | Mixte | Contrats d'interface + méthodes dérivées (`findByLogin`, `findByProfil_IdPr`…) | Les lignes SQL renvoyées, et les `Specification` construites par requête |
| **Services** (16) | Statique | Orchestration, transactions, règles métier codées | Entrées de méthode + résultat (données BD) |
| **Controllers** (16) | Statique | Routes REST, doc `@Operation`, mapping statut HTTP | Requête entrante / corps de réponse |
| **FilterDefinitions** | Statique | Registre codé en dur : champs recherche + filtres autorisés par entité | paramètres `?search=`/`filters` soumis par le client |
| **EntitySpecifications** | Statique | Algorithme JPA Criteria (OR LIKE, égalités, JOIN LEFT, DISTINCT, conversion des types) | Les prédicats générés à partir de chaque requête |
| **application.properties** | Statique | Valeurs lues au démarrage (`${ENV:defaut}`) — URL DB, secret JWT, CORS | — (figées jusqu'au redémarrage) |
| **SecurityConfig** | Statique | FilterChain, liste `PUBLIC_ENDPOINTS` **codée en dur**, CORS, BCrypt | Filtrage de chaque requête en entrée |
| **JwtService** | Mixte | Algorithme HS256, secret + durée (config statique au boot) | Chaque token : `subject`=login, `iat`, `exp` — régénéré au login/refresh/change-password |
| **RefreshToken** | Mixte | Règle métier : durée de vie, rotation (ancien révoqué), révocation | Une ligne opaque par session : token, dates, `revoked` |
| **AuthorizationService** | Mixte | Algorithme RBAC figé (User→user_site→user_site_droits→profil/groupe→profil_droit→fonctionnalité, fusion **OR**) | Droits recalculés **à chaque appel** à partir de la BD, différents par utilisateur |
| **AccessGuard** | Mixte | Annotations `@PreAuthorize("@accessGuard.can(…)")` + mapping 6 actions | Résultat booléen par utilisateur + endpoint + action |
| **Audit** (`LOG_ACCES`, `AuditAction`, 2 filtres) | Mixte | Enum `AuditAction` (5 valeurs figées), modèle de 11 colonnes, `REQUIRES_NEW` | Une ligne par événement : IP, User-Agent, endpoint, statut, horodatage |
| **GlobalExceptionHandler** | Statique | Mapping exception → statut HTTP / message | L'exception levée + son message |

Actions d'audit (`AuditAction`) : `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `REFRESH_TOKEN`, `ACCES_API`.

## Tableau 2 — Part statique/dynamique **dans** chaque objet clé

| Objet | Partie **statique** | Partie **dynamique** |
|---|---|---|
| **JWT** | Structure header.payload.signature, algorithme, secret, durée max | Le sujet (login courant), `iat`/`exp`, la chaîne du token ; sa validité même dépend du compte (login renommé → token mort) |
| **Utilisateur** (compte) | Les 8 attributs du modèle (nom, login, email, tel, etat, date, mdp, doitChangerMdp) | Les valeurs à l'instant T : hash, passage `doitChangerMdp true→false`, et surtout son **univers de droits** qui évolue via ses lignes `user_site`/`user_site_droits` |
| **Fonctionnalité** | Référentiel : code, libellé, URL, icône, ordre, actif | Ses **liens** : les droits que chaque profil lui accorde (`profil_droit`), son parent (`fon_id`), modifiables à l'exploitation |
| **Profil + ProfilDroit** | Structure du profil, libellé, code unique | Les 6 booléens de droits par couple (profil, fonctionnalité), les affectations aux users/groupes |
| **Site** | Référentiel : code, libellé, description, hiérarchie père/fils | Les utilisateurs rattachés (`user_site`), et donc **l'univers de droits de chaque site** |
| **user_site / user_site_droits** | Le modèle relationnel (1 user ↔ N sites ↔ profil/groupe/rôle + date) | **Toutes les données** : c'est le point le plus dynamique du système — chaque affectation/modification y change les permissions |
| **RefreshToken** | Règle : TTL, rotation, révocation | Chaque token opaque généré, son état `revoked`/expiré |
| **Requête HTTP entrante** | Contrat de l'endpoint (méthode, chemin, validation `@Valid`, params recherche) | Payload, header `Authorization` (JWT), User-Agent, IP, horodatage |
| **`/auth/me`** | Orchestration figée : user + sites + fonctionnalités avec droits résolus | La réponse **varie par utilisateur et par appel** — c'est la photographie dynamique du RBAC |
| **Moteur de recherche** (`Specifications`) | Algorithme + registre `FilterDefinitions` | Les prédicats générés : `LIKE %…%`, égalités, JOIN dynamiques, valeurs converties |
| **`LOG_ACCES`** (audit) | Modèle 11 colonnes + 5 actions | Volume de lignes qui grossit à chaque accès (qui, quand, où, statut) |
| **Migrations Flyway** | Ordre, checksums, DDL appliqué une fois au démarrage | La version courante du schéma et les données seed (modifiables ensuite par l'API) |
| **Config globale** | Valeurs boot (DB, JWT, CORS) avec `var d'env` par défaut | Redéfinie à chaque démarrage selon l'environnement (dev/staging/prod) |
| **Chaîne de filtres sécurité** | Pipeline figé : JwtAuthenticationFilter → AuditLoggingFilter → controllers | Authentification + décision d'autorisation + écriture d'audit **pour chaque requête** |

## Synthèse

Le backend est une **structure entièrement statique** (schéma Flyway, entités, contrats HTTP, règles RBAC, moteur de recherche) qui ne fait que lire/écrire un **état dynamique** : les lignes BD (surtout `user_site`/`user_site_droits`, le cœur exploitable du RBAC), les tokens JWT/refresh par session, les lignes d'audit, et les prédicats de recherche générés à la volée — le seul point où "le code bouge" à l'exécution étant `EntitySpecifications`/`AuthorizationService`, qui sont eux-mêmes statiques dans leur algorithme.

## Index des fichiers référencés

- Backend (racine : `backend/src/main/java/com/stockpro/`)
  - `config/FilterDefinitions.java`, `config/OpenApiConfig.java`
  - `util/EntitySpecifications.java`
  - `security/SecurityConfig.java`, `security/JwtService.java`, `security/JwtAuthenticationFilter.java`, `security/AuditLoggingFilter.java`, `security/AccessGuard.java`
  - `service/auth/AuthorizationService.java`, `service/audit/impl/AuditServiceImpl.java`
  - `entity/audit/AuditAction.java`, `entity/audit/LogAcces.java`
  - `exception/GlobalExceptionHandler.java`
  - 15 entités `entity/administration/`, 15 repositories `repository/`, 13 mappers `mapper/`, 16 services `service/`, 16 contrôleurs `controller/`, DTOs `dto/`
  - Migrations : `backend/src/main/resources/db/migration/V1__schema_initial.sql`, `V2__securite_audit.sql`, `V3__admin_temporaire.sql`, `V4__seed_permissions_admin.sql`
  - Config : `backend/src/main/resources/application.properties`