# StockPro Generator

Read [PIPELINE.md](PIPELINE.md) for the complete prototype → design pack → user model → backend/frontend pipeline, the extraction techniques, and current limitations. [IMPROVEMENTS.md](IMPROVEMENTS.md) records the implemented fixes and validation.

The generated example uses `templates/frontend/packs/stockpro.spack`, extracted from the StockPro reference frontend. After editing the canonical UI under `templates/frontend/next/static`, run `npm run refresh:frontend` to synchronize the extraction scaffold and rebuild the default pack.

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

Use **Up/Down arrows** to highlight an option and **Enter** to confirm it.
This also works for Yes/No questions. The default is highlighted initially;
you can also type an option name or its number (starting at 1). **Ctrl+C** cancels.
Text questions remain ordinary editable input.

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
# generate into ./generated-app using the bundled example schemas
npm run generate -- generated-app/schemas generated-app

# overwrite existing files
node generate.js generated-app/schemas generated-app --force

# preview without writing
node generate.js generated-app/schemas generated-app --dry-run

# fail fast if a relation points to a target not present in the schema set
node generate.js generated-app/schemas generated-app --strict-relations
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
| `UUID`  | `UUID`    | `UUID.randomUUID()` in `@PrePersist`. |
| `String`| `String`  | UUID text assigned in `@PrePersist`. |
| `Long`  | `Long`    | Database identity via `@GeneratedValue(strategy = IDENTITY)`. |

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
    next.config.mjs                # rewrites /api -> http://localhost:8080/api
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
| `backend` | `<output>/` contains the Spring Boot project (unchanged).         |
| `frontend`| `<output>/` contains the client project.                          |
| `both`    | `<output>/server` (backend) + `<output>/client` (frontend) + unified `project.json`. |

The frontend reuses the exact same `entity` model as the backend. `idType`
maps to `string` (`UUID`/`String`) or `number` (`Long`); `javaType` maps to a
TypeScript type; `manyToOne` becomes a select bound to the target id type; the
shared `EntityCrud` harness renders a list + form per entity and calls
`/api/<urlPath>`. `next.config.mjs` rewrites `/api/*` to the backend, so the
client talks to `http://localhost:8080` during development.

Implemented template packs:

* **Next.js (App Router) + Tailwind + TanStack Query + Zustand** — fully
  supported. Produces a static scaffold (auth context, login, protected
  routes, dashboard layout, sidebar) plus a generated `entities-registry.ts`
  and a generic, per-entity CRUD component.

Run it:

```bash
npm run wizard          # choose backend / frontend / both and the stack
# or headless with a specific template pack:
node generate-frontend.js generated-app/schemas generated-app/client \
    --frontend=next --frontend-template=path/to/my.spack
```

Verify (backend, frontend, or both):

```bash
npm run test-app -- generated-app
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

* **`dev-run.cmd`** (Windows) invokes **`dev-run.ps1`** with an execution-policy
  override for that process. It opens a separate window for each selected server.
* **`dev-run.sh`** (bash) starts the selected servers in the background.

From the generated output directory in PowerShell:

```powershell
.\dev-run.cmd
# Skip dependency installation if it is already complete:
.\dev-run.cmd -NoInstall
# Check detected tool paths without installing dependencies or starting servers:
.\dev-run.cmd -Check
```

You can also invoke the PowerShell script directly without changing your system policy:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\dev-run.ps1
```

On Windows, the launcher finds complete portable Node distributions under
`.tools\node` or `.tools\node-*-win-*` in the app directory or a parent directory,
then checks `NODE_HOME`, `PATH` and standard Node install locations. A standalone
`node.exe` without npm is insufficient. Java/Maven discovery also supports
`JAVA_HOME`, `JDK_HOME`, `MAVEN_HOME`, `M2_HOME`, project-local tools, IntelliJ JDKs
under `%USERPROFILE%\.jdks` and Maven's wrapper cache under `%USERPROFILE%\.m2`.
Selected tool paths apply only to the launcher and its child server windows.
The launcher uses `npm.cmd` to avoid PowerShell blocking `npm.ps1`, checks
dependencies before starting servers, and stops if `npm install` fails. The
wizard's Windows "run now" action uses this same launcher.

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
cd <output>/server && mvn spring-boot:run   # backend  -> http://localhost:8080  (needs PostgreSQL)
cd <output>/client && npm install && npm run dev
```

Log in with the seeded account `admin / admin123`.

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

The bundled `generated-app/schemas` models a small stock/crm domain:

`Product` (module `stock`), `Category` (module `stock`), and `Customer`
(module `crm`), with `Product → Category` (many-to-one) and the relations, ids
and security levels used to exercise the generator.
