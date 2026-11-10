/**
 * Design-token assembly: turns the raw CSS analysis into a normalized,
 * design-system shaped `design.json` — palette with roles, typography,
 * radius/shadow/spacing scales, button tones and animations.
 */
const { normalizeColor, hslToRgb, rgbToHex, displayColor, mixColor, colorDistance, lengthToNumber } = require("./color");
const { analyzeButtons } = require("./analyze-buttons");

const MAX_CLUSTERS = 5;

function topByCount(map, max = 12) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([key, count]) => ({ value: key, count }));
}

function vectorOf(color) {
  const h = (color.hsl.h * Math.PI) / 180;
  return [Math.cos(h), Math.sin(h), color.hsl.s, color.hsl.l];
}

function kmeans(items, k, iters = 18) {
  const weighted = [];
  let total = 0;
  for (const item of items) {
    weighted.push({ vec: vectorOf(item.color), color: item.color, weight: item.count });
    total += item.count;
  }
  if (items.length < 2) {
    return items.map((i) => ({ ...i.color, weight: i.count / total }));
  }
  const kk = Math.min(k, items.length);
  const centroids = weighted.slice(0, kk).map((w) => w.vec.slice());
  for (let iter = 0; iter < iters; iter += 1) {
    const assign = weighted.map((w) => {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < centroids.length; c += 1) {
        const d = vecDist(w.vec, centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      return best;
    });
    const sums = centroids.map(() => [0, 0, 0, 0]);
    const counts = centroids.map(() => 0);
    for (let i = 0; i < weighted.length; i += 1) {
      const c = assign[i];
      counts[c] += weighted[i].weight;
      for (let d = 0; d < 4; d += 1) sums[c][d] += weighted[i].vec[d] * weighted[i].weight;
    }
    for (let c = 0; c < centroids.length; c += 1) {
      if (counts[c] === 0) {
        centroids[c] = weighted[iter % weighted.length].vec.slice();
        continue;
      }
      centroids[c] = sums[c].map((s) => s / counts[c]);
    }
  }
  const clusters = centroids.map(() => ({ weight: 0, members: [] }));
  for (let i = 0; i < weighted.length; i += 1) {
    let best = 0;
    let bestD = Infinity;
    for (let c = 0; c < centroids.length; c += 1) {
      const d = vecDist(weighted[i].vec, centroids[c]);
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    clusters[best].weight += weighted[i].weight;
    clusters[best].members.push(weighted[i].color);
  }
  const hue = Math.atan2(centroids[0][1], centroids[0][0]) * (180 / Math.PI);
  void hue;
  return clusters
    .map((c, idx) => {
      if (c.weight === 0) return null;
      const vec = centroids[idx];
      const color = {
        rgb: {
          ...hslToRgb((Math.atan2(vec[1], vec[0]) * 180) / Math.PI, Math.min(1, vec[2]), Math.min(1, vec[3])),
          a: 1,
        },
      };
      const hsl = { h: ((Math.atan2(vec[1], vec[0]) * 180) / Math.PI + 360) % 360, s: Math.min(1, vec[2]), l: Math.min(1, vec[3]) };
      color.hsl = hsl;
      color.hex = rgbToHex(color.rgb.r, color.rgb.g, color.rgb.b);
      color.alpha = 1;
      color.weight = c.weight / total;
      return color;
    })
    .filter(Boolean)
    .sort((a, b) => b.weight - a.weight);
}

function vecDist(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += (a[i] - b[i]) * (a[i] - b[i]);
  return Math.sqrt(s);
}

function isLight(color) {
  return color.hsl.l >= 0.78;
}

function isDark(color) {
  return color.hsl.l <= 0.3;
}

function isSaturated(color) {
  return color.hsl.s >= 0.09;
}

function hueOf(color) {
  return color.hsl.h;
}

function buildPalette(colorMap) {
  if (Object.keys(colorMap).length === 0) {
    colorMap = Object.fromEntries(["#f7f8fb", "#0f1424", "#2a48e6", "#ffffff"].map((value) => [value, { color: normalizeColor(value), count: 1 }]));
  }
  const clusters = kmeans(
    Object.entries(colorMap).map(([key, v]) => ({ ...v, key })),
    MAX_CLUSTERS
  );
  const entries = clusters.map((c) => ({ ...c, key: c.hex }));

  const falling = entries.filter((e) => isLight(e) && e.weight >= 0.05);
  const rising = entries.filter((e) => isDark(e) && e.weight >= 0.05);
  const background = falling.length ? falling[0] : entries[0];
  const text = background && isLight(background)
    ? (rising[0] || entries[1] || background)
    : (falling[0] || entries[1] || background);

  const rest = entries.filter(
    (e) => e !== background && e !== text && isSaturated(e)
  );
  const primary = rest[0] || background;
  const secondary = rest.find((c) => c !== primary && c !== background && c !== text) || rest[1] || primary;
  let accent = rest.find(
    (c) => c !== primary && c !== secondary && Math.min(Math.abs(hueOf(c) - hueOf(primary)), 360 - Math.abs(hueOf(c) - hueOf(primary))) > 40
  );
  if (!accent) accent = secondary;

  const surfaceBase = entries.find(
    (e) => e !== background && isLight(e) && e.weight >= 0.03 && e !== text
  );
  const surface = surfaceBase || mixColor(background, "white", 0.9);
  const muted = mixColor(background, "black", 0.55);

  const status = {
    success: entries.find((e) => isSaturated(e) && e.hsl.h >= 78 && e.hsl.h <= 168 && e.weight > 0.02),
    warning: entries.find((e) => isSaturated(e) && e.hsl.h >= 30 && e.hsl.h <= 60 && e.weight > 0.02),
    danger: entries.find((e) => isSaturated(e) && (e.hsl.h >= 340 || e.hsl.h <= 12) && e.weight > 0.02),
  };

  const ramp = (c) => ({
    DEFAULT: displayColor(c),
    hover: displayColor(mixColor(c, "black", 0.1)),
    muted: displayColor(mixColor(c, isLight(c) ? "black" : "white", 0.35)),
    soft: displayColor(mixColor(c, "white", 0.85)),
  });

  const palette = {
    background: { DEFAULT: displayColor(background) },
    surface: { DEFAULT: displayColor(surface) },
    text: { DEFAULT: displayColor(text), muted: displayColor(muted) },
    primary: ramp(primary),
    secondary: ramp(secondary),
    accent: { DEFAULT: displayColor(accent) },
  };
  for (const [k, c] of Object.entries(status)) {
    if (c) palette[k] = { DEFAULT: displayColor(c) };
  }
  return { palette, clusters: entries };
}

function buildRadius(radiiMap) {
  const list = Object.entries(radiiMap)
    .map(([px, count]) => ({ px: parseFloat(px), count }))
    .filter((r) => r.px > 0)
    .sort((a, b) => b.count - a.count);
  if (!list.length) {
    return { sm: "0.375rem", md: "0.5rem", lg: "0.75rem", full: "9999px" };
  }
  const representative = [];
  for (const r of list) {
    if (representative.length >= 4) break;
    if (!representative.some((x) => Math.abs(x - r.px) < 1.5)) representative.push(r.px);
  }
  representative.sort((a, b) => a - b);
  const isPill = list.some((r) => r.px >= 999);
  const names = ["sm", "md", "lg"];
  const all = {};
  for (let i = 0; i < representative.length; i += 1) {
    const name = names[i] || `x${i - 2}`;
    all[name] = `${representative[i]}px`;
  }
  if (isPill) all.full = "9999px";
  else if (representative.length && representative[0] <= 4) {
    all.full = "9999px";
  }
  return Object.keys(all).length ? all : { sm: "0.375rem", md: "0.5rem", lg: "0.75rem", full: "9999px" };
}

function buildShadow(shadowMap) {
  const list = Object.entries(shadowMap).sort((a, b) => b[1] - a[1]).map(([v]) => v);
  if (!list.length) {
    return { sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)", md: "0 4px 12px -2px rgb(0 0 0 / 0.12)" };
  }
  const out = {};
  const names = ["md", "sm", "lg"];
  for (let i = 0; i < Math.min(list.length, 3); i += 1) {
    out[names[names.length - 1 - i]] = list[i];
  }
  if (!out.md) out.md = out.sm || "none";
  if (!out.sm) out.sm = out.md;
  return out;
}

function buildSpacing(spacerMap) {
  const nums = Object.entries(spacerMap)
    .map(([k, c]) => ({ n: parseFloat(k), count: c }))
    .filter((x) => x.n > 0 && x.n <= 128)
    .sort((a, b) => b.count - a.count);
  const picked = [];
  for (const x of nums) {
    if (picked.length >= 8) break;
    if (!picked.some((p) => Math.abs(p - x.n) < 2)) picked.push(x.n);
  }
  picked.sort((a, b) => a - b);
  const base = picked[0] || 4;
  let scale = picked.slice(0, 8);
  const wanted = [4, 8, 12, 16, 24, 32, 48, 64];
  if (scale.length < 4) {
    scale = wanted.filter((w) => !scale.includes(w)).concat(scale).sort((a, b) => a - b);
  }
  return { base: Math.max(1, Math.round(base)), scale: scale.slice(0, 8) };
}

function buildTypography(fontFamilies, fontSizes, fontWeights, fontFaces) {
  const fams = topByCount(fontFamilies, 6).map((f) => f.value);
  const faceNames = (fontFaces || []).map((f) => f.family);
  for (const n of faceNames) if (!fams.includes(n)) fams.push(n);

  const sizes = topByCount(fontSizes, 10).map((f) => parseFloat(f.value)).sort((a, b) => a - b);
  const weights = topByCount(fontWeights, 6).map((w) => w.value);

  const heading = fams[0] || "inherit";
  const body = fams[1] || fams[0] || "inherit";
  const getSize = (cls, fallback) => {
    const idx = { xs: 0, sm: 1, base: 2, lg: 3, xl: 4, "2xl": 5, "3xl": 6 }[cls];
    if (idx !== undefined && sizes[idx] !== undefined) return `${sizes[idx]}px`;
    return fallback;
  };
  return {
    families: { display: heading, body },
    weights: {
      normal: weights.includes("400") || weights.includes("normal") ? "400" : "400",
      medium: weights.includes("500") ? "500" : undefined,
      semibold: weights.includes("600") || weights.includes("semibold") ? "600" : undefined,
      bold: weights.includes("700") || weights.includes("bold") ? "700" : "700",
    },
    sizes: {
      xs: getSize("xs", "0.75rem"),
      sm: getSize("sm", "0.875rem"),
      base: getSize("base", "1rem"),
      lg: getSize("lg", "1.125rem"),
      xl: getSize("xl", "1.25rem"),
      "2xl": getSize("2xl", "1.5rem"),
      "3xl": getSize("3xl", "1.875rem"),
    },
    // readable fallback family when nothing was found
  };
}

function buildAnimations(keyframes, usedKeyframes, transitionTokens) {
  const kf = (keyframes || []).map((k) => ({ name: k.name, css: k.css }));
  const used = Object.entries(usedKeyframes || {}).map(([n]) => n);
  const kept = kf.filter((k) => used.includes(k.name));
  const rest = kf.filter((k) => !used.includes(k.name));
  const all = [...kept, ...rest.slice(0, Math.max(0, 6 - kept.length))];

  const durations = Object.entries(transitionTokens?.durations || {})
    .map(([v, c]) => ({ value: parseInt(v, 10), count: c }))
    .sort((a, b) => a.value - b.value);
  const timings = Object.entries(transitionTokens?.timings || {}).sort((a, b) => b[1] - a[1]).map(([v]) => v);
  const properties = Object.entries(transitionTokens?.properties || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([v]) => v);

  const defaultDuration = durations.length ? durations[0].value : 250;
  const defaultTiming = timings[0] || "ease-in-out";

  const utilities = {};
  for (const k of kept) {
    utilities[`animate-${k.name}`] = `${k.name} ${defaultDuration}ms ${defaultTiming} both`;
  }

  return {
    keyframes: all,
    utilities,
    transitions: {
      durations: durations.slice(0, 4).map((d) => d.value),
      defaultDuration,
      timings: timings.slice(0, 3),
      defaultEasing: defaultTiming,
      properties: properties.length ? properties : ["all"],
    },
  };
}

function sourceDescriptor(source) {
  return {
    type: source.type || "dir",
    location: source.location || "",
    framework: source.framework || "next",
    styles: source.styles || ["css"],
    extractedAt: new Date().toISOString(),
  };
}

function buildDesign(source, analysis, extras = {}) {
  const { palette, clusters } = buildPalette(analysis.tokens.colors);
  // Explicit component roles carry stronger evidence than frequency clusters.
  for (const rule of analysis.rules || []) {
    const value = (property) => rule.declarations[property]?.at(-1);
    const background = value("background-color") || value("background");
    if (/^(body|html)$/.test(rule.selector)) {
      if (normalizeColor(background)) palette.background = { DEFAULT: background };
      if (normalizeColor(value("color"))) palette.text.DEFAULT = value("color");
    }
    if (/^\.card$/.test(rule.selector) && normalizeColor(background)) palette.surface = { DEFAULT: background };
    if (/^\.btn-primary$/.test(rule.selector) && normalizeColor(background)) palette.primary = { DEFAULT: background, ...rampOf(background) };
    if (/^\.sidebar$/.test(rule.selector) && normalizeColor(background)) palette.sidebar = { DEFAULT: background };
  }
  const radius = buildRadius(analysis.tokens.radii);
  const shadow = buildShadow(analysis.tokens.shadows);
  const spacing = buildSpacing(analysis.tokens.spacer);
  const typography = buildTypography(
    analysis.tokens.fontFamilies,
    analysis.tokens.fontSizes,
    analysis.tokens.fontWeights,
    analysis.fontFaces
  );
  const animations = buildAnimations(analysis.keyframes, analysis.tokens.usedKeyframeNames, analysis.tokens.transitions);
  // Merge explicit tailwind-config hints when present (repo mode).
  if (extras.tailwind) mergeTailwindHints(palette, typography, radius, shadow, animations, extras.tailwind);
  const buttonResult = analyzeButtons(analysis, palette);

  const design = {
    source: sourceDescriptor(source),
    palette,
    typography,
    radius,
    shadow,
    spacing,
    buttons: buttonResult.tones,
    animations,
    confidence: {
      colors: Object.keys(analysis.tokens.colors).length,
      radii: Object.keys(analysis.tokens.radii).length,
      shadows: Object.keys(analysis.tokens.shadows).length,
      typography: Object.keys(analysis.tokens.fontFamilies).length,
      buttons: buttonResult.buttonsAnalyzed,
      keyframes: (analysis.keyframes || []).length,
      clusters: clusters.length,
    },
    meta: {
      originRules: analysis.rules.length,
      tailwindHints: Object.keys(extras.tailwind || {}),
      fidelity: "design-tokens",
    },
  };

  return { design, clusters };
}

function mergeTailwindHints(palette, typography, radius, shadow, animations, tw) {
  const colors = tw.colors;
  for (const name of ["primary", "secondary", "accent", "background", "surface", "success", "warning", "danger"]) {
    const hint = colors && (colors[name] || (name === "primary" && colors.brand));
    const c = typeof hint === "object" && hint ? hint.DEFAULT || hint[600] || hint[500] : hint;
    if (typeof c === "string" && palette[name]) {
      const parsed = normalizeColor(c);
      if (parsed) palette[name] = { DEFAULT: c, ...rampOf(c) };
    }
    if (typeof c === "string" && !palette[name]) {
      palette[name] = { DEFAULT: c, ...rampOf(c) };
    }
  }
  if (colors?.surface?.light && !colors.background) {
    palette.background = { DEFAULT: colors.surface.light };
    // A light/dark surface pair describes the application backdrop in this prototype.
    palette.surface = { DEFAULT: "#ffffff" };
  }
  if (tw.fontFamily) {
    const fam = tw.fontFamily.sans || tw.fontFamily.body || tw.fontFamily.display;
    if (Array.isArray(fam) && fam.length) typography.families.body = fam;
    if (tw.fontFamily.display) typography.families.display = tw.fontFamily.display;
  }
  if (tw.borderRadius) {
    for (const k of ["sm", "md", "lg", "full"]) {
      if (tw.borderRadius[k]) radius[k] = tw.borderRadius[k];
    }
  }
  if (tw.boxShadow) {
    for (const k of ["sm", "md", "lg"]) {
      if (tw.boxShadow[k]) shadow[k] = tw.boxShadow[k];
    }
  }
  for (const [name, frames] of Object.entries(tw.keyframes || {})) {
    const css = `@keyframes ${name} {\n` + Object.entries(frames).map(([step, styles]) => {
      const declarations = Object.entries(styles).map(([property, value]) =>
        `  ${property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${value};`).join("\n");
      return `${step} {\n${declarations}\n}`;
    }).join("\n") + "\n}";
    animations.keyframes = animations.keyframes.filter((frame) => frame.name !== name);
    animations.keyframes.push({ name, css });
  }
  for (const [name, value] of Object.entries(tw.animation || {})) animations.utilities[`animate-${name}`] = value;
}

function rampOf(c) {
  const base = normalizeColor(c);
  if (!base) return {};
  return {
    hover: displayColor(mixColor(base, "black", 0.1)),
    muted: displayColor(mixColor(base, "white", 0.3)),
    soft: displayColor(mixColor(base, "white", 0.85)),
    fg: base.hsl.l < 0.6 ? "#ffffff" : "#000000",
  };
}

module.exports = { buildDesign, buildPalette, buildRadius, buildTypography, buildAnimations, topByCount, lengthToNumber };
