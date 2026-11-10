/**
 * Color parsing and conversion helpers (no external deps).
 *
 * - normalizeColor(value) -> a canonical { name, rgb, hsl, hex, count } or null
 * - rgbToHsl / hslToRgb / rgbToHex
 * - colorDistance (Lab-scaled, via CIE76 on an HSL expansion)
 */
const KEYWORD_HEX = {
  transparent: "rgba(0,0,0,0)",
  currentColor: null,
  inherit: null,
  initial: null,
  revert: null,
  unset: null,
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  green: "#008000",
  blue: "#0000ff",
  gray: "#808080",
  grey: "#808080",
  silver: "#c0c0c0",
  maroon: "#800000",
  yellow: "#ffff00",
  olive: "#808000",
  lime: "#00ff00",
  aqua: "#00ffff",
  cyan: "#00ffff",
  teal: "#008080",
  navy: "#000080",
  fuchsia: "#ff00ff",
  magenta: "#ff00ff",
  purple: "#800080",
  orange: "#ffa500",
  pink: "#ffc0cb",
  brown: "#a52a2a",
  gold: "#ffd700",
  violet: "#ee82ee",
  indigo: "#4b0082",
  crimson: "#dc143c",
  salmon: "#fa8072",
  coral: "#ff7f50",
  khaki: "#f0e68c",
  beige: "#f5f5dc",
  ivory: "#fffff0",
  honeydew: "#f0fff0",
  lavender: "#e6e6fa",
  tan: "#d2b48c",
  skyblue: "#87ceeb",
  whitesmoke: "#f5f5f5",
  sienna: "#a0522d",
  steelblue: "#4682b4",
  darkslateblue: "#483d8b",
  slateblue: "#6a5acd",
  "slate gray": "#708090",
  slategray: "#708090",
  darkslategray: "#2f4f4f",
  lightslategray: "#778899",
};
const KEYWORD_LOOKUP = new Map(
  Object.entries(KEYWORD_HEX).map(([k, v]) => [k.replace(/[_\s]+/g, ""), v])
);

function clamp8(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function clamp1(n) {
  return Math.max(0, Math.min(1, n));
}

function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3 || h.length === 4) {
    h = [...h].map((c) => c + c).join("");
  }
  if (h.length !== 6 && h.length !== 8) return null;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => clamp8(v).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return { h, s, l };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return {
    r: clamp8((rgb[0] + m) * 255),
    g: clamp8((rgb[1] + m) * 255),
    b: clamp8((rgb[2] + m) * 255),
  };
}

