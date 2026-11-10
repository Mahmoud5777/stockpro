/**
 * pack.js
 *
 * Self-contained .spack packer (same format as tools/pack-frontend.js in the
 * parent repository): packs a staged design template project into a single ZIP
 * with a pack.json manifest. Files ending in .hbs are registered as Handlebars
 * templates (rendered by generate-frontend.js at generation time). Metadata
 * files (pack.json, design.json) are excluded from the archive.
 */
const fs = require("fs");
const path = require("path");
const { writeZip } = require("./zip");

const EXCLUDED = new Set(["pack.json", "design.json"]);
const EXCLUDED_DIRS = new Set(["node_modules", ".git"]);

function collectFiles(dir, rel = "") {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue;
      result.push(...collectFiles(path.join(dir, entry.name), relPath));
    } else if (!EXCLUDED.has(relPath)) {
      result.push(relPath);
    }
  }
  return result;
}

function readDesign(designDir) {
  const designPath = path.join(designDir, "design.json");
  if (!fs.existsSync(designPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(designPath, "utf8"));
  } catch {
    return {};
  }
}

function packProject(stagingDir, outFile, opts = {}) {
  if (!fs.existsSync(stagingDir)) {
    throw new Error(`staging directory not found: ${stagingDir}`);
  }
  const design = readDesign(stagingDir);
  const files = collectFiles(stagingDir);
  const templates = files.filter((f) => f.endsWith(".hbs"));
  const normalizedFiles = {};
  for (const rel of files) {
    // The renderer needs the template bytes as well as their manifest entries.
    const outputPath = rel === "entities-registry.ts.hbs" ? "src/lib/entities-registry.ts.hbs" : rel;
    normalizedFiles[outputPath] = fs.readFileSync(path.join(stagingDir, rel.split("/").join(path.sep)));
  }

  const pack = {
    name: opts.name || (design.source && design.source.location ? deriveName(design.source.location) : "design-from-site"),
    framework: opts.framework || "next",
    uiLibrary: "tailwind",
    state: "zustand",
    templates: templates.map((rel) => rel === "entities-registry.ts.hbs" ? "src/lib/entities-registry.ts.hbs" : rel),
    design: design.confidence || {},
    fidelity: design.meta?.fidelity || "design-tokens",
    format: "spack",
    version: 1,
  };
  normalizedFiles["pack.json"] = Buffer.from(`${JSON.stringify(pack, null, 2)}\n`, "utf8");

  const archive = writeZip(normalizedFiles);
  fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
  fs.writeFileSync(outFile, archive);
  return { pack, fileCount: Object.keys(normalizedFiles).length };
}

function deriveName(location) {
  const clean = String(location)
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
  const last = clean.split("/").filter(Boolean).pop() || clean;
  return last.replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 40) || "design";
}

module.exports = { packProject, collectFiles, deriveName };
