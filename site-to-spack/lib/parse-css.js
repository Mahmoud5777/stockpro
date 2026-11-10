/**
 * CSS analysis via postcss + postcss-value-parser (zero-dependency CLI).
 *
 * analyzeCss(text) -> {
 *   rules:    [{ selector, declarations: { prop -> [values] } }]
 *   keyframes:[{ name, css }]
 *   fontFaces:[{ family, css }]
 *   imports:  [url strings from @import + url() inside css]
 * }
 *
 * All numbers are kept in px (rem/em multiplied by the 16px root).
 */
const postcss = require("postcss");
const valueParser = require("postcss-value-parser");
const { normalizeColor, lengthToNumber } = require("./color");

const RULE_RESERVED = new Set([
  "keyframes",
  "-webkit-keyframes",
  "font-face",
  "media",
  "supports",
  "charset",
  "import",
  "namespace",
  "layer",
  "container",
  "scope",
  "starting-style",
  "property",
  "counter-style",
  "font-feature-values",
]);

const COLOR_PROPS = new Set([
  "color",
  "background",
  "background-color",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline",
  "outline-color",
  "fill",
  "stroke",
  "text-decoration-color",
  "caret-color",
  "accent-color",
  "box-shadow",
  "text-shadow",
  "filter",
  "background-image",
  "background",
]);

const SHADOW_PROPS = new Set(["box-shadow", "text-shadow", "--shadow", "--tw-shadow"]);
const RADIUS_PROPS = new Set([
  "border-radius",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-right-radius",
  "border-bottom-left-radius",
]);
const FONT_SIZE_PROPS = new Set(["font-size", "font"]);
const FONT_FAMILY_PROPS = new Set(["font-family", "font"]);
const FONT_WEIGHT_PROPS = new Set(["font-weight", "font"]);
const SPACING_PROPS = new Set([
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "gap",
  "row-gap",
  "column-gap",
  "top",
  "right",
  "bottom",
  "left",
  "inset",
  "width",
  "max-width",
  "min-width",
  "height",
  "min-height",
  "line-height",
  "letter-spacing",
]);
const TRANSITION_PROPS = new Set([
  "transition",
  "transition-duration",
  "transition-timing-function",
  "transition-property",
  "transition-delay",
]);
const ANIMATION_PROPS = new Set([
  "animation",
  "animation-name",
  "animation-duration",
  "animation-timing-function",
  "animation-iteration-count",
  "animation-delay",
  "animation-fill-mode",
]);

