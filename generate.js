#!/usr/bin/env node
/**
 * stockpro backend generator — v0
 *
 * Usage:
 *   node generate.js <schema.json | schemas-dir> <output-dir> [options]
 *
 * Examples:
 *   node generate.js schemas/role.json ./output
 *   node generate.js schemas ./output --force
 *   node generate.js schemas ./output --dry-run
 */
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const validateModule = require("./validate");

Handlebars.registerHelper("eq", (left, right) => left === right);
Handlebars.registerHelper("ne", (left, right) => left !== right);
Handlebars.registerHelper("lowerFirst", (value) => value.charAt(0).toLowerCase() + value.slice(1));
Handlebars.registerHelper("capitalize", (value) => value.charAt(0).toUpperCase() + value.slice(1));
Handlebars.registerHelper("json", (value) => JSON.stringify(value));

const TEMPLATES_DIR = path.join(__dirname, "templates");
const VALID_ID_TYPES = ["UUID", "String", "Long"];
const REQUIRED_ENTITY_FIELDS = [
  "module",
  "name",
  "tableName",
  "idField",
  "idColumn",
  "urlPath",
];

function isValidIdType(value) {
  return VALID_ID_TYPES.includes(value);
}

function getIdTypeDefault(entity) {
  return entity.idType || "UUID";
}

// Maps each template to where its rendered output belongs, relative to
// <output-dir>/src/main/java/com/stockpro/. This mirrors stockpro-yacine's
// existing package layout (entity/dto/repository/service/service.impl/mapper/controller).
const LAYERS = [
  { template: "entity.hbs", outPath: (e) => `entity/${e.module}/${e.name}.java` },
  { template: "dto.hbs", outPath: (e) => `dto/${e.module}/${e.name}DTO.java` },
  { template: "repository.hbs", outPath: (e) => `repository/${e.module}/${e.name}Repository.java` },
  { template: "service.hbs", outPath: (e) => `service/${e.module}/${e.name}Service.java` },
  { template: "service-impl.hbs", outPath: (e) => `service/${e.module}/impl/${e.name}ServiceImpl.java` },
  { template: "mapper.hbs", outPath: (e) => `mapper/${e.module}/${e.name}Mapper.java` },
  { template: "controller.hbs", outPath: (e) => `controller/${e.module}/${e.name}Controller.java` },
];

const FRONTEND_LAYERS = [
  { template: "frontend/angular/app/auth.service.hbs", outPath: () => "client/src/app/core/auth/auth.service.ts" },
  { template: "frontend/angular/app/auth.guard.hbs", outPath: () => "client/src/app/core/auth/auth.guard.ts" },
  { template: "frontend/angular/app/jwt.interceptor.hbs", outPath: () => "client/src/app/core/auth/jwt.interceptor.ts" },
  { template: "frontend/angular/app/permission.guard.hbs", outPath: () => "client/src/app/core/permission/permission.guard.ts" },
  { template: "frontend/angular/app/permission.directive.hbs", outPath: () => "client/src/app/core/permission/permission.directive.ts" },
  { template: "frontend/angular/app/api.interceptor.hbs", outPath: () => "client/src/app/core/api/api.interceptor.ts" },
  { template: "frontend/angular/app/layout.component.hbs", outPath: () => "client/src/app/layout/layout.component.ts" },
  { template: "frontend/angular/app/sidebar.component.hbs", outPath: () => "client/src/app/layout/sidebar.component.ts" },
  { template: "frontend/angular/app/app.routes.hbs", outPath: () => "client/src/app/app.routes.ts" },
  { template: "frontend/angular/app/app.config.hbs", outPath: () => "client/src/app/app.config.ts" },
  { template: "frontend/angular/app/environment.hbs", outPath: () => "client/src/environments/environment.ts" },
  { template: "frontend/angular/app/environment.prod.hbs", outPath: () => "client/src/environments/environment.prod.ts" },
  { template: "frontend/angular/app/i18n.fr.json.hbs", outPath: () => "client/src/assets/i18n/fr.json" },
];

