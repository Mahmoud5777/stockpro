# StockPro Generator

A Node.js CLI and code-generation engine that produces a complete, runnable
full-stack application from a JSON application model: a Spring Boot backend
(Java 17 / Spring Boot 3.5.x) and a Next.js frontend (App Router). It is
inspired by the [stockpro](https://github.com/Mahmoud5777/stockpro) project and
targets the `stockpro-yacine` security/stock-management domain.

The generator emits, for every entity:

- `Entity` (JPA entity with relations, validation and UUID/String/Long ids)
- `DTO` (flat relation ids, validation, optional write-only fields)
- `Repository` (Spring Data JPA, custom finders)
- `Service` + `ServiceImpl` (business logic, relation resolution)
- `Mapper` (Entity <-> DTO)
- `Controller` (REST endpoints with method-level security)

All generated code is free of unresolved template placeholders and compiles
under a standard Spring Boot project layout.

## Requirements

- **Node.js** >= 18 (uses `node --test` and `fs.readFileSync(0)`)
- **Java** 17 and **Maven** (or Gradle) to build/run the generated application
- The generator itself only needs the `handlebars` dependency.

## Installation

```bash
npm install
```

## Quick start — interactive wizard

```bash
npm run wizard
```

The wizard collects the complete application model (application info, features,
security, and every entity with its fields and relations) and then:

1. writes `project.json` (the persisted model) plus one schema file per entity
   under `<output>/schemas/`,
2. invokes the generator with `--strict-relations`.

Piping answers for non-interactive use is supported:

```bash
node cli.js < answers.txt
```

Each line of `answers.txt` answers one prompt; empty lines accept defaults.

## Generating from schemas directly

```bash
# generate into ./scratch using the bundled example schemas
npm run generate -- examples/stock-crm scratch

# overwrite existing files
node generate.js examples/stock-crm scratch --force

# preview without writing
node generate.js examples/stock-crm scratch --dry-run

# fail fast if a relation points to a target not present in the schema set
node generate.js examples/stock-crm scratch --strict-relations
```

### CLI options

| Option                | Description                                              |
| --------------------- | -------------------------------------------------------- |
| `--force`             | Overwrite files that already exist.                      |
| `--dry-run`           | Print the files that would be written, write nothing.    |
| `--strict-relations`  | Treat missing relation targets as errors.                |
| `--verbose`           | Log the computed feature flags per entity.               |
| `--help` / `-h`       | Show usage.                                              |

## Schema format

Each entity lives in its own `*.json` file shaped as `{ "entity": { ... } }`.
The files are read in alphabetical order; that order is also the generation
order (important for relation targets).

```json
{
  "entity": {
    "module": "security",
    "name": "User",
    "tableName": "USERS",
    "idField": "id",
    "idColumn": "USER_ID",
    "urlPath": "users",
    "idType": "UUID",
    "securityLevel": "high",
    "serviceDescription": "User management",
    "permissionCode": "ADMIN_USER",
    "features": {
      "pagination": true,
      "search": true,
      "export": true,
      "security": true,
      "validation": true
    },
    "fields": [
      {
        "name": "username",
        "nameCap": "Username",
        "columnName": "USERNAME",
        "javaType": "String",
        "length": 50,
        "required": true,
        "errorMessage": "Le nom d'utilisateur est obligatoire",
        "unique": true
      },
      {
        "name": "password",
        "javaType": "String",
        "length": 255,
        "required": true,
        "errorMessage": "Le mot de passe est obligatoire",
        "writeOnly": true
      }
    ],
    "manyToOne": [
      {
        "relationName": "User_Site",
        "target": "Site",
        "targetModule": "security",
        "fieldName": "site",
        "joinColumn": "SITE_ID",
        "targetIdType": "UUID",
        "targetIdField": "id",
        "nullable": false,
        "cascade": "PERSIST",
        "orphanRemoval": false
      }
    ],
    "oneToMany": [
      {
        "relationName": "User_UserSite",
        "target": "UserSite",
        "targetModule": "security",
        "fieldName": "userSites",
        "mappedBy": "user",
        "orphanRemoval": true
      }
    ],
    "relationIds": [],
    "customFinders": [
      {
        "methodName": "findByUsername",
        "returnType": "Optional",
        "targetEntity": "User",
        "paramName": "username",
        "paramType": "String",
        "jpaMethod": "findByUsername"
      }
    ],
    "exportColumns": [
      { "nameCap": "Username", "label": "username" }
    ]
  }
}
```

### Field properties

| Property      | Required | Notes                                                        |
| ------------- | -------- | ------------------------------------------------------------ |
| `name`        | yes      | Valid Java identifier.                                       |
| `javaType`    | yes      | One of `String, Integer, Long, Double, Float, Boolean, LocalDate, LocalDateTime, BigDecimal, UUID`. |
| `required`    | no       | When `true`, an `errorMessage` **must** be provided.         |
| `unique`      | no       | Adds a unique constraint.                                    |
| `length`      | no       | For `String` columns (default 255).                          |
| `writeOnly`   | no       | Excluded from responses (e.g. passwords).                   |
| `minLength` / `maxLength` / `email` | no | Validation metadata.                          |
| `errorMessage`| if required | Human-readable validation message.                        |

### Relations

- **manyToOne** — a `@ManyToOne` association. The DTO exposes a flat
  `<fieldName>Id` field; the service layer resolves the target entity via an
  injected target repository (`resolve<Target>()`), so no detached entities are
  persisted.
- **oneToMany** — a `@OneToMany` collection. Requires `mappedBy` referencing the
  field name on the target entity.
- **relationIds** — explicit id-only columns for associations that should not
  load the full target.

Relation targets must be present in the schema set. With `--strict-relations`
a missing target aborts generation; otherwise it is reported as a warning.

## Identifier types

`idType` is one of:

| Type    | Java type | Strategy                                            |
| ------- | --------- | --------------------------------------------------- |
| `UUID`  | `UUID`    | `@GeneratedValue`, `UUID.randomUUID()` in `@PrePersist`. |
| `String`| `String`  | `@GeneratedValue(strategy = IDENTITY)`.              |
| `Long`  | `Long`    | `@GeneratedValue(strategy = IDENTITY)`, `System.currentTimeMillis()` in `@PrePersist`. |

The matching imports are emitted only when needed.

## Security levels

`securityLevel` controls which operations get method-level security
(`@PreAuthorize`) on the controller:

| Level   | Exposed operations                          |
| ------- | ------------------------------------------- |
| `low`   | consultation (read)                         |
| `medium`| consultation, ajout (create), modification (update) |
| `high`  | consultation, ajout, modification, suppression (delete), export |

When `features.security` is enabled every mutation endpoint is protected; when
it is disabled no `@PreAuthorize` is generated. Permission codes follow the
pattern `<permissionPrefix>_<ENTITY>` (e.g. `ADMIN_USER`).

## Generated application structure

A full-stack output (`targets: ["backend", "frontend"]`) looks like:

```
<output>/
  project.json
  schemas/<NN>-<Entity>.json
  server/                          # Spring Boot backend
    pom.xml
    src/main/java/com/stockpro/
      entity/<module>/<Entity>.java
      entity/security/User.java     # built-in auth core
      dto/<module>/<Entity>DTO.java
      repository/<module>/<Entity>Repository.java
      service/<module>/<Entity>Service.java
      service/<module>/impl/<Entity>ServiceImpl.java
      mapper/<module>/<Entity>Mapper.java
      controller/<module>/<Entity>Controller.java
      controller/auth/AuthController.java
      security/...                  # JWT filter, JwtService, AccessGuard
      util/ExcelExporter.java
  client/                          # Next.js frontend
    package.json
    next.config.mjs                # Next.js configuration
    src/
      lib/entities-registry.ts      # generated from the schemas
      features/shared/EntityCrud.tsx
      features/auth/...
```

The built-in backend **auth core** (JWT login/refresh/logout, `User`/`Role`/
`RefreshToken` entities, `AccessGuard`, Excel export) is emitted for every
backend project so the generated app is runnable out of the box.

## Frontend generation

The same entity schemas drive a Next.js client project. The wizard asks one
extra question — **generation target** — and, when the target includes a
frontend, a short set of stack prompts:

```
Generation target (backend / frontend / both) [both]:
Frontend framework (next):                     next
Template pack (.spack) — vide pour le pack intégré:
Bibliothèque UI (tailwind):                    tailwind
Gestion d'état / données (zustand):            zustand
Internationalisation (i18n) (Y/n):             N
Thème clair/sombre (y/N):                       N
```

Targets:

| Target    | Layout                                                            |
| --------- | ----------------------------------------------------------------- |
| `backend` | `<output>/server` contains the Spring Boot project.                |
| `frontend`| `<output>/client` contains the client project.                    |
| `both`    | `<output>/server` (backend) + `<output>/client` (frontend) + unified `project.json`. |

The frontend reuses the exact same `entity` model as the backend. `idType`
maps to `string` (`UUID`/`String`) or `number` (`Long`); `javaType` maps to a
TypeScript type; `manyToOne` becomes a select bound to the target id type; the
shared `EntityCrud` harness renders a list + form per entity and calls
`/api/<urlPath>`. The generated client calls the backend using
`NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8081`.

Implemented template packs:

* **Next.js (App Router) + Tailwind + TanStack Query + Zustand** — fully
  supported. Produces a static scaffold (auth context, login, protected
  routes, dashboard layout, sidebar) plus a generated `entities-registry.ts`
  and a generic, per-entity CRUD component.

Run it:

```bash
npm run wizard          # choose backend / frontend / both and the stack
# or headless with a specific template pack:
node generate-frontend.js examples/stock-crm scratch/client \
    --frontend=next --frontend-template=path/to/my.spack
```

Verify (backend, frontend, or both):

```bash
npm run test-app -- scratch
```

## Template packs (.spack)

The frontend is generated entirely from a **template pack** — a single
self-contained `.spack` ZIP that describes the exact UI, shape and design you
want. This decouples the frontend from the generator: build a pack once, reuse
it everywhere, and swap designs without touching the generator's code.

A pack contains:

* **project files** — copied verbatim into the generated client,
* **Handlebars templates** (files ending in `.hbs`) — rendered against the
  entity schemas; the rendered file's path drops the `.hbs` suffix,
* a root **`pack.json`** manifest (framework, uiLibrary, state, templates).

The bundled pack is `templates/frontend/packs/next-tailwind.spack`. Use
`--frontend-template=<file.spack>` (or the wizard prompt) to use another.

### Building your own pack

`tools/pack-frontend.js` turns any finished frontend template project into a
`.spack` file — this is the "template generator" for the frontend:

```bash
# pack a custom template directory into a reusable .spack
node tools/pack-frontend.js path/to/my-template out/sp/my.spack \
    --name=my-design --framework=next
# to also inject the generated entity registry template:
node tools/pack-frontend.js path/to/my-template out/sp/my.spack \
    --registry=templates/frontend/next/entities-registry.ts.hbs
```

It scans `<templateDir>` recursively; any `*.hbs` file becomes a Handlebars
template rendered at generation time. You can regenerate the bundled pack with:

```bash
node tools/pack-frontend.js templates/frontend/next/static \
    templates/frontend/packs/next-tailwind.spack \
    --name=next-tailwind --framework=next \
    --registry=templates/frontend/next/entities-registry.ts.hbs
```

## Running the generated app

After generation the wizard prints run instructions and writes launcher scripts
into the output directory:

* **`dev-run.ps1`** (Windows) and **`dev-run.sh`** (bash) — start the backend
  and frontend dev servers in separate windows/background.

When run interactively, the wizard also asks **"Lancer l'application maintenant ?"**
and, on yes, installs the frontend dependencies and launches both dev servers.
For non-interactive use pass `--run` to launch immediately or `--skip-run` to
always skip:

```bash
node cli.js < answers.txt --run       # generate then install + launch
node cli.js < answers.txt --skip-run  # generate only
```

Steps required once per machine:

```bash
cd <output>/server && mvn spring-boot:run   # backend -> http://localhost:8081 (H2 by default)
cd <output>/client && npm install && npm run dev
```

The default local database is an H2 in-memory database, so the generated app
boots without a PostgreSQL service. Data is reset when the backend stops. To
use PostgreSQL, set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and optionally
`SERVER_PORT` before starting Spring Boot. Set `NEXT_PUBLIC_API_URL` to the
same backend URL when the frontend runs on another machine or port.

The local seed account is `admin / admin123`. Change or disable it before
production use.

## Generator hardening plan

The following behavior is now generated from the source templates and is part
of the generator contract. This prevents the runtime failures found while
validating the generated StockPro app:

1. **One backend connection contract**
   - Spring Boot defaults to H2 on port `8081` for a zero-setup local run.
   - PostgreSQL remains supported through `DB_URL`, `DB_USERNAME`, and
     `DB_PASSWORD` environment variables.
   - H2 is included as a runtime dependency in generated `pom.xml`.

2. **One frontend API contract**
   - Axios defaults to `NEXT_PUBLIC_API_URL=http://localhost:8081`.
   - The backend CORS default accepts local development origins on any
     `localhost` or `127.0.0.1` port; deployments should override it with
     `CORS_ALLOWED_ORIGINS`.

3. **Complete generated navigation**
   - The route group `(dashboard)` is not treated as a URL segment.
   - A real protected `/dashboard` route and layout are generated.
   - Login and the sidebar both navigate to `/dashboard`.

4. **Schema-driven security**
   - Every generated entity gets a normalized `permissionCode` when one is not
     supplied.
   - `DataInitializer` seeds each schema entity as a functionality and grants
     all rights to the local `SUPERADMIN` profile.
   - Frontend registry permission codes come from the same normalized schema.

5. **Schema-driven pagination**
   - `defaultSortField` may be supplied in a schema.
   - If omitted, the first declared field is used, then the id field.
   - Validation rejects an unknown sort field before Java is generated, avoiding
     Spring Data errors such as `No property 'nom' found for type 'Product'`.

6. **Verification before delivery**
   - Validate schemas with strict relations.
   - Generate into a clean directory.
   - Compile the backend and type-check/build the frontend.
   - Start both services and verify login, `/api/auth/me`, and one list endpoint
     per generated entity.

### Recommended generator acceptance check

```bash
# from the generator repository
npm test
node generate.js schemas <clean-output> --force --strict-relations
node verify-app.js <clean-output>
cd <clean-output> && mvn -q -DskipTests compile
cd client && npx tsc --noEmit && npm run build
```

For a live smoke test, start the backend and frontend, log in with the seed
account, confirm the browser reaches `/dashboard`, then confirm every generated
entity list returns HTTP `200`. A table with zero rows is valid for a fresh H2
database; HTTP `403` indicates a permission seed mismatch and HTTP `500` from a
list endpoint indicates an invalid generated sort/property name.

## Verifying a generated application

`verify-app.js` checks the manifest (`entityCount` vs `generationOrder`),
confirms the expected Java files exist for each generated entity, and fails if
any backend file still contains an unresolved `{{` / `}}` Handlebars
placeholder:

```bash
npm run test-app -- generated-app
```

## Running the test suite

```bash
npm test
```

The suite covers: CLI help, schema validation errors, relation validation,
dry-run/skip/force behaviour, identifier types, relation resolution, the formal
schema contract, duplicate detection, security levels, generated-app
verification, the wizard output, frontend generation, and the template-pack
(pack → client) round trip.

## Example domain model

The bundled `examples/stock-crm` schemas model a small stock/crm domain:

`Product` (module `stock`), `Category` (module `stock`), and `Customer`
(module `crm`), with `Product → Category` (many-to-one) and the relations, ids
and security levels used to exercise the generator.
