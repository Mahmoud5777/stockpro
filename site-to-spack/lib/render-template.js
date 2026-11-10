/**
 * render-template.js
 *
 * Copies the design-base scaffold into a staging directory and overwrites the
 * generated files (tailwind.config.ts, src/app/globals.css) from a `design.json`
 * so the resulting staged project is a complete, design-theamed Next.js frontend
 * template. The staging dir is what design-to-spack packs into a .spack.
 */
const fs = require("fs");
const path = require("path");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

function cssColor(value) {
  return value && String(value).trim() ? String(value).trim() : "transparent";
}

function tokenKey(name) {
  return `--color-${name}`;
}

function paletteVars(design) {
  const lines = [];
  const palette = design.palette || {};
  const add = (name, color) => {
    if (color) {
      lines.push(`  ${tokenKey(name)}: ${cssColor(color.DEFAULT || color)};`);
      for (const variant of ["hover", "muted", "soft", "fg"]) {
        if (color[variant]) lines.push(`  ${tokenKey(`${name}-${variant}`)}: ${cssColor(color[variant])};`);
      }
    }
  };
  for (const name of ["background", "surface", "sidebar", "muted", "primary", "secondary", "accent", "success", "warning", "danger"]) {
    if (name === "muted") {
      const muted = palette.text && palette.text.muted;
      if (muted) lines.push(`  ${tokenKey("muted")}: ${cssColor(muted)};`);
    } else if (palette[name]) {
      add(name, palette[name]);
    }
  }
  if (palette.text) {
    lines.push(`  ${tokenKey("text")}: ${cssColor(palette.text.DEFAULT || palette.text)};`);
    if (palette.text.muted) lines.push(`  ${tokenKey("text-muted")}: ${cssColor(palette.text.muted)};`);
  }
  return lines.join("\n");
}

function buttonCss(design) {
  const tones = design.buttons || {};
  const baseTransition = tones.primary?.transition || "all 0.2s ease-in-out";
  const block = [
    ".btn {",
    "  @apply inline-flex items-center justify-center font-medium;",
    `  font-family: var(--font-body);`,
    `  transition: ${baseTransition};`,
    "  cursor: pointer;",
    "}",
  ];
  const toneCss = (name, tone) => {
    if (!tone) return [];
    const css = [
      `.btn-${name} {`,
      `  background: ${cssColor(tone.background)};`,
      `  color: ${cssColor(tone.color || "var(--color-text)")};`,
      `  border-radius: ${cssColor(tone.radius)};`,
      `  border: ${tone.borderWidth || "1px"} solid ${cssColor(tone.border || "transparent")};`,
      `  padding: ${cssColor(tone.padding)};`,
      tone.fontSize ? `  font-size: ${tone.fontSize};` : "",
      tone.fontWeight ? `  font-weight: ${tone.fontWeight};` : "",
      tone.boxShadow ? `  box-shadow: ${tone.boxShadow};` : "",
      `}`,
    ].filter(Boolean);
    const pushVariant = (state, rules, suffix) => {
      if (!rules || Object.keys(rules).length === 0) return;
      css.push(`.btn-${name}:${suffix} {`);
      for (const [prop, val] of Object.entries(rules)) {
        if (val) css.push(`  ${prop}: ${val};`);
      }
      css.push(`}`);
    };
    pushVariant("hover", tone.hover, "hover");
    pushVariant("active", tone.active, "active");
    pushVariant("focus", tone.focus, "focus-visible");
    if (tone.disabled) {
      css.push(`.btn-${name}:disabled, .btn-${name}[disabled] {`);
      if (Object.keys(tone.disabled).length) {
        for (const [prop, val] of Object.entries(tone.disabled)) css.push(`  ${prop}: ${val};`);
      } else {
        css.push(`  opacity: 0.5; cursor: not-allowed;`);
      }
      css.push(`}`);
    }
    return css;
  };
  for (const name of ["primary", "secondary", "outline", "danger", "ghost", "success"]) {
    if (tones[name]) block.push(...toneCss(name, tones[name]));
  }
  return block.join("\n");
}

function inputCss(design) {
  const radius = design.radius?.md || "0.5rem";
  return [
    ".input {",
    "  @apply w-full;",
    "  background: var(--color-surface);",
    "  color: var(--color-text);",
    `  border-radius: ${cssColor(radius)};`,
    "  border: 1px solid color-mix(in srgb, var(--color-text) 15%, transparent);",
    "  padding: 0.5rem 0.75rem;",
    "  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;",
    "}",
    ".input:focus-visible {",
    "  outline: none;",
    "  border-color: var(--color-primary);",
    "  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 30%, transparent);",
    "}",
    ".card {",
    "  background: var(--color-surface);",
    `  border-radius: ${cssColor(design.radius?.lg || design.radius?.md || "0.75rem")};`,
    `  box-shadow: ${cssColor(design.shadow?.md || "0 4px 12px -2px rgb(0 0 0 / 0.12)")};`,
    "}",
    ".sidebar {",
    "  background: var(--color-sidebar, #0f1424);",
    "  color: #cbd5e1;",
    "}",
    ".sidebar-link {",
    `  border-radius: ${cssColor(design.radius?.md || "0.5rem")};`,
    "  transition: background 0.15s ease-in-out;",
    "}",
    ".sidebar-link:hover, .sidebar-link.active {",
    "  background: color-mix(in srgb, var(--color-primary-fg, #f9fafb) 12%, transparent);",
    "}",
  ].join("\n");
}

