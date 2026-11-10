/**
 * Button-shape analysis.
 *
 * Consumes analyzeCss()'s `.buttons` array (candidate rules targeting
 * button elements/classes with base + state variants) and produces the
 * design.json `buttons` section:
 *
 *   { primary, secondary, outline, ghost, danger } -> each a tone:
 *   {
 *     background, color, border, radius, padding, fontSize, fontWeight,
 *     boxShadow, transition,
 *     hover, active, focus, disabled   // variant style maps
 *   }
 */
const { normalizeColor, displayColor, mixColor } = require("./color");

function familyKey(selector) {
  const m = selector.match(/\.(btn|button|cta|action|pill)[\w-]*/i);
  if (m) return m[0].slice(1);
  const el = selector.match(/\b(button|input|a)\b/);
  return el ? `el-${el[1]}` : null;
}

function colorOfStyle(styles) {
  const bg = styles["background"] || styles["background-color"];
  const parsed = bg ? normalizeColor(bg) : null;
  const fg = styles["color"] ? normalizeColor(styles["color"]) : null;
  return { bg: parsed, fg, rawBg: bg || null };
}

function mergeStyles(list) {
  const out = {};
  for (const s of list) {
    for (const [k, v] of Object.entries(s)) out[k] = v;
  }
  return out;
}

function isTransparent(styles) {
  const bg = styles["background"] || styles["background-color"];
  if (!bg) return false;
  const c = normalizeColor(bg);
  return !c || (c.alpha < 0.05 && c.hex === "#000000");
}

function isRhythmicNeutral(c) {
  if (!c) return false;
  return c.hsl.s < 0.08;
}

function isRed(c) {
  if (!c) return false;
  const h = c.hsl.h;
  return h >= 345 || h <= 15;
}

function isGreen(c) {
  if (!c) return false;
  return c.hsl.h >= 75 && c.hsl.h <= 165;
}

function groupByFamily(buttons) {
  const families = new Map();
  for (const b of buttons) {
    const key = familyKey(b.selector) || b.selector;
    if (!families.has(key)) families.set(key, { key, base: [], hover: [], active: [], focus: [], disabled: [], rules: [] });
    const fam = families.get(key);
    fam.rules.push(b);
    const state = b.state.hover ? "hover" : b.state.active ? "active" : b.state.focus ? "focus" : b.state.disabled ? "disabled" : "base";
    fam[state].push(b.styles);
  }
  return [...families.values()];
}

function pickFamily(families, key) {
  return families.find((f) => f.key === key);
}

