#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const output = process.argv[2];
if (!output) {
  console.error("Usage: node verify-app.js <generated-app-dir>");
  process.exit(1);
}
const manifestPath = path.join(output, "project.json");
if (!fs.existsSync(manifestPath)) throw new Error(`Missing project manifest: ${manifestPath}`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (!Array.isArray(manifest.generationOrder) || manifest.generationOrder.length !== manifest.entityCount ||
    new Set(manifest.generationOrder).size !== manifest.entityCount) throw new Error("project.json has an invalid generation order");
const targets = manifest.targets || ["backend"];
const failures = [];
function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (["node_modules", ".next", ".git", "target"].includes(entry.name) || entry.isSymbolicLink()) return [];
    const candidate = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(candidate) : [candidate];
  });
}
function checkPlaceholders(files) {
  for (const file of files) {
    if (file.endsWith(".hbs")) { failures.push(`${file} contains an unrendered template`); continue; }
    if (!/\.(java|ts|tsx|css|xml|yml|json)$/.test(file)) continue;
    if (/\{\{(?:[#/!{]|\s*[\w@.]+\s*\}\})/.test(fs.readFileSync(file, "utf8"))) {
      failures.push(`${file} contains template placeholders`);
    }
  }
}
let javaCount = 0;
let clientCount = 0;
if (targets.includes("backend")) {
  const backend = fs.existsSync(path.join(output, "server")) ? path.join(output, "server") : output;
  if (!fs.existsSync(path.join(backend, "pom.xml"))) failures.push("Missing backend pom.xml");
  const javaRoot = path.join(backend, "src/main/java/com/stockpro");
  const files = walk(javaRoot);
  for (const name of manifest.generationOrder) {
    for (const expected of [`${name}.java`, `${name}DTO.java`, `${name}Repository.java`, `${name}Service.java`,
      `${name}ServiceImpl.java`, `${name}Mapper.java`, `${name}Controller.java`]) {
      const matches = files.filter((file) => path.basename(file) === expected);
      if (matches.length !== 1) failures.push(`${expected} expected once, found ${matches.length}`);
      javaCount += matches.length;
    }
  }
  checkPlaceholders(walk(path.join(backend, "src")));
}
if (targets.includes("frontend")) {
  const client = fs.existsSync(path.join(output, "client")) ? path.join(output, "client") : output;
  const required = ["package.json", "src/app/layout.tsx", "src/app/page.tsx",
    "src/app/(auth)/login/page.tsx", "src/app/(dashboard)/dashboard/page.tsx",
    "src/app/(dashboard)/[entity]/page.tsx", "src/lib/entities-registry.ts", "src/features/shared/EntityCrud.tsx"];
  for (const file of required) if (!fs.existsSync(path.join(client, file))) failures.push(`Missing frontend file: ${file}`);
  if (fs.existsSync(path.join(client, "src/app/(dashboard)/page.tsx"))) failures.push("Conflicting root route: move the dashboard page to (dashboard)/dashboard/page.tsx");
  const registry = path.join(client, "src/lib/entities-registry.ts");
  if (fs.existsSync(registry)) {
    const content = fs.readFileSync(registry, "utf8");
    for (const name of manifest.generationOrder) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`["']?name["']?\\s*:\\s*["']${escaped}["']`).test(content)) failures.push(`Frontend registry is missing ${name}`);
    }
  }
  const files = walk(client);
  clientCount = files.length;
  checkPlaceholders(files);
}
if (failures.length) throw new Error(`Generated app test failed:\n${failures.join("\n")}`);
console.log(`App test passed: ${manifest.entityCount} entities, ${javaCount} entity Java files, ${clientCount} frontend files verified.`);
