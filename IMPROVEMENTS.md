# Improvement and validation record

Date: 4 October 2026.

The generated example now uses `templates/frontend/packs/stockpro.spack`, extracted from the matching local StockPro frontend. Its manifest enables the theme toggle. The shared scaffold has a responsive navigation drawer, module-grouped links, a top bar, dashboard cards with API counts, styled tables, optional create/edit forms, state feedback, deletion confirmation and operation-aware actions.

The canonical UI lives in `templates/frontend/next/static`. `node tools/refresh-frontend.js` synchronizes the design-extraction base and rebuilds the bundled default pack, keeping future generations consistent with the source templates.

| Finding | Change |
| --- | --- |
| Design pack listed templates without including their bytes | Include every registered template and put the registry at its real client path |
| Generated Tailwind configuration could not compile | Emit valid object syntax, proper font-family arrays and CSS keyframes |
| Color merging discarded color objects; clustering produced invalid colors | Preserve color/count pairs and compute actual centroid RGB hex values |
| All button variants shared one family | Separate families and retain common button styles |
| Tailwind animations and numeric brand scales were ignored | Preserve keyframe utilities and select an explicit brand shade |
| Theme classes bypassed generated colors | Use CSS variables and preserve the scaffold's shared component styles |
| `/dashboard` did not have a correct generated route | Emit the protected grouped dashboard route; archive the example's obsolete duplicate route |
| Frontend lost validation, relation and ID metadata | Emit richer JSON descriptors and render typed controls and relation selects |
| Existing frontend files were overwritten despite the documented force flag | Honor `--force` and add a real `--dry-run` |
| Pack entries could escape staging | Reject invalid relative paths before extraction |
| Search/filter arguments were discarded by the service | Generate JPA specifications used by list/export queries |
| Generated entity permissions were absent from bootstrap data | Seed those codes alongside the built-in administration permissions |
| String IDs produced UUID values; Long IDs used timestamps | Use UUID text for String IDs and database identities for Long IDs |
| DTOs/entities missed date/decimal/UUID imports | Generate imports for the actual field types |
| Two relations to the same entity emitted duplicate resolver methods | Share a resolver per target |
| Paginated controllers called a method absent when search was disabled | Generate the paginated method independently of the search flag |
| Method-security annotations remained when security was disabled | Conditionally emit both annotations and imports |
| Direct schemas omitted update-field defaults | Derive editable fields when not explicitly supplied |
| Login errors were unhandled and user details remained incomplete | Display connection failures and load `/api/auth/me` after login |
| Verifier could approve a missing frontend | Require client entry points and registered entities; scan source without traversing dependencies |
| Wizard options required typing their names | Add Up/Down and Enter menus, including Yes/No prompts; retain typed names, numbered choices and piped input |
| Windows blocked the launcher script; server paths were incorrectly escaped | Add a process-only `dev-run.cmd` entry point, use safe working directories and `npm.cmd`, and stop on dependency installation failures |
| A standalone Node executable left npm unavailable | Discover complete project-local Node/npm distributions and existing Java/Maven installations; inherit the selected paths in server windows and expose `-Check` |

Validation performed:

- 41 Node regression tests passed, including terminal navigation, defaults, typed choices, cancellation and alternating text/menu prompts.
- Windows launcher checks use real PowerShell with mocked server processes: backend/frontend/both targets, paths with spaces and apostrophes, `-NoInstall` and failed dependency installation.
- Missing-npm reproduction: `dev-run.cmd -Check` resolves project-local Node 22.23.3/npm 10.9.9 and the existing JDK/Maven installations without changes to the system PATH. The official Node archive's SHA-256 checksum was verified. Real frontend `npm install` completed successfully; server launches were mocked in `artifacts/launcher-smoke.ps1`.
- Windows terminal smoke check: selected Web application with Down/Enter, resumed editable text input and cancelled without generating files.
- `node verify-app.js generated-app` passed for the reference output before later wizard runs; regression tests now verify isolated generated outputs so local wizard runs do not invalidate the test fixture.
- Example Spring Boot backend: Maven compilation passed, 130 Java source files, Java release 17.
- Additional mixed-type/relation fixture: Maven compilation passed, 123 Java source files.
- Generated frontend: Next.js production build passed for the default scaffold and the extracted StockPro pack, including route generation and TypeScript checks.

The obsolete example route was preserved under `artifacts/previous-dashboard-route`. Generated compile fixtures and the extracted `design.json` are under `artifacts`; portable tooling is under `.tools`. These working artifacts are ignored by Git. No changes were made to the prototype checkout.

The build checks used existing frontend dependencies and the local Java/Maven installations. No application database was started or modified. Authenticated CRUD against PostgreSQL, browser-based visual comparison and exact prototype parity have not been verified. The extract-and-pack route preserves design tokens; it does not automatically migrate every prototype component or domain workflow.

The npm install check reported nine dependency vulnerabilities (eight high, one critical). Dependency upgrades require separate validation; this launcher change does not resolve those advisories.

See [PIPELINE.md](PIPELINE.md) for the full data flow, commands, extraction techniques and the wizard settings that remain metadata-only.
