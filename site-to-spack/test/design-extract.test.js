const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.join(__dirname, "..");
const { analyzeCss, summarizeButtons } = require(path.join(root, "lib", "parse-css.js"));
const { buildDesign } = require(path.join(root, "lib", "design-tokens.js"));
const { renderDesign } = require(path.join(root, "lib", "render-template.js"));
const { packProject } = require(path.join(root, "lib", "pack.js"));
const { readZip } = require(path.join(root, "lib", "zip.js"));
const { detectType, parseRepo, collectImports } = require(path.join(root, "lib", "acquire-source.js"));
const { readTailwindConfig } = require(path.join(root, "lib", "parse-tailwind.js"));
const { mergeAnalyses } = require(path.join(root, "extract-design.js"));
const { Script } = require("node:vm");

const SAMPLE_CSS = fs.readFileSync(path.join(__dirname, "fixtures", "sample-style.css"), "utf8");
test("merged stylesheets keep color objects and generated Tailwind config has valid syntax", () => {
  const merged = mergeAnalyses([analyzeCss(SAMPLE_CSS), analyzeCss("body { background:#f8fafc; }")]);
  assert.ok(Object.values(merged.tokens.colors).every((entry) => entry.color && entry.count > 0));
  const { design } = buildDesign({ type: "dir", location: "fixture" }, merged);
  const { tailwindConfigJs } = require(path.join(root, "lib/render-template.js"));
  const js = tailwindConfigJs(design).replace(/import type[^\n]+\n/, "").replace("const config: Config", "const config").replace("export default config;", "");
  assert.doesNotThrow(() => new Script(js));
});

function tempDir(prefix = "s2s-") {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
}

test("analyzeCss extracts colors, fonts, radii, keyframes and transitions", () => {
  const a = analyzeCss(SAMPLE_CSS);
  assert.ok(Object.keys(a.tokens.colors).length >= 6, "colors parsed");
  assert.ok(a.keyframes.some((k) => k.name === "fade-in-up"));
  assert.ok(a.keyframes.some((k) => k.name === "spin-slow"));
  assert.ok(Object.keys(a.tokens.radii).includes("8"), "8px radius collected");
  assert.ok(a.tokens.fontFamilies["Inter"], "Inter family found");
  assert.ok(a.tokens.fontFamilies["Poppins"], "Poppins family found");
  assert.ok(a.tokens.transitions.durations["200"], "200ms duration from btn transition");
  assert.ok(a.tokens.usedKeyframeNames["fade-in-up"]);
  assert.ok(summarizeButtons(a).length >= 5);
});

