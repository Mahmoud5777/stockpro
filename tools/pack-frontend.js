#!/usr/bin/env node
/**
 * Frontend template packer.
 *
 * Turns a finished frontend template project into a single "template pack"
 * (.spack archive). The main generator (generate-frontend.js) can then build
 * a full runnable frontend from any such pack, decoupled from this repo.
 *
 * A pack is a ZIP containing:
 *   - all template project files (copied verbatim into the generated client)
 *   - one or more Handlebars templates (files ending in .hbs) that are rendered
 *     against the entity schemas; the rendered file's path drops the .hbs suffix
 *   - a root pack.json describing the pack
 *
 * Usage:
 *   node tools/pack-frontend.js <templateDir> <out.spack> [--name <name>] [--registry <file>]
 *
 * The templateDir is scanned recursively. A root pack.json inside templateDir is
 * optional (it will be merged/updated with defaults). Files ending in .hbs are
 * registered as templates. --registry injects a file as
 * src/lib/entities-registry.hbs (used to build the bundled pack).
 */
const fs = require("fs");
const path = require("path");
const { writeZip } = require("../lib/zip");
const { parseArgs } = require("../lib/args");

function collectFiles(dir, rel = "") {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".next", "dist", "build", "target", ".env", ".env.local"].includes(entry.name) || entry.isSymbolicLink()) continue;
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...collectFiles(abs, relPath));
    } else {
      result.push(relPath);
    }
  }
  return result;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node tools/pack-frontend.js <templateDir> <out.spack> [--name <name>] [--framework next]");
    return;
  }
  const { positional, options } = parseArgs(args, ["name", "framework", "registry"]);
  const [templateDir, outFile] = positional;
  if (!templateDir || !outFile) {
    console.error("Error: <templateDir> and <out.spack> are required.");
    process.exit(1);
  }
  if (!fs.existsSync(templateDir)) {
    console.error(`Error: template directory not found: ${templateDir}`);
    process.exit(1);
  }

  const files = collectFiles(templateDir);
  const manifestFile = files.includes("pack.json") ? fs.readFileSync(path.join(templateDir, "pack.json"), "utf8") : "{}";
  const manifest = JSON.parse(manifestFile || "{}");

  const templates = files.filter((f) => f.endsWith(".hbs"));
  const normalizedFiles = {};
  for (const rel of files) {
    const abs = path.join(templateDir, rel.split("/").join(path.sep));
    normalizedFiles[rel] = fs.readFileSync(abs);
  }

  if (options.registry) {
    const registryPath = options.registry;
    if (!fs.existsSync(registryPath)) {
      console.error(`Error: registry template not found: ${registryPath}`);
      process.exit(1);
    }
    const rel = `src/lib/${path.basename(registryPath)}`;
    normalizedFiles[rel] = fs.readFileSync(registryPath);
    if (!templates.includes(rel)) templates.push(rel);
    if (!files.includes(rel)) files.push(rel);
  }

  const pack = {
    ...manifest,
    name: options.name || manifest.name || path.basename(templateDir),
    framework: options.framework || manifest.framework || "next",
    uiLibrary: manifest.uiLibrary || "tailwind",
    state: manifest.state || "zustand",
    templates,
    format: "spack",
    version: 1,
  };
  normalizedFiles["pack.json"] = Buffer.from(`${JSON.stringify(pack, null, 2)}\n`, "utf8");

  const archive = writeZip(normalizedFiles);
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, archive);
  console.log(
    `Pack ${pack.name} (${pack.framework}) -> ${outFile} (${files.length} files, ${templates.length} template(s))`
  );
}

module.exports = { collectFiles };

if (require.main === module) {
  main();
}
