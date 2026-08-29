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
if (!Array.isArray(manifest.generationOrder) || manifest.generationOrder.length !== manifest.entityCount) {
    throw new Error("project.json has an invalid generation order");
}

const targets = manifest.targets || ["backend"];
const backendRoot = targets.includes("backend")
    ? (fs.existsSync(path.join(output, "server")) ? path.join(output, "server") : output)
    : null;
const javaRoot = backendRoot
    ? path.join(backendRoot, "src", "main", "java", "com", "stockpro")
    : null;

function findFiles(directory, fileName) {
    if (!fs.existsSync(directory)) return [];
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const candidate = path.join(directory, entry.name);
        return entry.isDirectory() ? findFiles(candidate, fileName) : entry.name === fileName ? [candidate] : [];
    });
}

const missing = [];
if (javaRoot) {
    for (const name of manifest.generationOrder) {
        for (const file of [
            `${name}.java`, `${name}DTO.java`, `${name}Repository.java`, `${name}Service.java`,
            `${name}ServiceImpl.java`, `${name}Mapper.java`, `${name}Controller.java`,
        ]) {
            const matches = findFiles(javaRoot, file);
            if (matches.length !== 1) missing.push(`${file} expected once, found ${matches.length}`);
            for (const candidate of matches) {
                const content = fs.readFileSync(candidate, "utf8");
                if (content.includes("{{") || content.includes("}}")) missing.push(`${candidate} contains template placeholders`);
            }
        }
    }
}

const clientRoot = targets.includes("frontend")
    ? (fs.existsSync(path.join(output, "client")) ? path.join(output, "client") : output)
    : null;
let frontendFiles = 0;
if (clientRoot && fs.existsSync(clientRoot)) {
    for (const name of manifest.generationOrder) {
        for (const file of [`${name}.model.ts`, `${name}.service.ts`]) {
            const matches = findFiles(clientRoot, file);
            for (const candidate of matches) {
                frontendFiles += 1;
                const content = fs.readFileSync(candidate, "utf8");
                if (content.includes("{{") || content.includes("}}")) missing.push(`${candidate} contains template placeholders`);
            }
        }
    }
}

if (missing.length) throw new Error(`Generated app test failed:\n${missing.join("\n")}`);
const parts = [];
if (javaRoot) parts.push(`${manifest.entityCount * 7} Java files`);
if (frontendFiles) parts.push(`${frontendFiles} frontend files`);
console.log(`App test passed: ${manifest.entityCount} entities, ${parts.join(", ") || "0 files"} verified.`);