test("buildDesign produces a coherent palette + button tones", () => {
  const analysis = analyzeCss(SAMPLE_CSS);
  const { design, clusters } = buildDesign(
    { type: "url", location: "https://example.com", framework: "next", styles: ["css"] },
    analysis
  );
  const p = design.palette;
  assert.ok(p.primary && p.primary.DEFAULT, "primary role assigned");
  assert.ok(p.background && p.background.DEFAULT, "background role assigned");
  assert.ok(/\d/.test(p.primary.DEFAULT), "primary is a real color");
  assert.ok(clusters.length >= 2);

  const b = design.buttons;
  assert.match(b.primary.background, /1e3a8a|1a3a8a|#1/i);
  assert.equal(b.primary.color.toLowerCase(), "#ffffff");
  assert.match(b.primary.hover.background || "", /1725|1e3a8a/i);
  assert.equal(b.outline.background, "transparent");
  assert.match(b.danger.background, /dc2626/i);
  assert.ok(b.primary.radius);

  assert.ok(design.animations.keyframes.some((k) => k.name === "fade-in-up"));
  assert.ok(design.animations.utilities["animate-fade-in-up"], "animate-* utility generated");
  assert.ok(design.typography.families.body, "typography body family present");
  assert.ok(design.confidence.colors > 0);
});

test("renderDesign stages a tokenized template project with no placeholder leaks", () => {
  const analysis = analyzeCss(SAMPLE_CSS);
  const { design } = buildDesign(
    { type: "dir", location: "/tmp/fixture", framework: "next", styles: ["css"] },
    analysis
  );
  const out = tempDir();
  const base = path.join(root, "templates", "design-base");
  renderDesign(design, base, out);

  const config = fs.readFileSync(path.join(out, "tailwind.config.ts"), "utf8");
  assert.match(config, /import type \{ Config \}/);
  assert.match(config, /primary/);
  assert.match(config, /fade-in-up/);
  assert.match(config, /keyframes/);

  const globals = fs.readFileSync(path.join(out, "src", "app", "globals.css"), "utf8");
  assert.ok(globals.includes("@keyframes fade-in-up"));
  assert.ok(globals.includes(".btn-primary"));
  assert.ok(globals.includes(".input"));
  assert.ok(globals.includes("--color-primary"));

  for (const file of walk(out)) {
    if (file.endsWith(".hbs")) continue;
    const content = fs.readFileSync(file, "utf8");
    assert.ok(!content.includes("{{"), `no placeholder leak in ${file}`);
  }
});

test("packProject emits a .spack with pack.json + registry template, excluding design.json", () => {
  const analysis = analyzeCss(SAMPLE_CSS);
  const { design } = buildDesign(
    { type: "url", location: "https://example.com", framework: "next", styles: ["css"] },
    analysis
  );
  const staged = tempDir();
  renderDesign(design, path.join(root, "templates", "design-base"), staged);

  const spackPath = path.join(tempDir(), "design.spack");
  const { pack } = packProject(staged, spackPath, { name: "test-design" });
  assert.equal(pack.name, "test-design");
  assert.ok(pack.templates.includes("src/lib/entities-registry.ts.hbs"));

  const files = readZip(fs.readFileSync(spackPath));
  assert.ok(files["pack.json"], "pack.json inside archive");
  assert.ok(files["tailwind.config.ts"]);
  assert.ok(files["src/lib/entities-registry.ts.hbs"]);
  assert.ok(!("design.json" in files), "design.json excluded");
});

test("end-to-end: directory source → design → .spack → parent generator round trip", () => {
  const src = tempDir("s2s-src-");
  fs.writeFileSync(path.join(src, "style.css"), SAMPLE_CSS);
  fs.writeFileSync(
    path.join(src, "package.json"),
    JSON.stringify({ name: "fixture", dependencies: { next: "15.5.0", react: "19.0.0", "react-dom": "19.0.0" } })
  );

  const analysis = analyzeCss(SAMPLE_CSS);
  const { design } = buildDesign(
    { type: "dir", location: src, framework: "next", styles: ["css"] },
    analysis
  );

  const staged = tempDir();
  renderDesign(design, path.join(root, "templates", "design-base"), staged);
  const spackPath = path.join(tempDir(), "fixture.spack");
  packProject(staged, spackPath, { name: "fixture" });

  const parentCli = path.join(__dirname, "..", "..", "generate-frontend.js");
  const schemas = path.join(__dirname, "..", "..", "generated-app", "schemas");
  if (!fs.existsSync(parentCli)) return; // parent not available — skip gracefully

  const client = tempDir("s2s-client-");
  const res = spawnSync(
    process.execPath,
    [parentCli, schemas, client, "--frontend=next", `--frontend-template=${spackPath}`],
    { encoding: "utf8" }
  );
  assert.equal(res.status, 0, res.stderr || res.stdout);
  assert.equal(fs.existsSync(path.join(client, "package.json")), true);
  assert.equal(fs.existsSync(path.join(client, "src/lib/entities-registry.ts")), true);
  const globals = fs.readFileSync(path.join(client, "src/app/globals.css"), "utf8");
  assert.ok(globals.includes("@keyframes fade-in-up"), "design animation present in generated client");
  assert.ok(globals.includes(".btn-primary"), "button shapes present in generated client");

  let leaks = 0;
  for (const file of walk(client)) {
    if (file.endsWith(".hbs")) leaks += 1;
    else if (fs.readFileSync(file, "utf8").includes("{{")) leaks += 1;
  }
  assert.equal(leaks, 0, "no hbs files or placeholder leaks in the generated client");
});

test("source detection and repo parsing", () => {
  assert.equal(detectType("https://github.com/User/Repo"), "repo");
  assert.equal(detectType("https://example.com/page"), "url");
  assert.equal(detectType("/some/local/path"), "dir");
  const { owner, repo } = parseRepo("User/Repo");
  assert.deepEqual({ owner, repo }, { owner: "User", repo: "Repo" });
  const { owner: o2, repo: r2, ref } = parseRepo("https://github.com/a/b/tree/develop");
  assert.equal(o2, "a");
  assert.equal(r2, "b");
  assert.equal(ref, "develop");
  assert.deepEqual(collectImports(`@import "a.css"; @import url("https://x/fonts.css"); body{color:red}`), [
    "a.css",
    "https://x/fonts.css",
  ]);
});

test("tailwind config hints feed the palette", () => {
  const cfg = `
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        brand: { DEFAULT: '#f43f5e', hover: '#e11d48' },
        surface: '#ffffff',
      },
      fontFamily: { sans: ['Rubik', 'ui-sans-serif'] },
      borderRadius: { md: '0.75rem' },
      boxShadow: { md: '0 1px 2px rgb(0 0 0 / 0.1)' },
    },
  },
};`;
  const hints = readTailwindConfig(cfg);
  assert.ok(hints.colors.primary === "#0f766e");
  assert.deepEqual(hints.fontFamily.sans, ["Rubik", "ui-sans-serif"]);

  const analysis = analyzeCss(SAMPLE_CSS);
  const { design } = buildDesign(
    { type: "repo", location: "github.com/x/y", framework: "next", styles: ["tailwind"] },
    analysis,
    { tailwind: hints }
  );
  assert.equal(design.palette.primary.DEFAULT, "#0f766e", "tailwind primary wins over CSS cluster");
});