const BUTTON_ELEMENT_SELECTOR = /\b(button)\b|\binput\b|\ba\b|\barea\b/;
const BUTTON_TYPE_ATTR = /\[\s*type\s*=\s*['"]?(submit|reset|button)['"]?]/i;
const BUTTON_CLASS_PART = /(btn|button|cta|action|primary-button|pill)/i;
const BUTTON_CLASS_SELECT = /\.((?:btn|button|cta|action|pill)[\w-]*|[a-zA-Z][\w-]*(?:btn|button|cta)[\w-]*)/i;
const HOVER_STATE = /:hover\b/;
const ACTIVE_STATE = /:active\b/;
const FOCUS_STATE = /:focus(?:-within|-visible)?\b/;
const DISABLED_STATE = /:disabled\b|\[disabled\]/;

function normalizeSelector(selector) {
  return selector.replace(/\s+/g, " ").trim();
}

function isColorCandidate(prop, value) {
  if (COLOR_PROPS.has(prop)) return true;
  return /#[0-9a-fA-F]{3,8}\b|(?:rgb|rgba|hsl|hsla|hwb)\(/i.test(value);
}

function collectColorsFrom(prop, value) {
  const out = [];
  const parsed = valueParser(value);
  const push = (raw) => {
    const c = normalizeColor(raw);
    if (c) out.push(c);
  };
  if (/^(rgb|rgba|hsl|hsla|hwb)\(/.test(value.trim())) push(value.trim());
  parsed.walk((node) => {
    if (node.type === "word" && /^#[0-9a-fA-F]{3,8}$/.test(node.value)) push(node.value);
    if (node.type === "function" && /^(rgb|rgba|hsl|hsla|hwb)$/i.test(node.value)) {
      push(valueParser.stringify(node));
    }
    if (node.type === "word" && /^[a-z]+$/.test(node.value) && prop !== "font-family") {
      push(node.value);
    }
  });
  return out.filter(Boolean);
}

function tokenLooksLikeKeyword(v) {
  return /^(none|transparent|currentColor|inherit|initial|revert|unset)$/i.test(String(v).trim());
}

function analyzeCss(cssText) {
  const root = postcss.parse(cssText || "");
  const rules = [];
  const keyframes = [];
  const fontFaces = [];
  const imports = [];

  root.walk((node) => {
    if (node.type === "atrule") {
      const name = node.name.toLowerCase();
      if (name === "keyframes" || name === "-webkit-keyframes") {
        keyframes.push({ name: node.params.trim(), css: node.toString() });
      } else if (name === "font-face") {
        let family = null;
        node.walkDecls((decl) => {
          if (decl.prop === "font-family") family = decl.value.trim().replace(/['"]/g, "");
        });
        fontFaces.push({ family: family || "(anonymous)", css: node.toString() });
      } else if (name === "import") {
        const m = node.params && node.params.match(/["']?([^"'\s)]+)/);
        if (m && m[1] && !m[1].startsWith("url(")) imports.push(m[1]);
      }
      return;
    }
    if (node.type === "rule") {
      const selector = normalizeSelector(node.selector);
      const declarations = {};
      node.walkDecls((decl) => {
        const prop = decl.prop; // .toLowerCase() NOT needed: scaled props are lowercase already; keep original for readability
        if (!declarations[prop]) declarations[prop] = [];
        declarations[prop].push(decl.value.trim());
      });
      rules.push({ selector, declarations });
    }
  });

  const buttons = rules
    .map((r) => {
      const base = !/:(hover|active|focus|focus-within|focus-visible|disabled|checked|visited|before|after|first|last|nth)/.test(r.selector);
      const isButtonish =
        BUTTON_TYPE_ATTR.test(r.selector) ||
        BUTTON_CLASS_PART.test(r.selector) ||
        (BUTTON_ELEMENT_SELECTOR.test(r.selector) && BUTTON_CLASS_PART.test(r.selector));
      if (!isButtonish) return null;
      let radius = null;
      let padding = null;
      let borderRadiusValues = [];
      if (r.declarations["border-radius"]) {
        borderRadiusValues = r.declarations["border-radius"].map((v) => v.split(/\s+/));
        const flat = borderRadiusValues.flat().filter((v) => /^[\d.]+(px|rem|em|%)$/.test(v));
        if (flat.length === 1) {
          const n = lengthToNumber(flat[0]);
          radius = n === null ? flat[0] : `${n}px`;
        } else if (flat.length === 2 && flat[0] === flat[1]) {
          const n = lengthToNumber(flat[0]);
          radius = n === null ? flat[0] : `${n}px`;
        }
      }
      if (r.declarations["padding"]) {
        const vals = r.declarations["padding"].map((v) => v.split(/\s+/)).flat();
        const px = vals.filter((v) => /^\d+(\.\d+)?(px|rem|em)$/.test(v)).map((v) => lengthToNumber(v));
        if (px.length >= 1 && px.length <= 2 || (px.length >= 2 && px[0] === px[1])) {
          padding = `px ${px[0]}`;
        }
      }
      const hover = /:hover\b/.test(r.selector);
      const active = /:active\b/.test(r.selector);
      const focus = /:focus(?:-within|-visible)?\b/.test(r.selector);
      const disabled = /:disabled\b|\[disabled\]/.test(r.selector);
      return {
        selector: r.selector,
        base,
        state: { hover, active, focus, disabled },
        styles: pickButtonProps(r.declarations),
        radius,
        radiusCss: radius,
        padding,
      };
    })
    .filter(Boolean);

  // Extract tokens from plain rules (non-button and button alike but only base states
  // counted once everywhere — frequency drives the palette).
  const tokens = {
    colors: {}, // cssName -> { color, count }
    fontSizes: {}, // value -> count
    fontWeights: {}, // value -> count
    fontFamilies: {}, // family -> count
    radii: {}, // px -> count
    shadows: {}, // raw -> count
    spacer: {}, // px -> count
    transitions: {
      durations: {}, // ms -> count
      timings: {}, // string -> count
      properties: {}, // string -> count
    },
    usedKeyframeNames: {}, // from animation/animate-* declarations
  };

  for (const rule of rules) {
    for (const [prop, values] of Object.entries(rule.declarations)) {
      for (const value of values) {
        const skip = tokenLooksLikeKeyword(value);
        const colors = isColorCandidate(prop, value) ? collectColorsFrom(prop, value) : [];
        for (const c of colors) {
          const key = `${c.hex}_${c.alpha.toFixed(2)}`;
          if (!tokens.colors[key]) tokens.colors[key] = { color: c, count: 0 };
          tokens.colors[key].count += 1;
        }
        if (RADIUS_PROPS.has(prop) && !skip) {
          const n = extractSingleLength(value);
          if (n !== null) bump(tokens.radii, n);
        }
        if (SHADOW_PROPS.has(prop) && !skip && /rgba?\(|#/.test(value)) {
          bump(tokens.shadows, value.trim());
        }
        if (FONT_FAMILY_PROPS.has(prop) && !skip) {
          const fam = parseFontFamily(value);
          if (fam) bump(tokens.fontFamilies, fam);
        }
        if (FONT_SIZE_PROPS.has(prop) && !skip) {
          const n = extractTopLevelLength(value);
          if (n !== null) bump(tokens.fontSizes, n);
        }
        if (FONT_WEIGHT_PROPS.has(prop) && !skip) {
          const m = String(value).match(/^(400|500|600|700|800|900|bold|light|semibold|medium|bolder|normal)$/);
          if (m) bump(tokens.fontWeights, m[1]);
        }
        if (SPACING_PROPS.has(prop) && !skip) {
          const n = extractSingleLength(value);
          if (n !== null && n > 0 && n <= 128) bump(tokens.spacer, n);
        }
        if (TRANSITION_PROPS.has(prop) && !skip) {
          const dur = String(value).match(/(\d+(?:\.\d+)?(?:ms|s))/g);
          for (const d of dur || []) {
            const ms = d.endsWith("ms") ? parseFloat(d) : parseFloat(d) * 1000;
            if (ms > 0) bump(tokens.transitions.durations, Math.round(ms));
          }
          const timing = String(value).match(/(ease|linear|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\([^)]*\))/);
          if (timing) bump(tokens.transitions.timings, timing[1]);
          const props = String(value).match(/(background|color|transform|opacity|box-shadow|filter|all|border-radius|border[-\w]*)/g);
          for (const p of props || []) bump(tokens.transitions.properties, p);
        }
        if (ANIMATION_PROPS.has(prop)) {
          const names = collectAnimationNames(prop, value);
          for (const n of names) bump(tokens.usedKeyframeNames, n);
        }
      }
    }
  }

  return { rules, buttons, keyframes, fontFaces, imports, tokens };
}

function pickButtonProps(d) {
  const out = {};
  const props = [
    "background",
    "background-color",
    "color",
    "border",
    "border-color",
    "border-width",
    "border-radius",
    "padding",
    "font-size",
    "font-family",
    "font-weight",
    "text-transform",
    "box-shadow",
    "transition",
    "transform",
    "letter-spacing",
    "cursor",
  ];
  for (const p of props) {
    if (d[p] && d[p].length) out[p] = d[p][d[p].length - 1];
  }
  return out;
}

function extractTopLevelLength(value) {
  const parsed = valueParser(value);
  const top = parsed.nodes.filter((n) => n.type === "word" || (n.type === "function" && n.value === "clamp"));
  if (top.length !== 1) return null;
  const node = top[0];
  if (node.type === "word") {
    const n = lengthToNumber(node.value);
    return n === null ? null : Math.round(n * 100) / 100;
  }
  if (node.value === "clamp" && node.nodes.length >= 3) {
    const n = lengthToNumber(valueParser.stringify(node.nodes[1]));
    return n;
  }
  return null;
}

function extractSingleLength(value) {
  if (String(value).includes("calc(") || String(value).includes("var(")) return null;
  const parts = String(value).trim().split(/\s+/);
  if (parts.length === 1) {
    const n = lengthToNumber(parts[0]);
    return n === null ? null : Math.round(n * 100) / 100;
  }
  if (parts.length === 2 && parts[0] === parts[1]) {
    const n = lengthToNumber(parts[0]);
    return n === null ? null : Math.round(n * 100) / 100;
  }
  if (parts.length === 4 && parts[0] === parts[2] && parts[1] === parts[3]) {
    const n = lengthToNumber(parts[0]);
    return n === null ? null : Math.round(n * 100) / 100;
  }
  return null;
}

function parseFontFamily(value) {
  // "Poppins, sans-serif" -> "Poppins"
  const parts = String(value).split(",");
  const first = parts[0] && parts[0].trim().replace(/^["']|["']$/g, "");
  if (!first) return null;
  return first;
}

function bump(map, key) {
  const k = String(key);
  map[k] = (map[k] || 0) + 1;
  return map;
}

function collectAnimationNames(prop, value) {
  const names = [];
  const values = String(value).split(/[\s,]+/).filter(Boolean);
  if (prop === "animation") {
    for (let i = 0; i < values.length; i += 1) {
      if (/^[a-zA-Z_][\w-]*$/.test(values[i]) && !/^(linear|ease|infinite|both|forwards|backwards|[0-9.]+(ms|s)?)$/.test(values[i])) {
        names.push(values[i]);
      }
    }
  } else if (prop === "animation-name") {
    names.push(...values);
  }
  return names.map((n) => n.replace(/^["']|["']$/g, ""));
}

/**
 * Classify a rule as a button candidate; used by analyze-buttons via analyzeCss().buttons.
 * Returns component-level descriptors from the analysis's buttons array.
 */
function summarizeButtons(analysis) {
  const grouped = analysis.buttons.map((b) => {
    const clsMatch = b.selector.match(BUTTON_CLASS_SELECT);
    return { ...b, className: clsMatch ? clsMatch[1] : null };
  });
  const list = [];
  for (const b of grouped) {
    if (!b.base && !b.state.hover) continue;
    list.push({
      selector: b.selector,
      className: b.className,
      base: b.base,
      state: b.state,
      styles: b.styles,
      radius: b.radiusCss,
    });
  }
  return list;
}

module.exports = {
  analyzeCss,
  summarizeButtons,
  pickButtonProps,
  BUTTON_CLASS_SELECT,
};
