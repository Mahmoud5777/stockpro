/**
 * parse-tailwind.js
 *
 * Best-effort extraction of theme tokens from a tailwind.config.{js,ts,cjs,mjs}
 * source. Not a full JS/TS evaluator: it balances braces to grab the
 * theme.extend subtree and converts the handful of object literals we care
 * about into plain JSON. Returns null when the config can't be read.
 */
const fs = require("fs");
const path = require("path");

function balancedSubstring(text, openIdx) {
  let depth = 0;
  let quote = null;
  for (let i = openIdx; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(openIdx, i + 1);
    }
  }
  return null;
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:\\])'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g, (m) => m);
}

function toJsonLiteral(value) {
  let v = value.trim();
  const m = v.match(/^(?:rgb|hsl|rgba|hsla|hwb|lab|lch)\([\s\S]*\)$/);
  if (m) return JSON.stringify(v);
  if (/^[#a-zA-Z0-9.(),%_-]+$/.test(v) === false) return null;
  return JSON.stringify(v.replace(/;/g, ""));
}

function objectToJson(block) {
  // block is like { key: val, ... } — convert to JSON with a mini parser
  const text = block.trim();
  const out = {};
  if (text.startsWith("{")) {
    const inner = balancedSubstring(text, 0);
    if (!inner) return out;
    let body = inner.slice(1, -1);
    // peel off nested object values
    let cursor = 0;
    while (cursor < body.length) {
      let start = body.indexOf(":", cursor);
      if (start === -1 && !body.slice(cursor).trim()) break;
      if (start === -1) {
        cursor = body.length;
        continue;
      }
      const keyPart = body.slice(cursor, start).trim().replace(/^['"`]|['"`]$/g, "");
      const rest = body.slice(start + 1);
      let end = rest.length;
      if (rest.trimStart().startsWith("{")) {
        const depth = findClosing(rest);
        if (depth !== null) {
          end = depth + 1;
        }
      } else {
        // Commas inside font arrays and quoted shadows are not separators.
        const first = splitTopLevel(rest)[0];
        if (first !== undefined) end = rest.indexOf(first) + first.length;
      }
      const rawVal = rest.slice(0, end).trim();
      if (rawVal) {
        const parsed = parseValue(rawVal);
        if (parsed !== undefined) out[keyPart] = parsed;
      }
      cursor = start + 1 + end;
      const after = body.slice(start + 1 + end);
      const commaIdx = after.indexOf(",");
      if (commaIdx === -1) cursor = body.length;
      else cursor = start + 1 + end + commaIdx + 1;
    }
  }
  return out;
}

function findClosing(text) {
  let depth = 0;
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return null;
}

function splitTopLevel(value) {
  const parts = [];
  let quote = null;
  let depth = 0;
  let cur = "";
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (quote) {
      cur += ch;
      if (ch === quote && value[i - 1] !== "\\") quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "[" || ch === "{") depth += 1;
    else if (ch === "]" || ch === "}") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function parseValue(raw) {
  let v = raw.trim().replace(/,$/, "");
  if (v.startsWith("[") || v.startsWith("{")) {
    if (v.startsWith("{") && findClosing(v) === v.length - 1) {
      return objectToJson(v);
    }
    if (v.startsWith("[") && v.endsWith("]")) {
      const inner = v.slice(1, -1);
      return splitTopLevel(inner)
        .map((x) => x.trim().replace(/^['"`]|['"`]$/g, "") || undefined)
        .filter((x) => x !== undefined);
    }
    return undefined;
  }
  const q = v.match(/^(['"`])([\s\S]*)\1$/);
  if (q) return q[2];
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

/** Extract the `theme.extend` subtree from a tailwind config source. */
function extractTheme(configText, pathTo = ["theme"]) {
  const text = stripComments(configText);
  const idx = text.indexOf("theme:");
  if (idx === -1) {
    const def = text.match(/(?:theme|spacing|fontFamily)\.extend/);
    if (!def) return null;
  }
  let themeStart = text.indexOf("theme:");
  if (themeStart === -1) return null;
  const themeBlock = balancedSubstring(text, text.indexOf("{", themeStart));
  if (!themeBlock) return null;
  const extendIdx = themeBlock.indexOf("extend:");
  if (extendIdx === -1) {
    return objectToJson(themeBlock);
  }
  const open = themeBlock.indexOf("{", extendIdx);
  const extendBlock = balancedSubstring(themeBlock, open);
  return objectToJson(extendBlock);
}

/**
 * Read a tailwind config (file path or raw source) and return normalized hints
 * { colors, fontFamily, borderRadius, boxShadow, keyframes } (all optional).
 */
function readTailwindConfig(input) {
  if (!input) return null;
  const isPath = !input.includes("\n") && !input.includes("theme:") && fs.existsSync(input);
  const src = isPath ? fs.readFileSync(input, "utf8") : input;
  const theme = extractTheme(src);
  if (!theme) return null;
  const hints = {};
  for (const key of ["colors", "fontFamily", "borderRadius", "boxShadow", "keyframes", "animation", "fontSize", "screens"]) {
    if (theme[key] && typeof theme[key] === "object") hints[key] = theme[key];
  }
  if (!Object.keys(hints).length) return null;
  if (hints.fontFamily && Array.isArray(hints.fontFamily)) {
    hints.fontFamily = { sans: hints.fontFamily };
  }
  return hints;
}

module.exports = { readTailwindConfig, extractTheme, objectToJson, parseValue };
