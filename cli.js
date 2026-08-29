#!/usr/bin/env node
/**
 * StockPro backend generator — interactive wizard
 *
 * Collects the complete application model, persists it as project.json plus
 * ordered per-entity schema files, then delegates generation to generate.js.
 *
 * Usage: npm run wizard
 */
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { spawnSync } = require("node:child_process");

const root = __dirname;
const VALID_ID_TYPES = ["UUID", "String", "Long"];
const SECURITY_LEVELS = ["low", "medium", "high"];
const AUTH_TYPES = ["jwt", "session", "none"];
const APP_TYPES = ["REST API", "Web application", "Microservice"];
const BUILD_TOOLS = ["maven", "gradle"];
const DB_TYPES = ["postgresql", "mysql", "h2", "oracle"];
const TARGETS = ["backend", "frontend", "both"];
const FRAMEWORKS = ["angular", "react", "vue"];
const FRONTEND_BUILD_TOOLS = { angular: ["angular-cli", "vite"], react: ["vite"], vue: ["vite", "vue-cli"] };
const UI_LIBRARIES = { angular: ["primeng", "angular-material"], react: ["antd", "mui"], vue: ["vuetify", "element-plus"] };
const STATE_LIBS = { angular: ["signals", "ngrx"], react: ["tanstack-query", "redux"], vue: ["pinia", "vuex"] };

function askInterface() {
  if (!process.stdin.isTTY) {
    const answers = fs.readFileSync(0, "utf8").split(/\r?\n/);
    let index = 0;
    return {
      question(prompt, callback) {
        if (index >= answers.length) {
          throw new Error("Entrée interactive insuffisante (fin de fichier atteinte).");
        }
        process.stdout.write(prompt);
        callback(answers[index++] || "");
      },
      close() {},
    };
  }
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, label, defaultValue = "") {
  const suffix = defaultValue ? ` [${defaultValue}]` : "";
  return new Promise((resolve) =>
    rl.question(`  ${label}${suffix}: `, (answer) => resolve((answer.trim() || defaultValue)))
  );
}

function askBool(rl, label, defaultValue = true) {
  const def = defaultValue ? "Y/n" : "y/N";
  return new Promise((resolve) =>
    rl.question(`  ${label} (${def}): `, (answer) => {
      const v = answer.trim().toLowerCase();
      if (v === "") return resolve(defaultValue);
      if (v === "y" || v === "yes" || v === "o" || v === "oui") return resolve(true);
      return resolve(false);
    })
  );
}

function choose(rl, label, options, defaultValueIndex = 0) {
  const defaultVal = options[defaultValueIndex];
  const prompt = `  ${label} (${options.map((o, i) => (i === defaultValueIndex ? o : o)).join(" / ")}): `;
  return new Promise((resolve) => {
    const loop = () => {
      rl.question(prompt, (answer) => {
        const v = answer.trim();
        if (v === "" ) return resolve(defaultVal);
        const idx = options.findIndex((o) => o.toLowerCase() === v.toLowerCase());
        if (idx >= 0) return resolve(options[idx]);
        console.log(`    Choix invalide. Options: ${options.join(", ")}`);
        loop();
      });
    };
    loop();
  });
}