const REACT_FRONTEND_LAYERS = [
  { template: "frontend/react/app/auth.service.hbs", outPath: () => "client/src/app/core/auth/auth.service.ts" },
  { template: "frontend/react/app/auth.guard.hbs", outPath: () => "client/src/app/core/auth/auth.guard.ts" },
  { template: "frontend/react/app/jwt.interceptor.hbs", outPath: () => "client/src/app/core/auth/jwt.interceptor.ts" },
  { template: "frontend/react/app/permission.guard.hbs", outPath: () => "client/src/app/core/permission/permission.guard.ts" },
  { template: "frontend/react/app/permission.directive.hbs", outPath: () => "client/src/app/core/permission/permission.directive.tsx" },
  { template: "frontend/react/app/api.interceptor.hbs", outPath: () => "client/src/app/core/api/api.interceptor.ts" },
  { template: "frontend/react/app/layout.hbs", outPath: () => "client/src/app/layout/Layout.tsx" },
  { template: "frontend/react/app/sidebar.hbs", outPath: () => "client/src/app/layout/Sidebar.tsx" },
  { template: "frontend/react/app/routes.hbs", outPath: () => "client/src/app/app.routes.tsx" },
  { template: "frontend/react/app/environment.hbs", outPath: () => "client/src/environments/environment.ts" },
  { template: "frontend/react/app/i18n.fr.json.hbs", outPath: () => "client/src/assets/i18n/fr.json" },
];