/** Far-number parse: "5px" -> 5, "0.75rem" -> 12 (assuming 16px root). */
function lengthToNumber(value, key) {
  const m = String(value).trim().match(/^(-?\d*\.?\d+)(px|rem|em)$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (m[2] === "rem" || m[2] === "em") return Math.round(n * 16 * 100) / 100;
  return n;
}

/**
 * Parse a color token from a CSS value.
 * Returns normalized { rgb:{r,g,b,a}, hsl:{h,s,l}, hex, name, alpha } or null.
 */
function normalizeColor(value) {
  const raw = String(value).trim();
  if (!raw) return null;
  if (/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) {
    const rgb = hexToRgb(raw);
    if (!rgb) return null;
    return makeColor(rgb);
  }
  if (/^(rgb|rgba|hsl|hsla|hwb|lab|lch)\(/i.test(raw)) {
    const end = raw.indexOf("(");
    const fn = raw.slice(0, end).toLowerCase();
    const body = raw.slice(end + 1, raw.length - (raw.endsWith(")") ? 1 : 0));
    const parts = body.split(/\s*\/\s*/);
    let main = parts[0];
    let alpha = parts.length > 1 ? parseFloat(parts[1]) : undefined;
    if (alpha === undefined || Number.isNaN(alpha) || alpha === "") {
      alpha = 1;
    }
    if (/^(rgb|rgba)$/.test(fn)) {
      const nums = main.split(/[\s,]+/).filter(Boolean).map(parseFloat);
      if (nums.length < 3 || nums.some(Number.isNaN)) return null;
      const { r, g, b } = { r: nums[0], g: nums[1], b: nums[2] };
      return makeColor({ r, g, b, a: clamp1(alpha) });
    }
    if (/^(hsl|hsla)$/.test(fn)) {
      const nums = main
        .replace(/deg/g, "")
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((s) => parseFloat(s.replace("%", "")));
      if (nums.length < 3 || nums.some(Number.isNaN)) return null;
      const h = nums[0];
      const s = clamp1(nums[1] / 100);
      const l = clamp1(nums[2] / 100);
      const rgb = hslToRgb(h, s, l);
      return makeColor({ ...rgb, a: clamp1(alpha) });
    }
    if (fn === "hwb") {
      const nums = main.split(/[\s,]+/).filter(Boolean).map((s) => parseFloat(s.replace("%", "")));
      if (nums.length < 3 || nums.some(Number.isNaN)) return null;
      const h = nums[0];
      const w = nums[1] / 100;
      const b = nums[2] / 100;
      const rgb = { r: 0, g: 0, b: 0 };
      const max = 1 - Math.min(w + b, 1) + w;
      const hh = ((h % 360) + 360) % 360;
      const seg = hh / 60;
      const i = Math.floor(seg);
      const f = seg - i;
      const p = max * (1 - w);
      const w2 = max * (1 - w * f);
      const m3 = max * (1 - w * (1 - f));
      const q = Math.max(p, w2, m3 * (i % 2)) + w - Math.max(p, w2, m3) * (i % 2);
      const variants = [
        [max, m3, p],
        [w2, max, p],
        [p, max, m3],
        [p, w2, max],
        [m3, p, max],
        [max, p, w2],
      ];
      const chosen = variants[i];
      rgb.r = clamp8(chosen[0] * 255);
      rgb.g = clamp8(chosen[1] * 255);
      rgb.b = clamp8(chosen[2] * 255);
      return makeColor({ ...rgb, a: clamp1(alpha) });
    }
    return null;
  }
  const kw = KEYWORD_LOOKUP.get(raw.replace(/[_\s]+/g, "").toLowerCase());
  if (kw === null || kw === undefined) {
    // Unknown keyword: not a real reusable color (e.g. named brand colors are rare).
    return null;
  }
  if (kw === "rgba(0,0,0,0)") {
    return makeColor({ r: 0, g: 0, b: 0, a: 0 });
  }
  return normalizeColor(kw);
}

function makeColor({ r, g, b, a = 1 }) {
  const rgba = { r: clamp8(r), g: clamp8(g), b: clamp8(b), a: clamp1(a) };
  const hsl = rgbToHsl(rgba.r, rgba.g, rgba.b);
  return {
    rgb: rgba,
    hsl,
    hex: rgbToHex(rgba.r, rgba.g, rgba.b),
    name: null,
    alpha: rgba.a,
  };
}

/** Scaled perceptual-ish distance in HSL space; 0..~260. */
function colorDistance(a, b) {
  if (!a || !b) return 1000;
  const da = a.hsl;
  const db = b.hsl;
  const dH = Math.min(Math.abs(da.h - db.h), 360 - Math.abs(da.h - db.h)) / 180;
  return (
    dH * dH * 220 +
    (da.s - db.s) * (da.s - db.s) * 120 +
    (da.l - db.l) * (da.l - db.l) * 100
  );
}

/** Mix a color toward white or black to build a token ramp. */
function mixColor(color, target, t) {
  const c = color.rgb;
  let r, g, b;
  if (target === "white") {
    r = c.r + (255 - c.r) * t;
    g = c.g + (255 - c.g) * t;
    b = c.b + (255 - c.b) * t;
  } else {
    r = c.r * (1 - t);
    g = c.g * (1 - t);
    b = c.b * (1 - t);
  }
  return makeColor({ r, g, b, a: c.a });
}

function displayColor(color) {
  const a = color ? color.alpha : 1;
  const hex = color ? color.hex : "#000000";
  return a >= 0.999 ? hex : color ? `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${a})` : hex;
}

module.exports = {
  normalizeColor,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  colorDistance,
  mixColor,
  lengthToNumber,
  clamp8,
  displayColor,
};