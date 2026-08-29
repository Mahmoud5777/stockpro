# StockPro Backend Generator

A Node.js CLI and code-generation engine that produces a complete Spring Boot
backend (Java 17 / Spring Boot 3.x) from a JSON application model. It is
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

```
<output>/
  project.json
  schemas/<NN>-<Entity>.json
  src/main/java/com/stockpro/
    entity/<module>/<Entity>.java
    dto/<module>/<Entity>DTO.java
    repository/<module>/<Entity>Repository.java
    service/<module>/<Entity>Service.java
    service/<module>/impl/<Entity>ServiceImpl.java
    mapper/<module>/<Entity>Mapper.java
    controller/<module>/<Entity>Controller.java
```

## Frontend generation

The same entity schemas drive a client project. The wizard asks one extra
question — **generation target** — and, when the target includes a frontend,
a set of stack prompts:

```
Generation target (backend / frontend / both) [both]:
Framework (angular / react / vue):          angular
Outil de build du frontend:                 angular-cli
Bibliothèque UI (primeng / angular-material): primeng
Gestion d'état / données (signals / ngrx):  signals
Internationalisation (i18n) (Y/n):           Y
Thème clair/sombre (y/N):                    Y
```

Targets:

| Target    | Layout                                                            |
| --------- | ----------------------------------------------------------------- |
| `backend` | `<output>/` contains the Spring Boot project (unchanged).         |
| `frontend`| `<output>/` contains the client project.                          |
| `both`    | `<output>/server` (backend) + `<output>/client` (frontend) + unified `project.json`. |

The frontend reuses the exact same `entity` model as the backend. `idType`
maps to `string` (`UUID`/`String`) or `number` (`Long`); `javaType` maps to a
TypeScript type; `manyToOne` becomes a select bound to `<targetIdType>`; the
API base URL is `environment.apiUrl` and per-entity services call
`/api/<urlPath>`. Security levels and `permissionCode` drive route guards and
button visibility exactly like the backend.

Implemented template packs:

* **Angular + PrimeNG + signals** — fully supported. Produces `model.ts`,
  `service.ts`, list and form components, `app.routes.ts`, auth/permission
  guards, JWT interceptor, i18n, and a layout shell.

> `react` and `vue` are accepted by the validator but their template packs are
> not bundled yet; selecting them warns and skips client generation until the
> corresponding `templates/frontend/<framework>/` pack is added.

Run it:

```bash
npm run wizard          # choose backend / frontend / both and the stack
# or headless:
node generate-frontend.js generated-app/schemas generated-app/client --frontend=angular
```

Verify (backend, frontend, or both):

```bash
npm run test-app -- generated-app
```

## Verifying a generated application

`verify-app.js` checks the manifest (`entityCount` vs `generationOrder`),
confirms 49 expected Java files exist, and fails if any file still contains an
unresolved `{{` / `}}` Handlebars placeholder:

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
verification, and the wizard output.

## Example domain model

The bundled `generated-app/schemas` models the stockpro security domain:

`User`, `Site`, `Role`, `Group`, `UserSite`, `GroupeRole`, `UserSiteDroits`
with the relations, ids and security levels used in production.