function analyzeButtons(analysis, palette) {
  const families = groupByFamily(analysis.buttons || []);
  const tones = {};

  const roleFromKey = (key) => {
    const k = key.toLowerCase();
    if (k.includes("danger") || k.includes("error") || k.includes("delete")) return "danger";
    if (k.includes("outline") || k.includes("ghost")) return k.includes("ghost") ? "ghost" : "outline";
    if (k.includes("primary")) return "primary";
    if (k.includes("success")) return "success";
    if (k.includes("secondary")) return "secondary";
    return null;
  };

  const used = new Set();
  for (const fam of families) {
    if (fam.key === "btn" || fam.key === "button") continue;
    const common = families.filter((family) => family.key === "btn" || family.key === "button").flatMap((family) => family.base);
    const baseStyles = mergeStyles([...common, ...fam.base]);
    const roleHint = roleFromKey(fam.key);
    const { bg } = colorOfStyle(baseStyles);
    const transparent = isTransparent(baseStyles);
    const kind =
      roleHint ||
      (transparent ? "outline" : isRed(bg) ? "danger" : isGreen(bg) ? "success" : isRhythmicNeutral(bg) ? "secondary" : "primary");

    const hueColor = transparent
      ? normalizeColor(baseStyles["border-color"] || baseStyles["color"] || palette.primary?.DEFAULT) || null
      : bg;

    const variant = (list) => mergeStyles(list);

    const fallbackFg = (() => {
      if (hueColor && hueColor.hsl.l < 0.62 && hueColor.hsl.s > 0.12) return "#ffffff";
      return palette.text && palette.text.DEFAULT ? palette.text.DEFAULT : "#0f172a";
    })();

    const tone = {
      background: baseStyles["background"] ?? baseStyles["background-color"] ?? "transparent",
      color: baseStyles["color"] || fallbackFg,
      border: baseStyles["border-color"] || (isTransparent(baseStyles) ? "currentColor" : "transparent"),
      borderWidth: baseStyles["border-width"] || "0px",
      radius: fam.rules.find((r) => r.radius)?.radius || baseStyles["border-radius"] || "0.5rem",
      padding: baseStyles["padding"] || "0.5rem 1rem",
      fontSize: baseStyles["font-size"] || "0.875rem",
      fontWeight: baseStyles["font-weight"] || "600",
      fontFamily: baseStyles["font-family"] || undefined,
      textTransform: baseStyles["text-transform"] || undefined,
      letterSpacing: baseStyles["letter-spacing"] || undefined,
      boxShadow: baseStyles["box-shadow"] || undefined,
      transition: baseStyles["transition"] || `background 0.2s ease-in-out, box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out`,
      hover: variant(fam.hover) || undefined,
      active: variant(fam.active) || undefined,
      focus: variant(fam.focus) || undefined,
      disabled: variant(fam.disabled) || undefined,
    };

    if (kind === "success") {
      tones.success = tone;
      used.add(fam.key);
    } else if (!tones[kind]) {
      tones[kind] = tone;
      used.add(fam.key);
    }
  }

  // Fallbacks computed from the palette when the site declared no button styles.
  if (!tones.primary) tones.primary = buildFallbackTone("primary", palette);
  if (!tones.secondary) tones.secondary = buildFallbackTone("secondary", palette);
  if (!tones.outline) tones.outline = buildFallbackTone("outline", palette);
  if (!tones.danger) tones.danger = buildFallbackTone("danger", palette);
  if (!tones.ghost) tones.ghost = buildFallbackTone("ghost", palette);

  return { tones, buttonsAnalyzed: analysis.buttons?.length || 0, families: families.length };
}

function buildFallbackTone(kind, palette) {
  const primary = palette.primary && palette.primary.DEFAULT;
  const secondary = palette.secondary && palette.secondary.DEFAULT;
  const text = palette.text && palette.text.DEFAULT;
  const base = {
    background: "transparent",
    color: text || "#0f172a",
    border: "none",
    borderWidth: "0px",
    radius: palette.radius ? palette.radius.md || palette.radius.sm || "0.5rem" : "0.5rem",
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    transition: "all 0.2s ease-in-out",
    hover: {},
    active: {},
    focus: {},
    disabled: { opacity: "0.5", cursor: "not-allowed" },
  };
  if (kind === "primary") {
    const hoverBg = primary ? displayColor(mixColor(normalizeColor(primary), "black", 0.12)) : undefined;
    return { ...base, background: primary || "#0ea5e9", color: "#ffffff", hover: hoverBg ? { background: hoverBg } : {} };
  }
  if (kind === "secondary") {
    const c = secondary || "#e2e8f0";
    return { ...base, background: c, color: text || "#0f172a", hover: {} };
  }
  if (kind === "outline") {
    return { ...base, border: primary || "currentColor", borderWidth: "1px", background: "transparent", color: primary || text || "#0f172a", hover: { background: `${primary || "#0ea5e9"}14` } };
  }
  if (kind === "danger") {
    return { ...base, background: "#ef4444", color: "#ffffff", hover: {} };
  }
  if (kind === "ghost") {
    return { ...base, background: "transparent", color: primary || text || "#0f172a", hover: { background: `${primary || "#0ea5e9"}14` } };
  }
  return base;
}

module.exports = { analyzeButtons, groupByFamily, familyKey };
