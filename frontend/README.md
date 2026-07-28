# StockERP — Frontend (Next.js 15 / React 19 / TypeScript)

Frontend indépendant pour un ERP de gestion de stock, connecté à un backend
Spring Boot (Spring Security, JWT, PostgreSQL, OpenAPI) via une API REST.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS
- Axios (client HTTP + intercepteurs JWT / refresh token)
- TanStack Query (cache serveur, mutations)
- React Hook Form + Zod (formulaires et validation)
- Zustand (état global : auth, UI, toasts)
- React Icons, Framer Motion

## Démarrage

```bash
cp .env.example .env.local
# renseigner NEXT_PUBLIC_API_BASE_URL (ex: http://localhost:8080/api)

npm install
npm run dev
```

## Authentification (Spring Security + JWT + Refresh Token)

- **Login uniquement** : aucune page d'inscription. Les comptes sont créés
  exclusivement par un administrateur depuis *Administration > Utilisateurs*.
- `POST /auth/login` renvoie `{ accessToken, refreshToken, user }`.
- L'`accessToken` est stocké en `sessionStorage`, le `refreshToken` en
  `localStorage` (voir `src/utils/storage.ts`).
- **Intercepteur Axios** (`src/lib/axios.ts`) :
  - ajoute automatiquement `Authorization: Bearer <accessToken>` à chaque requête ;
  - si une requête échoue en `401`, appelle automatiquement
    `POST /auth/refresh` avec le `refreshToken`, met à jour l'`accessToken`,
    puis **rejoue la requête d'origine** ;
  - les requêtes concurrentes pendant un refresh sont mises en file d'attente
    pour éviter des appels multiples au endpoint de refresh ;
  - si le refresh échoue, la session est purgée et l'utilisateur est
    redirigé vers `/login`.
- **Logout** : `authService.logout()` envoie explicitement le `refreshToken`
  à `POST /auth/logout` afin que le backend puisse le **révoquer côté
  serveur** (table de refresh tokens / blacklist géré par Spring Security),
  puis nettoie le stockage local dans tous les cas.
- `AuthProvider` (`src/features/auth/context/AuthContext.tsx`) réhydrate la
  session au chargement via `GET /auth/me`, expose `login`, `logout`, et
  `can(code, action)` pour vérifier les droits.
- `ProtectedRoute` protège l'ensemble du groupe de routes `(dashboard)`.

## Permissions dynamiques

Aucune permission n'est codée en dur. Le backend renvoie, à la connexion,
la liste des fonctionnalités accessibles à l'utilisateur ainsi que ses droits
(consultation / ajout / modification / suppression / export / impression)
pour chacune. Le menu (`src/features/navigation`) et les boutons d'action
(`<RequirePermission code="..." action="...">`) se basent uniquement sur
ces données.

## Module Administration

- **Utilisateurs**, **Sites** (hiérarchiques), **Profils** (matrice de droits
  par fonctionnalité), **Rôles**, **Groupes** (association profils + rôles),
  **Fonctionnalités** (menu applicatif), et **Audit des accès**.
- La page **Audit des accès** est **strictement en lecture seule** : elle
  liste les événements de connexion, déconnexion, échec d'authentification,
  rafraîchissement de token et accès refusé, avec recherche, tri et filtre
  par type d'événement — aucune action de création/modification/suppression
  n'y est proposée.

## Architecture

```
src/
  app/                # Routes Next.js (App Router)
  components/ui/      # Composants réutilisables (Button, DataTable, Modal...)
  features/           # Modules métier (auth, dashboard, administration/*)
    <module>/
      components/
      pages/
      hooks/
      services/
      types/
      validation/
  layouts/            # Sidebar, Topbar, Footer, DashboardLayout
  lib/                # axios, queryClient, constants, permissions
  store/              # Zustand (auth, ui, toast)
  types/               # Types partagés
  utils/               # Fonctions utilitaires (cn, date, storage)
  middleware.ts
```

Le module `features/administration/shared` factorise la logique CRUD
commune (`useEntityCrud`, `CrudPageHeader`, `PageCard`) afin d'éviter toute
duplication entre les sous-modules d'administration.