const ANGULAR_ENTITY_LAYERS = [
  { template: "frontend/angular/model.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/${e.name}.model.ts` },
  { template: "frontend/angular/service.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/${e.name}.service.ts` },
  { template: "frontend/angular/list/list.component.ts.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/list/${e.kebabName}-list.component.ts` },
  { template: "frontend/angular/list/list.component.html.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/list/${e.kebabName}-list.component.html` },
  { template: "frontend/angular/list/list.component.scss.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/list/${e.kebabName}-list.component.scss` },
  { template: "frontend/angular/form/form.component.ts.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/form/${e.kebabName}-form.component.ts` },
  { template: "frontend/angular/form/form.component.html.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/form/${e.kebabName}-form.component.html` },
  { template: "frontend/angular/routes.fragment.hbs", outPath: (e) => `client/src/app/features/${e.module}/${e.kebabName}/${e.kebabName}.routes.ts` },
];

function loadTemplates(selectedLayers = [...LAYERS, ...FRONTEND_LAYERS, ...REACT_FRONTEND_LAYERS]) {
  const compiled = {};
  for (const layer of selectedLayers) {
    const raw = fs.readFileSync(path.join(TEMPLATES_DIR, layer.template), "utf8");
    compiled[layer.template] = Handlebars.compile(raw, { noEscape: true });
  }
  return compiled;
}

function toKebabCase(value) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").toLowerCase();
}

function javaTypeToTsType(javaType) {
  return {
    UUID: "string", String: "string", Integer: "number", Long: "number",
    Double: "number", Float: "number", BigDecimal: "number", Boolean: "boolean",
    LocalDate: "string", LocalDateTime: "string",
  }[javaType] || "unknown";
}

function isJavaIdentifier(value) {
  return typeof value === "string" && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function normalizeEntity(entity, source) {
  if (!entity || typeof entity !== "object") {
    throw new Error(`${source}: expected an entity object`);
  }
  for (const field of REQUIRED_ENTITY_FIELDS) {
    if (!entity[field]) {
      throw new Error(`${source}: entity.${field} is required`);
    }
  }
  for (const field of ["name", "module", "idField", "urlPath"]) {
    if (!isJavaIdentifier(entity[field]) && field !== "urlPath") {
      throw new Error(`${source}: entity.${field} is not a valid identifier`);
    }
  }

  const idType = getIdTypeDefault(entity);

  if (!isValidIdType(idType)) {
    throw new Error(`${source}: entity.idType must be one of ${VALID_ID_TYPES.join(", ")}`);
  }

  const normalized = {
    ...entity,
    idType,
    idFieldCap: entity.idFieldCap || capitalize(entity.idField),
    repoVar: entity.repoVar || `${lowerFirst(entity.name)}Repository`,
    serviceVar: entity.serviceVar || `${lowerFirst(entity.name)}Service`,
    fields: entity.fields || [],
    updatableFields: entity.updatableFields || [],
    manyToOne: entity.manyToOne || [],
    oneToMany: entity.oneToMany || [],
    relationIds: entity.relationIds || [],
    customFinders: entity.customFinders || [],
    exportColumns: entity.exportColumns || [],
    kebabName: entity.kebabName || toKebabCase(entity.name),
    tsType: entity.tsType || javaTypeToTsType(entity.idType || "UUID"),
  };

  normalized.kebabName = toKebabCase(normalized.name);
  normalized.fields = normalized.fields.map((field) => ({
    ...field,
    tsType: field.tsType || javaTypeToTsType(field.javaType),
    validationRules: [
      field.required ? "Validators.required" : null,
      field.email ? "Validators.email" : null,
      field.minLength ? `Validators.minLength(${field.minLength})` : null,
      field.maxLength ? `Validators.maxLength(${field.maxLength})` : null,
    ].filter(Boolean),
  }));

  normalized.hasValidation = normalized.fields.some((field) =>
    field.required || field.email || field.minLength || field.maxLength
  );
  normalized.hasWriteOnlyField = normalized.fields.some((field) => field.writeOnly);
  normalized.hasOneToMany = normalized.oneToMany.length > 0;
  normalized.hasManyToOne = normalized.manyToOne.length > 0;
  normalized.needsLocalDate = normalized.fields.some((field) =>
    ["LocalDate", "LocalDateTime"].includes(field.javaType)
  );
  normalized.needsPage = entity.features?.pagination !== false;
  const securityLevel = entity.securityLevel || "medium";
  const securityOperations = {
    low: ["consultation"],
    medium: ["consultation", "ajout", "modification"],
    high: ["consultation", "export", "ajout", "modification", "suppression"],
  }[securityLevel];
  if (!securityOperations) {
    throw new Error(`${source}: securityLevel must be low, medium, or high`);
  }
  normalized.securityLevel = securityLevel;
  normalized.securityOperations = Object.fromEntries(
    ["consultation", "export", "ajout", "modification", "suppression"]
      .map((operation) => [operation, securityOperations.includes(operation)])
  );
  normalized.features = {
    pagination: normalized.needsPage,
    export: entity.features?.export !== false && normalized.exportColumns.length > 0,
    search: entity.features?.search !== false,
    security: entity.features?.security !== false,
    validation: normalized.hasValidation,
  };

  normalized.needsUuidImport =
    normalized.idType === "UUID" ||
    normalized.manyToOne.some((r) => r.targetIdType === "UUID") ||
    normalized.relationIds.some((r) => r.targetIdType === "UUID");

  for (const field of normalized.fields) {
    if (!isJavaIdentifier(field.name)) {
      throw new Error(`${source}: invalid field name '${field.name}'`);
    }
    field.nameCap = field.nameCap || capitalize(field.name);
  }
  for (const relation of normalized.manyToOne) {
    if (!relation.target || !relation.fieldName || !relation.joinColumn) {
      throw new Error(`${source}: every manyToOne relation needs target, fieldName, and joinColumn`);
    }
    relation.fieldNameCap = relation.fieldNameCap || capitalize(relation.fieldName);
    relation.targetModule = relation.targetModule || normalized.module;
    relation.targetIdField = relation.targetIdField || "id";
    relation.targetIdFieldCap = relation.targetIdFieldCap || capitalize(relation.targetIdField);
    relation.targetIdType = relation.targetIdType || "UUID";
    relation.tsType = relation.tsType || javaTypeToTsType(relation.targetIdType);
    relation.idFieldName = `${relation.fieldName}Id`;
    relation.idOptional = relation.nullable !== false;
    if (!VALID_ID_TYPES.includes(relation.targetIdType)) {
      throw new Error(`${source}: relation '${relation.fieldName}' targetIdType must be one of ${VALID_ID_TYPES.join(", ")}`);
    }
  }
  normalized.manyToOneImports = [];
  normalized.manyToOneRepoImports = [];
  for (const relation of normalized.manyToOne) {
    if (relation.targetModule !== normalized.module && !normalized.manyToOneImports.find((r) => r.module === relation.targetModule && r.name === relation.target)) {
      normalized.manyToOneImports.push({ module: relation.targetModule, name: relation.target });
    }
    if (!normalized.manyToOneRepoImports.find((r) => r.module === relation.targetModule && r.name === relation.target)) {
      normalized.manyToOneRepoImports.push({ module: relation.targetModule, name: relation.target });
    }
  }
  for (const relation of normalized.relationIds) {
    if (!relation.target || !relation.fieldName || !relation.targetIdField) {
      throw new Error(`${source}: every relationIds entry needs target, fieldName, and targetIdField`);
    }
    relation.fieldNameCap = relation.fieldNameCap || capitalize(relation.fieldName);
    relation.targetIdFieldCap = relation.targetIdFieldCap || capitalize(relation.targetIdField);
    relation.targetIdType = relation.targetIdType || "UUID";
    if (!VALID_ID_TYPES.includes(relation.targetIdType)) {
      throw new Error(`${source}: relationIds '${relation.fieldName}' targetIdType must be one of ${VALID_ID_TYPES.join(", ")}`);
    }
  }
  normalized.customFinderEntityImports = [];
  for (const finder of normalized.customFinders) {
    const matches = (finder.returnType || "").match(/[A-Z][A-Za-z0-9]*/g) || [];
    for (const className of matches) {
      if (className === normalized.name) continue;
      if (!normalized.customFinderEntityImports.includes(className)) {
        normalized.customFinderEntityImports.push(className);
      }
    }
  }
  return normalized;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function lowerFirst(value) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function loadSchemas(inputPath) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Schema input does not exist: ${inputPath}`);
  }
  const stat = fs.statSync(inputPath);
  const files = stat.isDirectory()
    ? fs.readdirSync(inputPath).filter((f) => f.endsWith(".json")).sort().map((f) => path.join(inputPath, f))
    : [inputPath];

  return files.map((file) => {
    let schema;
    try {
      schema = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
      throw new Error(`${file}: invalid JSON (${error.message})`);
    }
    return normalizeEntity(schema.entity, file);
  });
}

function validateSchemaSet(entities, options = {}) {
  return validateModule.validateSchemaSet(entities, options);
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

function generateEntity(entity, compiled, outputRoot, options, report) {
  const javaRoot = path.join(outputRoot, "src/main/java/com/stockpro");
  console.log(`\n${entity.name} (${entity.module})`);
  for (const layer of LAYERS) {
    const render = compiled[layer.template];
    const content = render({ entity });
    const outFile = path.join(javaRoot, layer.outPath(entity));
    writeFile(outFile, content, options, report);
  }
}

function generateFrontendEntity(entity, compiled, outputRoot, options, report) {
  console.log(`\n${entity.name} frontend (${entity.module})`);
  for (const layer of ANGULAR_ENTITY_LAYERS) {
    const content = compiled[layer.template]({ entity });
    writeFile(path.join(outputRoot, layer.outPath(entity)), content, options, report);
  }
}

function generateFrontend(entities, compiled, outputRoot, options, report, framework) {
  const layers = framework === "react" ? REACT_FRONTEND_LAYERS : FRONTEND_LAYERS;
  const frontend = {
    securityOperations: {
      low: { consultation: true, export: false, ajout: false, modification: false, suppression: false },
      medium: { consultation: true, export: false, ajout: true, modification: true, suppression: false },
      high: { consultation: true, export: true, ajout: true, modification: true, suppression: true },
    }
  };
  const i18n = {};
  for (const entity of entities) {
    i18n[entity.kebabName] = entity.tagLabel;
    for (const column of entity.exportColumns) {
      i18n[`${entity.kebabName}.${lowerFirst(column.nameCap)}`] = column.label;
    }
  }
  const context = { entities, entity: entities[0], apiUrl: "http://localhost:8080/api", i18n, frontend };
  console.log(`\nFrontend app (${framework})`);
  for (const layer of layers) {
    const content = compiled[layer.template](context);
    writeFile(path.join(outputRoot, layer.outPath(entities[0])), content, options, report);
  }
}

function printHelp() {
  console.log(`Usage: node generate.js <schema.json | schemas-dir> <output-dir> [options]

Options:
  --force     overwrite existing generated files
  --dry-run   show planned files without writing them
  --verbose   print additional generation details
  --strict-relations  fail when a relation target is not in the input set
  --targets=<backend|frontend|all>  select generated targets (default: backend)
  --frontend=<angular|react>  frontend template set
  --help      show this help`);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }
  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const verbose = args.includes("--verbose");
  const strictRelations = args.includes("--strict-relations");
  const targetsArg = args.find((arg) => arg.startsWith("--targets="));
  const targets = targetsArg ? targetsArg.slice("--targets=".length) : "backend";
  const frontend = args.find((arg) => arg.startsWith("--frontend="))?.slice("--frontend=".length);
  const positional = args.filter((a) => !a.startsWith("--"));
  const [schemaInput, outputDir] = positional;

  if (!schemaInput || !outputDir) {
    printHelp();
    process.exit(1);
  }
  if (!["backend", "frontend", "all"].includes(targets)) {
    console.error(`Error: unsupported targets '${targets}'`);
    process.exit(1);
  }
  if (targets !== "backend" && !["angular", "react"].includes(frontend)) {
    console.error("Error: --frontend=angular or --frontend=react is required for frontend generation");
    process.exit(1);
  }

  try {
    const templateLayers = targets === "backend"
      ? LAYERS
      : targets === "frontend"
        ? (frontend === "angular" ? ANGULAR_ENTITY_LAYERS : REACT_FRONTEND_LAYERS)
        : [...LAYERS, ...(frontend === "angular" ? ANGULAR_ENTITY_LAYERS : REACT_FRONTEND_LAYERS)];
    const compiled = loadTemplates(templateLayers);
    const schemas = loadSchemas(schemaInput);
    const names = new Set();
    const report = { written: 0, skipped: 0, planned: 0 };

    const warnings = validateSchemaSet(schemas, { strict: strictRelations });
    for (const warning of warnings) console.warn(`Warning: ${warning}`);

    for (const entity of schemas) {
      const key = `${entity.module}.${entity.name}`;
      if (names.has(key)) {
        throw new Error(`Duplicate entity: ${key}`);
      }
      names.add(key);
      if (verbose) console.log(`Features: ${JSON.stringify(entity.features)}`);
      if (targets === "backend" || targets === "all") {
        generateEntity(entity, compiled, outputDir, { force, dryRun }, report);
      }
    }
    if (targets === "frontend" || targets === "all") {
      if (frontend === "angular") {
        for (const entity of schemas) {
          generateFrontendEntity(entity, compiled, outputDir, { force, dryRun }, report);
        }
      } else {
        generateFrontend(schemas, compiled, outputDir, { force, dryRun }, report, frontend);
      }
    }
    console.log(`\nSummary: ${report.written} written, ${report.skipped} skipped, ${report.planned} planned`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  loadSchemas,
  normalizeEntity,
  validateSchemaSet,
  validateEntitySchema: validateModule.validateEntitySchema,
  generateEntity,
};
