#!/usr/bin/env node
/**
 * site-to-spack — design extractor.
 *
 * Input: a website URL, a GitHub repo (https://github.com/o/r or o/r), or a
 * local directory. Output: a staged Next.js design template project + design.json,
 * which design-to-spack.js packs into a .spack frontend template pack usable by
 * generate-frontend.js in the parent repository.
 *
 * Usage:
 *   node extract-design.js <input> [--out <dir>] [--base <templateDir>] [--browser]
 *
 *   --out     output dir (default ./out/<name>)
 *   --base    design base template dir (default ./templates/design-base)
 *   --browser use a headless browser for live sites (not implemented yet)
 */
const fs = require("fs");
const path = require("path");
const { acquire } = require("./lib/acquire-source");
const { analyzeCss } = require("./lib/parse-css");
const { readTailwindConfig } = require("./lib/parse-tailwind");
const { buildDesign } = require("./lib/design-tokens");
const { renderDesign } = require("./lib/render-template");
const { parseArgs } = require("../lib/args");

const ROOT = __dirname;
const DEFAULT_BASE = path.join(ROOT, "templates", "design-base");

function mergeAnalyses(list) {
  const merged = { rules: [], buttons: [], keyframes: [], fontFaces: [], imports: [], tokens: { colors: {}, fontSizes: {}, fontWeights: {}, fontFamilies: {}, radii: {}, shadows: {}, spacer: {}, transitions: { durations: {}, timings: {}, properties: {} }, usedKeyframeNames: {} } };
  const bump = (map, k, c) => { map[k] = (map[k] || 0) + c; };
  for (const a of list) {
    merged.rules.push(...a.rules);
    merged.buttons.push(...a.buttons);
    merged.keyframes.push(...a.keyframes);
    merged.fontFaces.push(...a.fontFaces);
    merged.imports.push(...a.imports);
    for (const [k, v] of Object.entries(a.tokens.colors)) {
      const current = merged.tokens.colors[k];
      merged.tokens.colors[k] = { ...v, count: (current?.count || 0) + v.count };
    }
    for (const mapKey of ["fontSizes", "fontWeights", "fontFamilies", "radii", "shadows", "spacer", "usedKeyframeNames"]) {
      for (const [k, v] of Object.entries(a.tokens[mapKey])) bump(merged.tokens[mapKey], k, v);
    }
    for (const tKey of ["durations", "timings", "properties"]) {
      for (const [k, v] of Object.entries(a.tokens.transitions[tKey])) bump(merged.tokens.transitions[tKey], k, v);
    }
  }
  return merged;
}

function printSummary(design) {
  const p = design.palette;
  const b = design.buttons;
  const c = design.confidence;
  const line = (label, value) => console.log(`${label.padEnd(22)} ${value}`);
  console.log("\n=== site-to-spack design summary ===\n");
  line("source", `${design.source.type} ${design.source.location}`);
  line("palette", `${p.primary.DEFAULT} / ${p.secondary.DEFAULT} / ${p.accent.DEFAULT} / bg ${p.background.DEFAULT}`);
  line("typography", `${design.typography.families.body} (${design.typography.weights.bold || 700})`);
  line("radius", `sm ${design.radius.sm} · md ${design.radius.md} · lg ${design.radius.lg} · full ${design.radius.full}`);
  line("buttons", `primary ${b.primary.background} (r ${b.primary.radius}) · outline ${b.outline.background} · danger ${b.danger.background}`);
  line("animations", `${design.animations.keyframes.length} keyframes · ${Object.keys(design.animations.utilities).length} animate-* utilities`);
  console.log("\nconfidence:", JSON.stringify(c));
  console.log("hint: run `node design-to-spack.js <out> <name>.spack` to pack it.\n");
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(
      "Usage: node extract-design.js <input> [--out <dir>] [--base <templateDir>]\n" +
        "  input  : website URL | GitHub repo (https://github.com/o/r or o/r) | local directory\n" +
        "  --out  : output dir (default ./out/<name>)\n" +
        "  --base : design base template dir (default ./templates/design-base)"
    );
    return;
  }
  const { positional, options } = parseArgs(args, ["out", "base"]);
  const input = positional[0];
  if (!input) {
    console.error("Error: <input> is required (URL, GitHub repo, or directory).");
    process.exit(1);
  }
  if (options.browser) throw new Error("--browser is not implemented; use source files or a server-rendered page.");
  const baseDir = options.base || DEFAULT_BASE;

  (async () => {
    try {
      const sourceInfo = await acquire(input);
      const analyses = (sourceInfo.css || []).map((css) => analyzeCss(css));
      const merged = mergeAnalyses(analyses);

      const tailwindHints = readTailwindConfig(sourceInfo.tailwindConfig || null);
      const { design } = buildDesign(sourceInfo, merged, { tailwind: tailwindHints });

      const defaultOut = path.join(process.cwd(), "out", design.source.location ? deriveName(design.source.location) : "site");
      const outDir = options.out || defaultOut;
      renderDesign(design, baseDir, outDir);
      console.log(`\nDesign generated -> ${outDir}`);
      printSummary(design);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  })();
}

function deriveName(location) {
  const clean = String(location).replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const last = clean.split("/").filter(Boolean).pop() || clean;
  return String(last).replace(/[^a-z0-9-]/gi, "-").toLowerCase().slice(0, 40) || "site";
}

module.exports = { main, mergeAnalyses, printSummary };

if (require.main === module) {
  main();
}