function toPascalCase(value) {
  return value
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function toCamelCase(value) {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeUpper(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}

function validCount(value) {
  const count = Number(value);
  return Number.isInteger(count) && count > 0 && count <= 200;
}

function validJavaIdentifier(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

async function collectFeatures(rl) {
  console.log("\nFonctionnalités:");
  const pagination = await askBool(rl, "Pagination", true);
  const search = await askBool(rl, "Recherche", true);
  const filtering = await askBool(rl, "Filtrage", true);
  const exportEnabled = await askBool(rl, "Export (Excel)", true);
  const auditFields = await askBool(rl, "Champs d'audit (date création/modification)", false);
  const softDelete = await askBool(rl, "Suppression logique (soft delete)", false);
  const apiDocs = await askBool(rl, "Documentation API (Swagger)", true);
  return { pagination, search, filtering, export: exportEnabled, auditFields, softDelete, apiDocumentation: apiDocs };
}

async function collectSecurity(rl) {
  console.log("\nSécurité:");
  const level = await choose(rl, "Niveau de sécurité", SECURITY_LEVELS, 1);
  const authType = await choose(rl, "Type d'authentification", AUTH_TYPES, 0);
  const methodSecurity = await askBool(rl, "Sécurité au niveau des méthodes (PreAuthorize)", true);
  const prefix = await ask(rl, "Préfixe des codes de permission", "ADMIN");
  return { level, authenticationType: authType, methodSecurity, permissionPrefix: prefix };
}

async function collectFrontend(rl) {
  console.log("\nFrontend:");
  const framework = await choose(rl, "Framework", FRAMEWORKS, 0);
  const frontendBuildTool = await choose(rl, "Outil de build du frontend", FRONTEND_BUILD_TOOLS[framework], 0);
  const uiLibrary = await choose(rl, "Bibliothèque UI", UI_LIBRARIES[framework], 0);
  const state = await choose(rl, "Gestion d'état / données", STATE_LIBS[framework], 0);
  const i18n = await askBool(rl, "Internationalisation (i18n)", true);
  const theming = await askBool(rl, "Thème clair/sombre", true);
  return {
    framework,
    buildTool: frontendBuildTool,
    uiLibrary,
    state,
    features: {
      pagination: true,
      search: true,
      filtering: true,
      export: true,
      i18n,
      theming,
    },
  };
}

async function collectFields(rl, entityName) {
  const fields = [];
  console.log(`\nChamps de l'entité ${entityName} (ligne vide pour terminer):`);
  while (true) {
    const name = await ask(rl, "  Nom du champ (vide pour finir)");
    if (!name) break;
    if (!validJavaIdentifier(name)) {
      console.log("    Identifiant Java invalide.");
      continue;
    }
    const javaType = await choose(
      rl,
      `  Type de '${name}'`,
      ["String", "Long", "Integer", "Boolean", "LocalDate", "LocalDateTime", "Double", "BigDecimal"],
      0
    );
    const required = await askBool(rl, `  '${name}' obligatoire`, false);
    const unique = await askBool(rl, `  '${name}' unique`, false);
    const field = {
      name,
      nameCap: toPascalCase(name),
      columnName: toSnakeUpper(name),
      javaType,
    };
    if (javaType === "String") {
      const length = await ask(rl, `  Longueur max de '${name}'`, "255");
      field.length = Number(length) || 255;
    }
    if (required) {
      field.required = true;
      field.errorMessage = `Le champ ${name} est obligatoire`;
    }
    if (unique) field.unique = true;
    const writeOnly = await askBool(rl, `  '${name}' en écriture seule (ex: mot de passe)`, false);
    if (writeOnly) field.writeOnly = true;
    fields.push(field);
  }
  return fields;
}

async function collectRelations(rl, entityName, allEntityNames) {
  const manyToOne = [];
  const oneToMany = [];
  console.log(`\nRelations de l'entité ${entityName} (ligne vide pour terminer):`);
  while (true) {
    const target = await ask(rl, "  Relation many-to-one vers (vide pour finir, 'done' pour relations one-to-many)");
    if (target === "done") break;
    if (!target) break;
    const targetPascal = toPascalCase(target);
    if (!validJavaIdentifier(targetPascal)) {
      console.log("    Nom de cible invalide.");
      continue;
    }
    const fieldName = await ask(rl, `  Nom du champ relation (défaut: ${toCamelCase(targetPascal)})`, toCamelCase(targetPascal));
    const joinColumn = await ask(rl, `  Colonne de jointure (défaut: ${toSnakeUpper(targetPascal) + "_ID"})`, toSnakeUpper(targetPascal) + "_ID");
    const nullable = await askBool(rl, "  Relation nullable", false);
    const cascade = await choose(rl, "  Comportement cascade", ["PERSIST", "ALL", "NONE"], 0);
    const orphanRemoval = await askBool(rl, "  Suppression orpheline (orphanRemoval)", false);
    manyToOne.push({
      relationName: `${entityName}_${targetPascal}`,
      target: targetPascal,
      targetModule: "security",
      fieldName,
      joinColumn,
      nullable,
      cascade: cascade === "NONE" ? undefined : cascade,
      orphanRemoval,
    });
  }
  console.log(`\nRelations one-to-many de l'entité ${entityName} (ligne vide pour finir):`);
  while (true) {
    const target = await ask(rl, "  Relation one-to-many vers (vide pour finir)");
    if (!target) break;
    const targetPascal = toPascalCase(target);
    if (!validJavaIdentifier(targetPascal)) {
      console.log("    Nom de cible invalide.");
      continue;
    }
    const fieldName = await ask(rl, `  Nom du champ collection (défaut: ${toCamelCase(targetPascal)}s)`, toCamelCase(targetPascal) + "s");
    const mappedBy = await ask(rl, "  Attribut 'mappedBy' (champ dans la cible qui pointe vers cette entité)", toCamelCase(entityName));
    const orphanRemoval = await askBool(rl, "  Suppression orpheline (orphanRemoval)", false);
    oneToMany.push({
      relationName: `${entityName}_${targetPascal}`,
      target: targetPascal,
      targetModule: "security",
      fieldName,
      mappedBy,
      orphanRemoval,
    });
  }
  return { manyToOne, oneToMany };
}

async function runWizard() {
  const rl = askInterface();
  console.log("\nStockPro Backend Generator — Assistant interactif");
  console.log("====================================================");
  console.log("Cet assistant enregistre le modèle complet de l'application puis génère le backend.\n");

  const appName = await ask(rl, "Nom de l'application", "StockPro");
  const appType = await choose(rl, "Type d'application", APP_TYPES, 0);
  const basePackage = await ask(rl, "Package Java de base", "com.stockpro");
  const outputDir = await ask(rl, "Répertoire de sortie", "generated-app");
  const database = await choose(rl, "Type de base de données", DB_TYPES, 0);
  const buildTool = await choose(rl, "Outil de build", BUILD_TOOLS, 0);
  const javaVersion = await ask(rl, "Version Java", "17");
  const springBootVersion = await ask(rl, "Version Spring Boot", "3.2.0");

  const target = await choose(rl, "Cible de génération", TARGETS, 2);
  const features = await collectFeatures(rl);
  const security = await collectSecurity(rl);

  let frontend = null;
  if (target !== "backend") {
    frontend = await collectFrontend(rl);
  }

  let countAnswer = await ask(rl, "Nombre d'entités", "1");
  while (!validCount(countAnswer)) countAnswer = await ask(rl, "Entrez un nombre de 1 à 200", "1");
  const count = Number(countAnswer);
  const entities = [];
  const names = new Set();

  console.log("\nLes entités sont collectées dans l'ordre de génération.\n");
  for (let index = 0; index < count; index += 1) {
    let name = "";
    while (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name) || names.has(name)) {
      name = toPascalCase(await ask(rl, `Entité ${index + 1} — nom (ex: User)`, ""));
      if (!name || !/^[A-Z][A-Za-z0-9]*$/.test(name) || names.has(name)) {
        console.log("    Utilisez un nom de classe Java unique, ex: User ou UserSite.");
      }
    }
    names.add(name);
    const module = toCamelCase(await ask(rl, `${name} — module (package)`, "administration"));
    const tableName = await ask(rl, `${name} — table`, toSnakeUpper(name));
    const idType = await choose(rl, `${name} — type d'identifiant`, VALID_ID_TYPES, 0);
    const idField = await ask(rl, `${name} — nom du champ id`, "id");
    const idColumn = await ask(rl, `${name} — colonne id`, toSnakeUpper(name) + "_ID");
    const serviceDescription = await ask(rl, `${name} — description du service`, `${name} management`);
    const urlPath = await ask(rl, `${name} — chemin URL`, toCamelCase(name).replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() + "s");
    const permissionCode = `${security.permissionPrefix}_${name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`;

    const fields = await collectFields(rl, name);
    const { manyToOne, oneToMany } = await collectRelations(rl, name, [...names]);

    const updatableFields = fields
      .filter((f) => !(f.name === idField))
      .map((f) => ({ nameCap: f.nameCap }));
    const exportColumns = fields.map((f) => ({ nameCap: f.nameCap, label: f.name }));
    const hasValidation = fields.some((f) => f.required);
    const needsLocalDate = fields.some((f) => f.javaType === "LocalDate" || f.javaType === "LocalDateTime");

    entities.push({
      module,
      name,
      tableName,
      idField,
      idFieldCap: toPascalCase(idField),
      idColumn,
      idType,
      repoVar: `${toCamelCase(name)}Repository`,
      serviceVar: `${toCamelCase(name)}Service`,
      urlPath,
      tagLabel: `${name}s`,
      tagLabelLower: `${toCamelCase(name)}s`,
      permissionCode,
      filterKey: name.toUpperCase(),
      defaultSortField: idField,
      securityLevel: security.level,
      serviceDescription,
      features: {
        pagination: features.pagination,
        search: features.search,
        filtering: features.filtering,
        export: features.export,
        security: security.methodSecurity,
        validation: hasValidation,
      },
      fields,
      updatableFields,
      manyToOne,
      oneToMany,
      relationIds: [],
      customFinders: [],
      exportColumns,
    });
  }
  rl.close();

  const absoluteOutput = path.resolve(outputDir);
  const schemaDir = path.join(absoluteOutput, "schemas");
  fs.mkdirSync(schemaDir, { recursive: true });
  const targets = target === "both" ? ["backend", "frontend"] : [target];
  const serverRoot = target === "frontend" ? null : path.join(absoluteOutput, target === "both" ? "server" : "");
  const clientRoot = target === "backend" ? null : path.join(absoluteOutput, target === "both" ? "client" : "");
  const manifest = {
    targets,
    appName,
    appType,
    basePackage,
    outputDir,
    database,
    buildTool,
    javaVersion,
    springBootVersion,
    security: {
      level: security.level,
      authenticationType: security.authenticationType,
      methodSecurity: security.methodSecurity,
      permissionPrefix: security.permissionPrefix,
    },
    features,
    frontend: frontend || undefined,
    entityCount: entities.length,
    entityOrder: entities.map((e) => e.name),
    generationOrder: entities.map((e) => e.name),
    schemaVersion: "1.0.0",
    createdAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(absoluteOutput, "project.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  entities.forEach((entity, index) => {
    const fileName = `${String(index + 1).padStart(3, "0")}-${entity.name}.json`;
    fs.writeFileSync(path.join(schemaDir, fileName), `${JSON.stringify({ entity }, null, 2)}\n`);
  });

  console.log(`\nModèle enregistré dans ${absoluteOutput}`);
  if (serverRoot) {
    const backendResult = spawnSync(process.execPath, [path.join(root, "generate.js"), schemaDir, serverRoot, "--strict-relations"], { stdio: "inherit" });
    if (backendResult.status !== 0) throw new Error("La génération du backend a échoué; consultez les messages ci-dessus.");
  }
  if (clientRoot) {
    const frontendResult = spawnSync(process.execPath, [path.join(root, "generate-frontend.js"), schemaDir, clientRoot, `--frontend=${frontend.framework}`], { stdio: "inherit" });
    if (frontendResult.status !== 0) throw new Error("La génération du frontend a échoué; consultez les messages ci-dessus.");
  }
  console.log("\nGénération terminée. Vérifiez avec:");
  console.log(`  npm run test-app -- ${absoluteOutput}`);
}

runWizard().catch((error) => {
  console.error(`\nErreur: ${error.message}`);
  process.exitCode = 1;
});
