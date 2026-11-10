#!/usr/bin/env node
/**
 * design-to-spack — pack a design template project into a .spack.
 *
 * Usage:
 *   node design-to-spack.js <designDir> <out.spack> [--name <name>] [--framework next]
 *
 * <designDir> is the output of extract-design.js (contains design.json + the
 * staged Next.js template project). The resulting .spack is consumed by
 * generate-frontend.js --frontend-template=<file.spack>.
 */
const fs = require("fs");
const path = require("path");
const { packProject } = require("./lib/pack");
const { parseArgs } = require("../lib/args");

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("Usage: node design-to-spack.js <designDir> <out.spack> [--name <name>] [--framework next]");
    return;
  }
  const { positional, options } = parseArgs(args, ["name", "framework"]);
  const [designDir, outFile] = positional;
  if (!designDir || !outFile) {
    console.error("Error: <designDir> and <out.spack> are required.");
    process.exit(1);
  }
  try {
    const { pack, fileCount } = packProject(designDir, outFile, {
      name: options.name,
      framework: options.framework,
    });
    console.log(
      `Pack ${pack.name} (${pack.framework}) -> ${outFile} (${fileCount} files, ${pack.templates.length} template(s))`
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { main };

if (require.main === module) {
  main();
}
