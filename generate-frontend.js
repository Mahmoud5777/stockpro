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
const { validateFrontendManifest, validateSchemaSet } = require("./validate");
const { readZip } = require("./lib/zip");
const { parseArgs } = require("./lib/args");

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
    field.inputType = field.writeOnly ? "password" : field.email ? "email" :
      field.javaType === "LocalDate" ? "date" : field.javaType === "LocalDateTime" ? "datetime-local" :
      field.tsType === "number" ? "number" : field.tsType === "boolean" ? "checkbox" : "text";
  }
  for (const rel of e.manyToOne || []) {
    rel.tsIdType = rel.targetIdType === "Long" ? "number" : "string";
  }
  for (const rel of e.relationIds || []) {
    rel.tsIdType = rel.targetIdType === "Long" ? "number" : "string";
  }
  return e;
}

function copyDir(src, dest, force = false, dryRun = false) {
  if (!dryRun) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, force, dryRun);
    } else {
      if (fs.existsSync(d) && !force) { console.log(`skip ${d} (use --force to overwrite)`); continue; }
      if (dryRun) { console.log(`write ${d}`); continue; }
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function stagedTemplates(packFiles, packJson, data) {
  const safePath = (rel) => {
    if (typeof rel !== "string" || !rel || rel.includes("\\") || rel.includes(":") || rel.startsWith("/") || rel.split("/").some((part) => part === ".." || part === "." || !part)) {
      throw new Error(`Unsafe template pack path: ${rel}`);
    }
    return rel;
  };
  Object.keys(packFiles).forEach(safePath);
  const templates = Array.isArray(packJson.templates) ? packJson.templates : [];
  templates.forEach(safePath);
  for (const rel of Object.keys(packFiles).filter((file) => file.endsWith(".hbs"))) {
    if (!templates.includes(rel)) throw new Error(`Unregistered template: ${rel}`);
  }
  for (const rel of templates) {
    if (packFiles[rel] === undefined) throw new Error(`Template pack declares '${rel}' but the file is missing`);
  }
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), "spack-"));
  try {
  for (const rel of Object.keys(packFiles)) {
    if (rel === "pack.json") continue;
    if (rel.endsWith(".hbs")) continue;
    const out = path.join(staging, rel.split("/").join(path.sep));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, packFiles[rel]);
  }
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
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

function frontendDescriptor(entity, entities) {
  const relations = [...(entity.manyToOne || []), ...(entity.relationIds || [])].map((rel) => {
    const target = entities.find((candidate) => candidate.name === rel.target && (!rel.targetModule || candidate.module === rel.targetModule));
    if (!target) throw new Error(`Missing frontend relation target: ${rel.target}`);
    return { name: rel.idFieldName || `${rel.fieldName}Id`, label: capitalize(rel.fieldName),
      type: target.idTsType, inputType: "select", required: rel.nullable === false,
      relation: { urlPath: target.urlPath, idField: target.idField, paginated: target.features.pagination,
        labelField: target.fields.find((field) => field.tsType === "string" && !field.writeOnly)?.name || target.idField } };
  });
  return { name: entity.name, module: entity.module, kebab: entity.kebabName,
    idField: entity.idField, urlPath: entity.urlPath, label: entity.label, permissionCode: entity.permissionCode,
    features: entity.features, operations: entity.securityOperations,
    fields: [...entity.fields.map((field) => ({ name: field.name, label: field.label, type: field.tsType,
      inputType: field.inputType, required: !!field.required, writeOnly: !!field.writeOnly,
      minLength: field.minLength, maxLength: field.maxLength || field.length, email: !!field.email,
      errorMessage: field.errorMessage })), ...relations] };
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
      "Usage: node generate-frontend.js <schemaDir> <clientRoot> [--frontend=next] [--frontend-template=<file.spack>] [--force] [--dry-run]"
    );
    return;
  }
  const { options, positional } = parseArgs(args, ["frontend", "frontend-template"]);
  const framework = options.frontend || "next";
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

    const packPath = options["frontend-template"] || frontendConfig.templatePath || DEFAULT_PACK;
    const { packFiles, packJson } = loadPack(packPath);

    if (packJson.framework !== framework) throw new Error(`Pack framework '${packJson.framework}' does not match '${framework}'`);
    const schemas = loadSchemas(schemaInput);
    validateSchemaSet(schemas, { strict: true });
    schemas.forEach(augmentForFrontend);
    const routes = new Set(["dashboard", "login", "api"]);
    for (const entity of schemas) {
      if (routes.has(entity.kebabName)) throw new Error(`Frontend route '${entity.kebabName}' is reserved or duplicated`);
      routes.add(entity.kebabName);
    }

    const descriptors = schemas.map((entity) => frontendDescriptor(entity, schemas));
    const app = { name: manifest.appName || "StockPro", theming: frontendConfig.features.theming ?? frontendConfig.features.darkMode ?? false };
    const staging = stagedTemplates(packFiles, packJson, { entities: schemas, project: manifest, frontend: frontendConfig,
      registryJson: JSON.stringify(descriptors, null, 2), appJson: JSON.stringify(app) });
    console.log(`\nFrontend scaffold (${packJson.name || "template"}) -> ${clientRoot}`);
    try { copyDir(staging, clientRoot, args.includes("--force"), args.includes("--dry-run")); }
    finally { fs.rmSync(staging, { recursive: true, force: true }); }

    console.log(`\nFrontend summary: ${schemas.length} entities registered from pack '${packPath}'.`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { augmentForFrontend, frontendDescriptor, kebab, tsType, loadPack, normalizeFrontendConfig, stagedTemplates, main };

if (require.main === module) {
  main();
}