function animationCss(design) {
  const anim = design.animations || {};
  const blocks = [];
  for (const kf of anim.keyframes || []) {
    blocks.push(String(kf.css || "").trim());
  }
  const utils = anim.utilities || {};
  for (const [name, value] of Object.entries(utils)) {
    const cls = name.replace(/^animate-/, "");
    blocks.push(`.animate-${cls} { animation: ${value}; }`);
  }
  return blocks.filter(Boolean).join("\n\n");
}

function fontVars(design) {
  const t = design.typography || {};
  const fams = t.families || {};
  const body = fams.body && fams.body !== "inherit" ? fams.body : "system-ui, sans-serif";
  const display = fams.display && fams.display !== "inherit" ? fams.display : body;
  const w = t.weights || {};
  const lines = [
    `  --font-body: ${Array.isArray(body) ? body.join(", ") : body};`,
    `  --font-display: ${Array.isArray(display) ? display.join(", ") : display};`,
    `  --font-weight-normal: ${w.normal || "400"};`,
    `  --font-weight-medium: ${w.medium || "500"};`,
    `  --font-weight-semibold: ${w.semibold || "600"};`,
    `  --font-weight-bold: ${w.bold || "700"};`,
  ];
  return lines.join("\n");
}

function tailwindConfigJs(design) {
  const colors = {};
  const p = design.palette || {};
  for (const name of ["background", "surface", "primary", "secondary", "accent", "success", "warning", "danger"]) {
    const c = p[name];
    if (!c) continue;
    const entry = { DEFAULT: `var(--color-${name})` };
    for (const v of ["hover", "muted", "soft"]) if (c[v]) entry[v] = `var(--color-${name}-${v})`;
    colors[name] = entry;
  }
  colors.text = { DEFAULT: "var(--color-text)", muted: "var(--color-text-muted)" };
  colors.muted = { DEFAULT: "var(--color-muted)" };

  const families = design.typography?.families || {};
  const fontFamily = {
    sans: Array.isArray(families.body) ? families.body : [families.body || "system-ui", "sans-serif"],
    display: Array.isArray(families.display) ? families.display : [families.display || "system-ui", "sans-serif"],
  };
  const radii = design.radius || {};
  const shadows = design.shadow || {};
  const anim = design.animations || {};
  const animation = {};
  for (const name of Object.keys(anim.utilities || {})) {
    animation[name.replace(/^animate-/, "")] = anim.utilities[name];
  }
  const keyframes = {};
  for (const kf of anim.keyframes || []) {
    const frame = kf.css.match(/\{([\s\S]*)\}$/);
    if (frame && frame[1] && frame[1].trim()) keyframes[kf.name] = frame[1].trim();
  }

  const theme = { colors, fontFamily, borderRadius: radii, boxShadow: shadows, animation };
  // Keyframes already live in globals.css. Tailwind expects nested objects,
  // not the raw CSS strings used by the extractor.
  const lines = [
    `import type { Config } from "tailwindcss";`,
    ``,
    `const config: Config = {`,
    `  content: ["./src/**/*.{ts,tsx}"],`,
    `  theme: {`,
    `    extend: ${JSON.stringify(theme, null, 4)}, // keyframes emitted in globals.css`,
    `  },`,
    `  plugins: [],`,
    `};`,
    ``,
    `export default config;`,
  ];
  return lines.join("\n");
}

function prettifyColors(colors) {
  const lines = ["{"];
  for (const [name, entry] of Object.entries(colors)) {
    const vals = Object.entries(entry).map(([k, v]) => `${k}: "${v}"`).join(", ");
    lines.push(`    ${name}: { ${vals} },`);
  }
  lines.push("  }");
  return lines.join("\n");
}

function prettify(obj) {
  return JSON.stringify(obj, null, 4);
}

function banner(design) {
  return `/**
 * Generated by site-to-spack from ${design.source?.type} "${design.source?.location}".
 * Do not edit by hand — regenerate from design.json instead.
 */
`;
}

function renderDesign(design, baseDir, outDir) {
  if (!fs.existsSync(baseDir)) throw new Error(`design base template not found: ${baseDir}`);
  fs.mkdirSync(outDir, { recursive: true });
  copyDir(baseDir, outDir);

  const baseGlobals = fs.readFileSync(path.join(baseDir, "src/app/globals.css"), "utf8");
  const globals = [
    baseGlobals,
    ``,
    `@layer base {`,
    `  :root {`,
    paletteVars(design),
    fontVars(design),
    `  }`,
    `  body {`,
    `    background-color: var(--color-background, #f8fafc);`,
    `    color: var(--color-text, #0f172a);`,
    `    font-family: var(--font-body);`,
    `  }`,
    `  h1, h2, h3, h4, h5, h6 {`,
    `    font-family: var(--font-display);`,
    `  }`,
    `}`,
    ``,
    `@layer components {`,
    buttonCss(design),
    inputCss(design),
    `}`,
    ``,
    animationCss(design),
    ``,
  ].join("\n");

  fs.writeFileSync(path.join(outDir, "src", "app", "globals.css"), globals);
  fs.writeFileSync(path.join(outDir, "tailwind.config.ts"), banner(design) + tailwindConfigJs(design));
  fs.writeFileSync(path.join(outDir, "design.json"), JSON.stringify(design, null, 2) + "\n");
}

module.exports = { renderDesign, copyDir, tailwindConfigJs, paletteVars, buttonCss, inputCss, animationCss, fontVars, banner };
