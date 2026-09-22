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
const { isCoreEntityName } = require("./generate");

const root = __dirname;
const IS_TTY = Boolean(process.stdin.isTTY);
const CLI_ARGS = process.argv.slice(2);
function cliFlag(name) {
  const hit = CLI_ARGS.find((a) => a === name || a.startsWith(`${name}=`));
  if (!hit) return undefined;
  const eq = hit.indexOf("=");
  return eq === -1 ? true : hit.slice(eq + 1);
}
const VALID_ID_TYPES = ["UUID", "String", "Long"];
const SECURITY_LEVELS = ["low", "medium", "high"];
const AUTH_TYPES = ["jwt", "session", "none"];
const APP_TYPES = ["REST API", "Web application", "Microservice"];
const BUILD_TOOLS = ["maven", "gradle"];
const DB_TYPES = ["postgresql", "mysql", "h2", "oracle"];
const TARGETS = ["backend", "frontend", "both"];
const FRAMEWORKS = ["next"];
const FRONTEND_BUILD_TOOLS = { next: ["next-cli"] };
const UI_LIBRARIES = { next: ["tailwind"] };
const STATE_LIBS = { next: ["zustand"] };

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
    rl.question(`  ${label}${suffix}: `, (answer) => resolve(answer.trim() || defaultValue)),
  );
}

const INTERACTIVE = (io = process) => io.stdin.isTTY && io.stdout.isTTY;

// Renders one pass of the arrow-key menu.
function menuDraw(label, options, index, stdout = process.stdout) {
  stdout.write(`  ${label} (↑/↓ ou chiffre, Entrée pour valider)`);
  stdout.write("\n");
  options.forEach((option, i) => {
    if (i === index) {
      stdout.write(`    › ${option}   ◀\n`);
    } else {
      stdout.write(`      ${option}\n`);
    }
  });
}

// Cursor sits on the blank line just below the menu; move back to the label
// line and wipe the whole block before redrawing.
function menuErase(options, stdout = process.stdout) {
  if (!stdout.isTTY) return;
  readline.moveCursor(stdout, 0, -(options.length + 1));
  readline.clearScreenDown(stdout);
}

// Interactive selection with ↑/↓ arrow keys (or a number shortcut) + Enter.
// Falls back to plain typed answers when stdin is not a TTY (tests, pipes).
function selectOptions(rl, label, options, defaultValueIndex = 0, io = process) {
  if (!Array.isArray(options) || options.length === 0) {
    return Promise.resolve(undefined);
  }
  const maxIndex = Math.min(Math.max(defaultValueIndex, 0), options.length - 1);
  const defaultVal = options[maxIndex];

  return new Promise((resolve, reject) => {
    if (!INTERACTIVE(io)) {
      const prompt = `  ${label} (${options.join(" / ")}): `;
      const loop = () => {
        rl.question(prompt, (answer) => {
          const v = answer.trim();
          if (v === "") return resolve(defaultVal);
          const num = Number(v);
          if (Number.isInteger(num) && num >= 1 && num <= options.length) {
            return resolve(options[num - 1]);
          }
          const idx = options.findIndex((o) => o.toLowerCase() === v.toLowerCase());
          if (idx >= 0) return resolve(options[idx]);
          const y = v.toLowerCase();
          if (options.length === 2 && /^(y|yes|o|oui|n|no|non)$/.test(y)) {
            return resolve(options[y === "n" || y === "no" || y === "non" ? 1 : 0]);
          }
          console.log(`    Choix invalide. Options: ${options.join(", ")}`);
          loop();
        });
      };
      loop();
      return;
    }

    const stdin = io.stdin;
    const stdout = io.stdout;
    const keypressHandlers = stdin.listeners("keypress");
    let index = maxIndex;
    let pending = "";

    const cleanup = (finalLine) => {
      stdin.removeListener("data", onData);
      for (const handler of keypressHandlers) stdin.on("keypress", handler);
      rl.resume();
      if (finalLine) {
        menuErase(options, stdout);
        stdout.write(`  ${label}: ${finalLine}\n`);
      }
    };

    const finish = (value) => {
      cleanup(options[index]);
      resolve(value);
    };

    const cancel = () => {
      cleanup();
      menuErase(options, stdout);
      reject(new Error("Annulé par l'utilisateur (Ctrl+C)."));
    };

    function move(delta) {
      index = (index + delta + options.length) % options.length;
      menuErase(options, stdout);
      menuDraw(label, options, index, stdout);
    }

    function onData(chunk) {
      pending += chunk.toString("utf8");
      while (pending.length > 0) {
        const head = pending[0];
        if (head === "\x1b") {
          // ESC-introduced sequences: "ESC [ <final>" (CSI) or "ESC O <final>"
          // (SS3). The final byte is a code in the 0x40-0x7e range, but the
          // introducer itself ('[' 0x5b, 'O' 0x4f) is also in that range, so
          // only bytes after the introducer may count as the final byte.
          if (pending.length < 2) return;
          const intro = pending[1];
          let consumed;
          if (intro === "[" || intro === "O") {
            let final = -1;
            for (let i = 2; i < pending.length; i += 1) {
              const code = pending.charCodeAt(i);
              if (code >= 0x40 && code <= 0x7e) {
                final = i;
                break;
              }
            }
            if (final === -1) return; // sequence incomplete, wait for more input
            const seq = pending.slice(1, final + 1);
            consumed = final + 1;
            if (seq === "[A" || seq === "OA") move(-1);
            else if (seq === "[B" || seq === "OB") move(1);
          } else {
            consumed = 2; // ESC + single char (Alt-letter); not an arrow key
          }
          pending = pending.slice(consumed);
          continue;
        }
        pending = pending.slice(1);
        if (head === "\r" || head === "\n") {
          finish(options[index]);
          return;
        }
        if (head === "\x03") {
          cleanup();
          reject(new Error("Annulé par l'utilisateur (Ctrl+C)."));
          return;
        }
        const digit = Number(head);
        if (Number.isInteger(digit) && digit >= 1 && digit <= options.length) {
          index = digit - 1;
          menuErase(options, stdout);
          menuDraw(label, options, index, stdout);
        }
      }
    }

    stdin.removeAllListeners("keypress");
    if (typeof stdin.setRawMode === "function" && !stdin.isRaw) {
      stdin.setRawMode(true);
    }

    menuDraw(label, options, index, stdout);
    stdin.on("data", onData);
  });
}

