# Analyse de l'application StockPro

Analyse statique du workspace `stockpro` réalisée à partir des points d'entrée backend/frontend, des fichiers de configuration et des couches d'authentification visibles. Ce document ne remplace pas une exécution complète de l'application, mais il met en évidence les risques et bugs probables les plus utiles à corriger ou à tester.

## 1. Vue d'ensemble

L'application est découpée en deux parties.

- Backend Spring Boot 3.5.4 en Java 17, avec Spring Web, Spring Data JPA, Spring Security, Flyway, PostgreSQL, JWT et Springdoc OpenAPI.
- Frontend Next.js 15 / React 19 / TypeScript, organisé en App Router avec des modules métiers dans `src/features`, un layout de dashboard, une pile Axios + React Query + Zustand, et une logique d'authentification côté client.

Le backend expose une API REST pour l'ERP, tandis que le frontend consomme cette API et orchestre l'expérience utilisateur, la navigation, les permissions et la session.

## 2. Architecture observée

### Backend

- Entrée Spring Boot unique dans `backend/src/main/java/com/stockpro/StockproApplication.java`.
- Dépendances principales dans `backend/pom.xml` : web, security, validation, JPA, PostgreSQL, Flyway, JWT et OpenAPI.
- Configuration centralisée dans `backend/src/main/resources/application.properties`.
- Le schéma est piloté par Flyway, avec Hibernate configuré en `ddl-auto=none`.

### Frontend

- Racine App Router dans `frontend/src/app/layout.tsx`.
- La page d'accueil redirige vers `/dashboard` via `frontend/src/app/page.tsx`.
- Le groupe de routes protégé est encapsulé dans `frontend/src/app/(dashboard)/layout.tsx`.
- Le middleware Next.js est présent mais ne bloque rien réellement dans `frontend/src/middleware.ts`.
- La protection d'accès repose surtout sur `frontend/src/features/auth/components/ProtectedRoute.tsx`.

## 3. Bugs et risques les plus probables

### 3.1 Protection des routes trop dépendante du client

Le middleware Next est volontairement neutre et ne protège aucune route. La variable `matcher` est vide, donc aucune interception serveur n'est appliquée. La vraie barrière est `ProtectedRoute`, qui redirige après hydratation seulement.

Impact probable : un utilisateur non authentifié peut recevoir une partie du shell serveur avant redirection, ce qui n'est pas une protection robuste. Ce point est surtout sensible si des données sensibles se retrouvent dans le rendu initial ou si la logique d'accès est supposée être garantie côté serveur.

Fichiers concernés : `frontend/src/middleware.ts`, `frontend/src/features/auth/components/ProtectedRoute.tsx`, `frontend/src/app/(dashboard)/layout.tsx`.

### 3.2 Configuration d'authentification potentiellement fragile en environnement réel

Le backend garde des valeurs par défaut pour la base de données et le secret JWT dans `application.properties`.

Impact probable : si les variables d'environnement ne sont pas injectées correctement, l'application démarre avec des secrets ou identifiants de secours. Cela augmente le risque de mauvaise configuration, de fuite de secret ou d'accès non voulu en environnement non local.

Fichier concerné : `backend/src/main/resources/application.properties`.

### 3.3 Dépendance ESLint très suspecte

Le frontend déclare `eslint-config-next` en version `^0.2.4`, ce qui ne correspond pas au rythme normal du reste de la stack Next 15. En parallèle, la configuration Next ignore les erreurs ESLint pendant les builds.

Impact probable : une partie des erreurs de qualité ou de compatibilité peut passer inaperçue, et la configuration dépendance/lint peut être incohérente avec la version réelle de Next.

Fichiers concernés : `frontend/package.json`, `frontend/next.config.ts`.

### 3.4 Documentation de démarrage incomplète

Le README frontend demande de copier `.env.example` vers `.env.local`, mais aucun fichier `.env.example` n'est présent dans le workspace.

Impact probable : un nouveau développeur ou un déploiement local peut bloquer dès la mise en route par manque de modèle d'environnement.

Fichier concerné : `frontend/README.md`.

## 4. Points positifs observés

- Le backend utilise Flyway comme source de vérité pour le schéma, ce qui est une base saine pour éviter les dérives de migration.
- L'application est structurée de façon lisible, avec séparation nette entre backend, frontend, composants UI, features métier et layouts.
- Le frontend semble avoir prévu une logique de refresh token, de permissions dynamiques et de gestion de session centralisée.

## 5. Risques à confirmer par exécution

Ces points méritent une vérification runtime, car l'analyse statique seule ne suffit pas.

- Vérifier si un accès direct à `/dashboard` expose trop de contenu avant la redirection client.
- Vérifier que l'application démarre correctement sans variables d'environnement explicites et que les secrets par défaut ne sont pas utilisés en production.
- Vérifier que le lint et le build frontend détectent encore les erreurs utiles malgré `ignoreDuringBuilds: true`.
- Vérifier que le guide d'installation fonctionne réellement avec les fichiers présents dans le dépôt.

## 6. Conclusion

L'application n'a pas l'air structurellement cassée, mais elle présente plusieurs zones de fragilité claires : authentification trop côté client, configuration sensible avec valeurs de secours, documentation d'environnement incomplète et lint potentiellement affaibli. Ce sont les premiers sujets à corriger ou à valider avant une mise en production.

Si tu veux, je peux faire un deuxième fichier plus technique avec une liste de bugs classés par sévérité et les fichiers précis à corriger.