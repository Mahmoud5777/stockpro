#!/usr/bin/env node
/**
 * Frontend generator for the StockPro backend generator.
 *
 * Renders a client project (Angular / React / Vue) from the same entity schemas
 * used by the backend generator. Template packs live under
 * `templates/frontend/<framework>/` and are produced by the parallel Copilot
 * tracks. This module owns orchestration, the shared model, and output layout
 * only — never the template content.
 *
 * Usage: node generate-frontend.js <schemaDir> <clientRoot> [--frontend=angular] [--force] [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const { loadSchemas, normalizeEntity } = require("./generate");
const { validateFrontendManifest } = require("./validate");

const ROOT = __dirname;
const TEMPLATES_FRONTEND_DIR = path.join(ROOT, "templates", "frontend");

Handlebars.registerHelper("eq", (left, right) => left === right);
Handlebars.registerHelper("ne", (left, right) => left !== right);
Handlebars.registerHelper("lowerFirst", (value) => value.charAt(0).toLowerCase() + value.slice(1));
Handlebars.registerHelper("capitalize", (value) => value.charAt(0).toUpperCase() + value.slice(1));
Handlebars.registerHelper("kebabCase", (value) =>
  String(value).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase()
);

const JAVA_TO_TS = {
  String: "string", Integer: "number", Long: "number", Double: "number",
  Float: "number", BigDecimal: "number", Boolean: "boolean",
  LocalDate: "string", LocalDateTime: "string", UUID: "string",
};

function tsType(javaType) {
  return JAVA_TO_TS[javaType] || "string";
}

function kebab(name) {
  return String(name).replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();
}

// Per-entity layers: template file (relative to framework dir) -> output path.
const FRAMEWORK_LAYERS = {
  angular: [
    { tpl: "model.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.name}.model.ts` },
    { tpl: "service.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.name}.service.ts` },
    { tpl: "list/list.component.ts.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.kebabName}.list.component.ts` },
    { tpl: "list/list.component.html.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.kebabName}.list.component.html` },
    { tpl: "list/list.component.scss.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.kebabName}.list.component.scss` },
    { tpl: "form/form.component.ts.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.kebabName}.form.component.ts` },
    { tpl: "form/form.component.html.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.kebabName}.form.component.html` },
  ],
  react: [
    { tpl: "model.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.name}.model.ts` },
    { tpl: "service.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.name}.service.ts` },
    { tpl: "list/List.tsx.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/List.tsx` },
    { tpl: "form/Form.tsx.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/Form.tsx` },
  ],
  vue: [
    { tpl: "model.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.name}.model.ts` },
    { tpl: "service.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/${e.name}.service.ts` },
    { tpl: "list/List.vue.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/List.vue` },
    { tpl: "form/Form.vue.hbs", out: (e) => `src/app/features/${e.module}/${e.kebabName}/Form.vue` },
  ],
};

function loadFrontendTemplates(framework) {
  const dir = path.join(TEMPLATES_FRONTEND_DIR, framework);
  if (!fs.existsSync(dir)) return null;
  const map = {};
  (function walk(current, rel) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const relative = path.join(rel, entry.name);
      if (entry.isDirectory()) {
        walk(full, relative);
      } else if (entry.name.endsWith(".hbs")) {
        map[relative.split(path.sep).join("/")] = Handlebars.compile(fs.readFileSync(full, "utf8"), { noEscape: true });
      }
    }
  })(dir, "");
  return map;
}

function writeFile(filePath, content, options, report) {
  if (options.dryRun) {
    report.planned += 1;
    console.log(`  plan             ${filePath}`);
    return;
  }
  if (fs.existsSync(filePath) && !options.force) {
    report.skipped += 1;
    console.log(`  skip   (exists) ${filePath}`);
    return;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  report.written += 1;
  console.log(`  wrote           ${filePath}`);
}

function augmentForFrontend(entity) {
  const e = entity;
  e.idTsType = e.idType === "Long" ? "number" : "string";
  e.kebabName = kebab(e.name);
  for (const field of e.fields || []) field.tsType = tsType(field.javaType);
  for (const rel of e.manyToOne || []) rel.tsIdType = rel.targetIdType === "Long" ? "number" : "string";
  for (const rel of e.relationIds || []) rel.tsIdType = rel.targetIdType === "Long" ? "number" : "string";
  return e;
}

function globalOutputPath(relativeTemplatePath) {
  let rel = stripHbs(relativeTemplatePath);
  if (rel.startsWith("environments/")) return path.join("src", "environments", withCodeExt(rel.slice("environments/".length)));
  if (rel.startsWith("app/")) return path.join("src", "app", withCodeExt(rel.slice("app/".length)));
  if (rel.startsWith("shared/") || rel.startsWith("_shared/")) {
    const rest = rel.slice(rel.startsWith("shared/") ? "shared/".length : "_shared/".length);
    return path.join("src", "app", "shared", withCodeExt(rest));
  }
  return withCodeExt(rel);
}

function stripHbs(p) {
  return p.replace(/\.hbs$/, "");
}

const CODE_EXT = /\.(ts|tsx|js|jsx|html|scss|css|json|vue)$/;
function withCodeExt(p) {
  return CODE_EXT.test(p) ? p : `${p}.ts`;
}

function fallbackRoutes(entities) {
  const lines = entities.map((entity) => {
    const e = augmentForFrontend(entity);
    return `  { path: '${e.urlPath}', loadComponent: () => import('./features/${e.module}/${e.kebabName}/${e.kebabName}.list.component').then(m => m.${e.name}ListComponent), data: { permission: '${e.permissionCode}' } },`;
  });
  return `// Generated by stockpro-backend-generator — do not edit by hand.
import { Routes } from '@angular/router';

export const appRoutes: Routes = [
${lines.join("\n")}
];
`;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node generate-frontend.js <schemaDir> <clientRoot> [--frontend=angular] [--force] [--dry-run]");
    return;
  }
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const frontendArg = args.find((a) => a.startsWith("--frontend="));
  const framework = frontendArg ? frontendArg.split("=")[1] : null;
  const positional = args.filter((a) => !a.startsWith("--"));
  const [schemaInput, clientRoot] = positional;
  if (!schemaInput || !clientRoot || !framework) {
    console.error("Error: <schemaDir> <clientRoot> and --frontend are required.");
    process.exit(1);
  }

  try {
    const templates = loadFrontendTemplates(framework);
    if (!templates) {
      console.warn(`Warning: frontend template pack for '${framework}' not found at ${path.join(TEMPLATES_FRONTEND_DIR, framework)}. Skipping frontend generation.`);
      return;
    }

    const manifestPath = fs.existsSync(path.join(clientRoot, "project.json"))
      ? path.join(clientRoot, "project.json")
      : path.join(clientRoot, "..", "project.json");
    const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf8")) : {};
    const frontendConfig = manifest.frontend || { framework, features: {} };

    validateFrontendManifest(frontendConfig, "frontend");

    const schemas = loadSchemas(schemaInput);
    schemas.forEach(augmentForFrontend);
    validateSchemaSetSafe(schemas);
    const report = { written: 0, skipped: 0, planned: 0 };

    // Globals (app/, environments/, shared/, _shared/, root config files)
    for (const [rel, tpl] of Object.entries(templates)) {
      const isEntityLayer = (FRAMEWORK_LAYERS[framework] || []).some((l) => l.tpl === rel);
      if (isEntityLayer || rel === "routes.fragment.hbs") continue;
      const outPath = path.join(clientRoot, globalOutputPath(rel));
      const content = tpl({ app: manifest, frontend: frontendConfig, entities: schemas });
      writeFile(outPath, content, { force, dryRun }, report);
    }

    // Per-entity layers
    for (const entity of schemas) {
      const e = entity;
      console.log(`\n${e.name} (${e.module})`);
      for (const layer of FRAMEWORK_LAYERS[framework] || []) {
        const tpl = templates[layer.tpl];
        if (!tpl) {
          console.log(`  (missing template ${layer.tpl} — skipped)`);
          continue;
        }
        const content = tpl({ entity: e, app: manifest, frontend: frontendConfig });
        writeFile(path.join(clientRoot, layer.out(e)), content, { force, dryRun }, report);
      }
    }

    // Routes: rely on the framework's own routes template (app/app.routes.hbs or
    // app/routes.tsx.hbs). Emit a minimal fallback only if none was generated.
    const routesOut = framework === "react"
      ? path.join(clientRoot, "src", "app", "routes.tsx")
      : path.join(clientRoot, "src", "app", "app.routes.ts");
    if (!fs.existsSync(routesOut)) {
      writeFile(routesOut, fallbackRoutes(schemas), { force, dryRun }, report);
    }

    console.log(`\nFrontend summary: ${report.written} written, ${report.skipped} skipped, ${report.planned} planned`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function validateSchemaSetSafe(schemas) {
  // Reuse backend validation lightly; missing relation targets are warnings here.
  try {
    const { validateSchemaSet } = require("./validate");
    validateSchemaSet(schemas, { strict: false });
  } catch (e) {
    // non-fatal for frontend; the backend generator enforces strictness
  }
}

if (require.main === module) {
  main();
}

module.exports = { loadFrontendTemplates, augmentForFrontend, fallbackRoutes, main };