function askBool(rl, label, defaultValue = true) {
  if (INTERACTIVE()) {
    return selectOptions(rl, label, ["Oui", "Non"], defaultValue ? 0 : 1).then((v) => v === "Oui");
  }
  const def = defaultValue ? "Y/n" : "y/N";
  return new Promise((resolve) =>
    rl.question(`  ${label} (${def}): `, (answer) => {
      const v = answer.trim().toLowerCase();
      if (v === "") return resolve(defaultValue);
      if (v === "y" || v === "yes" || v === "o" || v === "oui") return resolve(true);
      return resolve(false);
    }),
  );
}

function choose(rl, label, options, defaultValueIndex = 0) {
  return selectOptions(rl, label, options, defaultValueIndex);
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
  return {
    pagination,
    search,
    filtering,
    export: exportEnabled,
    auditFields,
    softDelete,
    apiDocumentation: apiDocs,
  };
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
  console.log("\nFrontend (Next.js) :");
  const framework = await choose(rl, "Framework", FRAMEWORKS, 0);
  const templatePath = await ask(rl, "Template pack (.spack) — vide pour le pack intégré");
  const i18n = await askBool(rl, "Internationalisation (i18n)", true);
  const theming = await askBool(rl, "Thème clair/sombre", true);
  return {
    framework,
    buildTool: "next-cli",
    uiLibrary: "tailwind",
    state: "zustand",
    templatePath: templatePath || undefined,
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
      [
        "String",
        "Long",
        "Integer",
        "Boolean",
        "LocalDate",
        "LocalDateTime",
        "Double",
        "BigDecimal",
      ],
      0,
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
    const target = await ask(
      rl,
      "  Relation many-to-one vers (vide pour finir, 'done' pour relations one-to-many)",
    );
    if (target === "done") break;
    if (!target) break;
    const targetPascal = toPascalCase(target);
    if (!validJavaIdentifier(targetPascal)) {
      console.log("    Nom de cible invalide.");
      continue;
    }
    const fieldName = await ask(
      rl,
      `  Nom du champ relation (défaut: ${toCamelCase(targetPascal)})`,
      toCamelCase(targetPascal),
    );
    const joinColumn = await ask(
      rl,
      `  Colonne de jointure (défaut: ${toSnakeUpper(targetPascal) + "_ID"})`,
      toSnakeUpper(targetPascal) + "_ID",
    );
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
    const fieldName = await ask(
      rl,
      `  Nom du champ collection (défaut: ${toCamelCase(targetPascal)}s)`,
      toCamelCase(targetPascal) + "s",
    );
    const mappedBy = await ask(
      rl,
      "  Attribut 'mappedBy' (champ dans la cible qui pointe vers cette entité)",
      toCamelCase(entityName),
    );
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
  console.log(
    "Cet assistant enregistre le modèle complet de l'application puis génère le backend.\n",
  );

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
    if (isCoreEntityName(name)) {
      console.log(
        `    «${name}» est une classe intégrée (auth): le générateur conservera la version intégrée.`,
      );
    }
    const module = toCamelCase(await ask(rl, `${name} — module (package)`, "administration"));
    const tableName = await ask(rl, `${name} — table`, toSnakeUpper(name));
    const idType = await choose(rl, `${name} — type d'identifiant`, VALID_ID_TYPES, 0);
    const idField = await ask(rl, `${name} — nom du champ id`, "id");
    const idColumn = await ask(rl, `${name} — colonne id`, toSnakeUpper(name) + "_ID");
    const serviceDescription = await ask(
      rl,
      `${name} — description du service`,
      `${name} management`,
    );
    const urlPath = await ask(
      rl,
      `${name} — chemin URL`,
      toCamelCase(name)
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .toLowerCase() + "s",
    );
    const permissionCode = `${security.permissionPrefix}_${name.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase()}`;

    const fields = await collectFields(rl, name);
    const { manyToOne, oneToMany } = await collectRelations(rl, name, [...names]);

    const updatableFields = fields
      .filter((f) => !(f.name === idField))
      .map((f) => ({ nameCap: f.nameCap }));
    const exportColumns = fields.map((f) => ({ nameCap: f.nameCap, label: f.name }));
    const hasValidation = fields.some((f) => f.required);
    const needsLocalDate = fields.some(
      (f) => f.javaType === "LocalDate" || f.javaType === "LocalDateTime",
    );

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
  const serverRoot = target === "frontend" ? null : path.join(absoluteOutput, "server");
  const clientRoot =
    target === "backend" ? null : path.join(absoluteOutput, target === "both" ? "client" : "");
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
  fs.writeFileSync(
    path.join(absoluteOutput, "project.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  entities.forEach((entity, index) => {
    const fileName = `${String(index + 1).padStart(3, "0")}-${entity.name}.json`;
    fs.writeFileSync(path.join(schemaDir, fileName), `${JSON.stringify({ entity }, null, 2)}\n`);
  });

  console.log(`\nModèle enregistré dans ${absoluteOutput}`);
  if (serverRoot) {
    const backendResult = spawnSync(
      process.execPath,
      [path.join(root, "generate.js"), schemaDir, absoluteOutput, "--strict-relations"],
      { stdio: "inherit" },
    );
    if (backendResult.status !== 0)
      throw new Error("La génération du backend a échoué; consultez les messages ci-dessus.");
  }
  if (clientRoot) {
    const frontendArgs = [
      path.join(root, "generate-frontend.js"),
      schemaDir,
      clientRoot,
      `--frontend=${frontend.framework}`,
    ];
    const templatePath = cliFlag("--frontend-template") || frontend.templatePath || undefined;
    if (templatePath) frontendArgs.push(`--frontend-template=${templatePath}`);
    const frontendResult = spawnSync(process.execPath, frontendArgs, { stdio: "inherit" });
    if (frontendResult.status !== 0)
      throw new Error("La génération du frontend a échoué; consultez les messages ci-dessus.");
  }

  await finishAndSupportRun(absoluteOutput, { targets, serverRoot, clientRoot });
}

function runInstructions(parts) {
  console.log("\nExécution de l'application générée :");
  if (parts.server) {
    console.log(
      `  Backend :  cd "${parts.server}" && mvn spring-boot:run   ->  http://localhost:8081`,
    );
  }
  if (parts.client) {
    console.log(
      `  Frontend : cd "${parts.client}" && npm install && npm run dev  ->  http://localhost:3000`,
    );
  }
  console.log(
    `  Raccourci: "${parts.output}\\dev-run.ps1" (Windows) ou "${parts.output}\\dev-run.sh"`,
  );
  console.log(`  Vérifier : npm run test-app -- "${parts.output}"`);
}

function writeDevScripts(absoluteOutput, serverRoot, clientRoot) {
  fs.mkdirSync(absoluteOutput, { recursive: true });
  if (serverRoot) {
    const ps1 = [
      "# StockPro generated app - development launcher",
      `param([switch]$NoInstall)`,
      `Write-Host "Starting backend on :8081..."`,
      `Start-Process powershell -ArgumentList @("-NoExit","-Command","Set-Location \\\`"$PSScriptRoot\\${path.relative(absoluteOutput, serverRoot)}\\\`"; mvn spring-boot:run")`,
    ];
    if (clientRoot) {
      ps1.push(
        `Write-Host "Starting frontend on :3000..."`,
        `if (-not $NoInstall) { Push-Location "$PSScriptRoot\\${path.relative(absoluteOutput, clientRoot)}"; npm install; Pop-Location }`,
        `Start-Process powershell -ArgumentList @("-NoExit","-Command","Set-Location \\\`"$PSScriptRoot\\${path.relative(absoluteOutput, clientRoot)}\\\`"; npm run dev")`,
      );
    }
    fs.writeFileSync(path.join(absoluteOutput, "dev-run.ps1"), ps1.join("\r\n") + "\r\n");
  }
  if (serverRoot || clientRoot) {
    const sh = ["#!/usr/bin/env bash", `set -e`, `DIR="$(cd "$(dirname "$0")" && pwd)"`];
    if (serverRoot)
      sh.push(
        `( cd "$DIR/${path.relative(absoluteOutput, serverRoot).replace(/\\/g, "/")}" && mvn spring-boot:run ) &`,
      );
    if (clientRoot)
      sh.push(
        `( cd "$DIR/${path.relative(absoluteOutput, clientRoot).replace(/\\/g, "/")}" && npm install && npm run dev ) &`,
      );
    sh.push(`wait`);
    fs.writeFileSync(path.join(absoluteOutput, "dev-run.sh"), sh.join("\n") + "\n");
  }
}

async function finishAndSupportRun(absoluteOutput, { targets, serverRoot, clientRoot }) {
  console.log("\nGénération terminée. Vérifiez avec:");
  console.log(`  npm run test-app -- "${absoluteOutput}"`);

  writeDevScripts(absoluteOutput, serverRoot, clientRoot);

  const rela = path.relative(process.cwd(), absoluteOutput) || ".";
  runInstructions({
    output: absoluteOutput,
    server: serverRoot
      ? path.join(rela, path.relative(absoluteOutput, serverRoot)).replace(/\\/g, "/")
      : null,
    client: clientRoot
      ? path.join(rela, path.relative(absoluteOutput, clientRoot)).replace(/\\/g, "/")
      : null,
  });

  const forceRun =
    cliFlag("--run") === true || cliFlag("--run") === "1" || cliFlag("--run") === "yes";
  const skipRun = cliFlag("--skip-run") !== undefined;
  let runNow = false;
  if (skipRun) {
    runNow = false;
  } else if (forceRun) {
    runNow = true;
  } else if (IS_TTY) {
    runNow = await new Promise((resolve) => {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question("  Lancer l'application maintenant ? (y/N): ", (answer) => {
        rl.close();
        const v = answer.trim().toLowerCase();
        resolve(v === "y" || v === "yes" || v === "o" || v === "oui");
      });
    });
  }

  if (runNow) {
    await launchGenerated(absoluteOutput, { targets, serverRoot, clientRoot });
  } else {
    console.log(
      "\nVous pouvez lancer l'application à tout moment avec le script dev-run.ps1 / dev-run.sh, ou en suivant les commandes ci-dessus.",
    );
  }
}

function launchGenerated(absoluteOutput, { serverRoot, clientRoot }) {
  const spawn = require("node:child_process").spawn;
  if (clientRoot) {
    console.log(`\nInstallation des dépendances frontend (${clientRoot})...`);
    const install = spawnSync("npm", ["install"], {
      cwd: clientRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (install.status !== 0) {
      console.warn("  npm install a échoué — le frontend ne pourra pas démarrer.");
    } else {
      console.log("  Démarrage du frontend (Next.js) sur http://localhost:3000 ...");
      spawn("npm", ["run", "dev"], {
        cwd: clientRoot,
        stdio: "ignore",
        detached: true,
        shell: process.platform === "win32",
      }).unref();
    }
  }
  if (serverRoot) {
    console.log(`  Démarrage du backend (Spring Boot) sur http://localhost:8081 ...`);
    spawn("mvn", ["spring-boot:run"], {
      cwd: serverRoot,
      stdio: "ignore",
      detached: true,
      shell: process.platform === "win32",
    }).unref();
  }
  console.log(
    "\nLes serveurs démarrent dans des fenêtres séparées. Arrêtez-les avec Ctrl+C dans chaque fenêtre.",
  );
}

if (require.main === module) {
  runWizard().catch((error) => {
    console.error(`\nErreur: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { selectOptions, askBool, INTERACTIVE };
