#!/usr/bin/env node
/**
 * Frontend generator for the StockPro backend generator.
 *
 * Produces a runnable frontend client from an entity schema set and a "template
 * pack". A template pack is a single self-contained .spack ZIP that fully
 * describes the desired UI/shape/design — so the frontend is fully decoupled
 * from this generator. Packs are produced by tools/pack-frontend.js (or any
 * equivalent template generator that emits a .spack archive).
 *
 * A pack contains:
 *   - project files copied verbatim into the generated client,
 *   - one or more Handlebars templates (*.hbs) rendered against the schemas
 *     (the rendered file's path drops the .hbs suffix),
 *   - a root pack.json manifest.
 *
 * Usage:
 *   node generate-frontend.js <schemaDir> <clientRoot> [--frontend=next]
 *        [--frontend-template=<file.spack>] [--force]
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const Handlebars = require("handlebars");
const { loadSchemas } = require("./generate");
const { validateFrontendManifest } = require("./validate");
const { readZip } = require("./lib/zip");

const ROOT = __dirname;
const TEMPLATES_FRONTEND_DIR = path.join(ROOT, "templates", "frontend");
const DEFAULT_PACK = path.join(TEMPLATES_FRONTEND_DIR, "packs", "next-tailwind.spack");

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

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function augmentForFrontend(entity) {
  const e = entity;
  e.idTsType = e.idType === "Long" ? "number" : "string";
  e.kebabName = kebab(e.name);
  e.label = e.tagLabel || `${e.name}s`;
  e.permissionCode =
    e.permissionCode ||
    `ADMIN_${e.name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`;
  for (const field of e.fields || []) {
    field.tsType = tsType(field.javaType);
    field.label = field.label || capitalize(field.name);
  }
  for (const rel of e.manyToOne || []) {
    rel.tsIdType = rel.targetIdType === "Long" ? "number" : "string";
  }
  for (const rel of e.relationIds || []) {
    rel.tsIdType = rel.targetIdType === "Long" ? "number" : "string";
  }
  return e;
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function stagedTemplates(packFiles, packJson, data) {
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), "spack-"));
  for (const rel of Object.keys(packFiles)) {
    if (rel === "pack.json") continue;
    if (rel.endsWith(".hbs")) continue;
    const out = path.join(staging, rel.split("/").join(path.sep));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, packFiles[rel]);
  }
  const templates = Array.isArray(packJson.templates) ? packJson.templates : [];
  for (const rel of templates) {
    const content = packFiles[rel];
    if (content === undefined) {
      throw new Error(`Template pack declares '${rel}' but the file is missing`);
    }
    const src = Handlebars.compile(content.toString("utf8"), { noEscape: true });
    const outRel = rel.endsWith(".hbs") ? rel.slice(0, -".hbs".length) : rel;
    const out = path.join(staging, outRel.split("/").join(path.sep));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, src(data));
  }
  return staging;
}

function loadPack(packPath) {
  if (!fs.existsSync(packPath)) {
    throw new Error(`Template pack not found: ${packPath}`);
  }
  const packFiles = readZip(fs.readFileSync(packPath));
  if (!packFiles["pack.json"]) {
    throw new Error(`Template pack '${packPath}' has no pack.json manifest`);
  }
  const packJson = JSON.parse(packFiles["pack.json"].toString("utf8"));
  return { packFiles, packJson };
}

function normalizeFrontendConfig(manifest) {
  const frontendConfig = manifest.frontend || {};
  const defaults = {
    framework: "next",
    uiLibrary: "tailwind",
    state: "zustand",
    features: {
      pagination: true,
      search: true,
      filtering: true,
      export: true,
      i18n: true,
      theming: true,
    },
  };
  for (const key of Object.keys(defaults)) {
    if (frontendConfig[key] === undefined) frontendConfig[key] = defaults[key];
  }
  if (typeof frontendConfig.features !== "object" || frontendConfig.features === null) {
    frontendConfig.features = defaults.features;
  }
  return frontendConfig;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(
      "Usage: node generate-frontend.js <schemaDir> <clientRoot> [--frontend=next] [--frontend-template=<file.spack>] [--force]"
    );
    return;
  }
  const frontendArg = args.find((a) => a.startsWith("--frontend="));
  const framework = frontendArg ? frontendArg.split("=")[1] : "next";
  const templateArg = args.find((a) => a.startsWith("--frontend-template="));
  const positional = args.filter((a) => !a.startsWith("--"));
  const [schemaInput, clientRoot] = positional;
  if (!schemaInput || !clientRoot) {
    console.error("Error: <schemaDir> and <clientRoot> are required.");
    process.exit(1);
  }
  if (framework !== "next") {
    console.error("Error: only --frontend=next is supported by this generator.");
    process.exit(1);
  }

  try {
    const manifestPath = fs.existsSync(path.join(clientRoot, "project.json"))
      ? path.join(clientRoot, "project.json")
      : path.join(clientRoot, "..", "project.json");
    const manifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
      : {};
    const frontendConfig = normalizeFrontendConfig(manifest);
    validateFrontendManifest(frontendConfig, "frontend");

    const packPath = templateArg
      ? templateArg.split("=")[1]
      : (frontendConfig.templatePath || DEFAULT_PACK);
    const { packFiles, packJson } = loadPack(packPath);

    const schemas = loadSchemas(schemaInput);
    schemas.forEach(augmentForFrontend);

    const staging = stagedTemplates(packFiles, packJson, { entities: schemas });
    console.log(`\nFrontend scaffold (${packJson.name || "template"}) -> ${clientRoot}`);
    copyDir(staging, clientRoot);
    fs.rmSync(staging, { recursive: true, force: true });

    console.log(`\nFrontend summary: ${schemas.length} entities registered from pack '${packPath}'.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { augmentForFrontend, kebab, tsType, loadPack, normalizeFrontendConfig, stagedTemplates, main };

if (require.main === module) {
  main();
}
