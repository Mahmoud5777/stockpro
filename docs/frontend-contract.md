# Frontend Generation Contract (frozen at v0.2-contract)

This document is the synchronization contract between the orchestration track (main
agent) and the parallel GitHub Copilot tracks. It defines the shared shape so work
on different folders never conflicts.

## 1. Generation targets

`cli.js` asks one new prompt after the application info block:

```
Generation target (backend / frontend / both) [both]:
```

* `backend`  -> only the existing Spring Boot project (unchanged layout, root `src/...`).
* `frontend` -> only the client project (root becomes the client folder).
* `both`     -> monorepo: `<output>/server` (backend) + `<output>/client` (frontend) +
               `<output>/project.json` (unified manifest).

## 2. Unified manifest shape (extends generated-app/project.json)

```json
{
  "targets": ["backend", "frontend"],
  "appName": "StockPro",
  "appType": "REST API",
  "basePackage": "com.stockpro",
  "outputDir": "stockpro-app",
  "database": "postgresql",
  "buildTool": "maven",
  "javaVersion": "17",
  "springBootVersion": "3.2.0",
  "security": { "level": "high", "authenticationType": "jwt", "methodSecurity": true, "permissionPrefix": "ADMIN" },
  "features": { "pagination": true, "search": true, "filtering": true, "export": true, "auditFields": false, "softDelete": false, "apiDocumentation": true },
  "frontend": {
    "framework": "angular",
    "buildTool": "angular-cli",
    "uiLibrary": "primeng",
    "state": "signals",
    "features": { "pagination": true, "search": true, "filtering": true, "export": true, "i18n": true, "theming": true }
  },
  "entityCount": 7,
  "entityOrder": ["User", "Site", "Role", "Group", "UserSite", "GroupeRole", "UserSiteDroits"],
  "generationOrder": ["User", "Site", "Role", "Group", "UserSite", "GroupeRole", "UserSiteDroits"],
  "schemaVersion": "1.0.0",
  "createdAt": "2026-08-27T00:00:00.000Z"
}
```

`security.level` and `features` are shared and drive BOTH stacks. Frontend derives
`securityOperations` from `security.level` exactly like `generate.js` (`low: consultation`,
`medium: + ajout + modification`, `high: + export + suppression`).

## 3. Entity context for frontend templates

Frontend templates receive the SAME `{ entity }` object produced by `normalizeEntity`
in `generate.js`, plus these derived fields added by `generate-frontend.js`:

* `entity.idTsType` -> `"string"` for `UUID`/`String`, `"number"` for `Long`.
* `entity.fields[].tsType` -> Java type mapped via
  `String/UUID/LocalDate/LocalDateTime -> string`, `Long/Integer/Double/Float/BigDecimal -> number`, `Boolean -> boolean`.
* `entity.manyToOne[].tsIdType` -> `"string"`/`"number"` like `idTsType`.
* `entity.kebabName` -> `entity.name` in kebab-case (e.g. `UserSite -> user-site`).
* `entity.tsOptional` -> derived flag (not used by default).

Helper reused from `generate.js`: `eq`, `ne`, `lowerFirst`, `capitalize`.
New helper: `kebabCase` (registered in `generate-frontend.js`).

## 4. Output layout (client)

```
<clientRoot>/
  package.json                      (from templates/frontend/<fw>/package.json.hbs)
  angular.json | vite.config.ts     (if template present)
  src/
    environments/environment.ts     (from templates/frontend/<fw>/environments/environment.hbs)
    app/
      core/auth/*.ts                (from templates/frontend/<fw>/app/core/auth/*.hbs)
      core/permission/*.ts          (from templates/frontend/<fw>/app/core/permission/*.hbs)
      core/*.ts                     (from templates/frontend/<fw>/app/core/*.hbs)
      layout/*.ts                   (from templates/frontend/<fw>/app/layout/*.hbs)
      shared/*.ts                   (from templates/frontend/<fw>/app/shared/*.hbs or _shared/*.hbs)
      app.routes.ts                 (assembled by generate-frontend.js from routes.fragment.hbs or inline)
      features/<module>/<kebabName>/
        <Name>.model.ts             (model.hbs)
        <Name>.service.ts           (service.hbs)
        <kebabName>.list.component.ts/.html/.scss   (list/*.hbs)
        <kebabName>.form.component.ts/.html         (form/*.hbs)
```

`module` comes from `entity.module` (e.g. `security`). `kebabName` from `entity.kebabName`.

## 5. URL & permission mapping (single source)

* API base URL: `environment.apiUrl` default `http://localhost:8080/api`.
* Per-entity service base: `/api/{{entity.urlPath}}` (e.g. `/api/users`).
* Route path: `{{entity.urlPath}}`.
* Permission data: `permissionCode` (`ADMIN_<ENTITY>`) + `securityOperations` flags gate
  buttons/endpoints. `low` -> read only; `high` -> create/edit/delete/export enabled.

## 6. Validation

`validate.js` exports `validateFrontendManifest(frontend)` checking:
* `framework` in `["angular","react","vue"]`.
* `uiLibrary` valid for framework (angular: primeng|angular-material; react: antd|mui; vue: vuetify|element-plus).
* `state` valid for framework (angular: signals|ngrx; react: tanstack-query|redux; vue: pinia|vuex).
* `features` is an object.

`validateEntitySchema` (unchanged) validates every entity for both stacks.

## 7. Flags

`generate-frontend.js <schemaDir> <clientRoot> [--frontend=angular] [--force] [--dry-run]`

`cli.js` orchestrates:
* backend -> `spawnSync(generate.js, [schemaDir, serverRoot, "--strict-relations"])`
* frontend -> `spawnSync(generate-frontend.js, [schemaDir, clientRoot, "--frontend", framework])`

## 8. Ownership (CODEOWNERS)

* `cli.js`, `generate.js`, `validate.js`, `generate-frontend.js`, `docs/frontend-contract.md`, `verify-app.js` (backend-root detection only) -> main agent.
* `templates/frontend/angular/**` (entity) -> Copilot C1.
* `templates/frontend/react/**` (entity) -> Copilot C2.
* `templates/frontend/**/app/**`, `templates/frontend/_shared/**` (shell/globals) -> Copilot C3.
* `verify-app.js` (frontend checks), `test/**` (frontend cases) -> Copilot C4.
* `templates/frontend/<fw>/package.json.hbs`, `angular.json.hbs`, `vite.config.ts.hbs`, `docker-compose.hbs`, `README` -> Copilot C5.
