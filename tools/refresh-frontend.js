#!/usr/bin/env node
// Keep the design-extraction scaffold and bundled pack in sync with the canonical frontend.
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.join(__dirname, "..");
const canonical = path.join(root, "templates/frontend/next/static");
const designBase = path.join(root, "site-to-spack/templates/design-base");
const registry = path.join(root, "templates/frontend/next/entities-registry.ts.hbs");
const dashboard = path.join(canonical, "src/app/(dashboard)/dashboard/page.tsx");
const legacyDashboard = path.join(canonical, "src/app/(dashboard)/page.tsx");
fs.mkdirSync(path.dirname(dashboard), { recursive: true });
if (fs.existsSync(legacyDashboard)) {
  fs.writeFileSync(dashboard, fs.readFileSync(legacyDashboard));
  fs.unlinkSync(legacyDashboard);
}
fs.cpSync(canonical, designBase, { recursive: true });
const staleDesignDashboard = path.join(designBase, "src/app/(dashboard)/page.tsx");
if (fs.existsSync(staleDesignDashboard)) fs.unlinkSync(staleDesignDashboard);
fs.copyFileSync(registry, path.join(designBase, "entities-registry.ts.hbs"));
const result = spawnSync(process.execPath, [path.join(__dirname, "pack-frontend.js"), canonical,
  path.join(root, "templates/frontend/packs/next-tailwind.spack"), "--name=next-tailwind", "--framework=next", `--registry=${registry}`], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
