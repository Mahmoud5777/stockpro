/**
 * acquire-source.js
 *
 * Normalizes the user input into an analyzed source:
 *
 *   - GitHub repo (https://github.com/{o}/{r} or {o}/{r})
 *       -> downloads the codeload zip (needs no git binary), unzips with lib/zip.js
 *   - website URL (http(s)://)
 *       -> fetches the page HTML + linked/inline CSS (+ one level of @import)
 *   - local directory
 *       -> walks it; parses *.css and looks for tailwind config / package.json
 *
 * Returns:
 *   { type, location, framework, styles, files:{relOnlyPath:Buffer}, css:[text] }
 */
const fs = require("fs");
const path = require("path");
const { readZip } = require("./zip");

function detectType(input) {
  const s = String(input).trim();
  if (/^https?:\/\//i.test(s)) {
    if (/github\.com\//i.test(s)) return "repo";
    return "url";
  }
  if (/^[\w.-]+\/[\w.-]+$/.test(s) && !s.includes("\\") && fs.existsSync(s) === false) {
    return "repo";
  }
  return "dir";
}

function parseRepo(input) {
  const s = String(input).trim().replace(/\.git$/, "");
  let owner, repo, ref;
  const gh = s.match(/github\.com[/:]([\w.-]+)\/([\w.-]+)(?:\/tree\/([^\s/]+))?/i);
  if (gh) {
    owner = gh[1];
    repo = gh[2];
    ref = gh[3];
  } else {
    const parts = s.split("/");
    owner = parts[0];
    repo = parts[1];
  }
  return { owner, repo, ref };
}

async function acquireRepo(input) {
  const { owner, repo, ref } = parseRepo(input);
  const refs = ref ? [ref] : ["HEAD", "main", "master"];
  let archive = null;
  let usedRef = null;
  for (const r of refs) {
    const url = `https://codeload.github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/zip/${encodeURIComponent(r)}`;
    try {
      const res = await fetch(url, { redirect: "follow" });
      if (res.ok) {
        archive = Buffer.from(await res.arrayBuffer());
        usedRef = r;
        break;
      }
    } catch {
      /* try next ref */
    }
  }
  if (!archive) {
    throw new Error(`Unable to download repo ${owner}/${repo}`);
  }
  const files = readZip(archive);
  const stripped = {};
  let prefix = null;
  for (const rel of Object.keys(files)) {
    if (rel.endsWith("/")) continue;
    const parts = rel.split("/");
    if (parts.length > 1 && rel !== "pack.json") {
      prefix = parts[0];
      break;
    }
  }
  for (const rel of Object.keys(files)) {
    if (rel.endsWith("/")) continue;
    if (prefix && rel.startsWith(`${prefix}/`)) {
      stripped[rel.slice(prefix.length + 1)] = files[rel];
    } else {
      stripped[rel] = files[rel];
    }
  }
  const pair = await inspectFiles(stripped);
  return {
    type: "repo",
    location: `https://github.com/${owner}/${repo}`,
    ref: usedRef,
    framework: pair.framework,
    styles: pair.styles,
    files: stripped,
    css: pair.css,
    tailwindConfig: pair.tailwindConfig,
  };
}

async function acquireUrl(input) {
  const page = await fetchWithFallback(input);
  const html = Buffer.from(page).toString("utf8");
  const cssUrls = [];
  const inlineCss = [];
  const linkRe = /<link\b[^>]*>|<style\b[^>]*>[\s\S]*?<\/style>/gi;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const chunk = m[0];
    if (/^<link/i.test(chunk)) {
      const href = (chunk.match(/href=["']([^"']+)["']/i) || [])[1];
      const rel = (chunk.match(/rel=["']([^"']+)["']/i) || [])[1] || "";
      const as = (chunk.match(/as=["']([^"']+)["']/i) || [])[1] || "";
      if (href && /stylesheet|style/i.test(rel) && !/preload/i.test(rel)) {
        cssUrls.push(resolveUrl(href, input));
      } else if (href && as === "style") {
        cssUrls.push(resolveUrl(href, input));
      }
    } else if (/^<style/i.test(chunk)) {
      const body = chunk.replace(/^<style[^>]*>/i, "").replace(/<\/style>$/i, "");
      inlineCss.push(body);
    }
  }

  const css = [...inlineCss];
  const seen = new Set();
  for (const url of cssUrls) {
    if (seen.has(url)) continue;
    seen.add(url);
    try {
      const text = await fetchWithFallback(url);
      const s = Buffer.from(text).toString("utf8");
      css.push(s);
      for (const imp of collectImports(s)) {
        if (seen.has(imp)) continue;
        seen.add(imp);
        try {
          const impText = await fetchWithFallback(resolveUrl(imp, url));
          css.push(Buffer.from(impText).toString("utf8"));
        } catch {
          /* ignore missing import target */
        }
      }
    } catch {
      /* ignore stylesheet load errors */
    }
  }

  return {
    type: "url",
    location: input,
    framework: "url",
    styles: css.length ? ["css"] : [],
    files: { "index.html": Buffer.from(html) },
    css,
  };
}

async function fetchWithFallback(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; site-to-spack/0.1 design-extractor)",
      accept: "text/html,application/xhtml+xml,text/css,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.arrayBuffer();
}

function resolveUrl(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function collectImports(cssText) {
  const out = [];
  const re = /@import\s+(?:url\()?\s*["']?([^"');]+)["']?/g;
  let m;
  while ((m = re.exec(cssText)) !== null) out.push(m[1]);
  return out;
}

async function acquireDir(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Source directory not found: ${dir}`);
  }
  const files = {};
  const cssTexts = [];
  let tailwindConfig = null;
  let packageJson = null;
  walk(dir, (rel, abs) => {
    files[rel] = fs.readFileSync(abs);
    const lower = rel.toLowerCase();
    if (lower.endsWith(".css")) cssTexts.push(fs.readFileSync(abs, "utf8"));
    if (/tailwind\.config\.(js|ts|cjs|mjs)$/.test(rel)) tailwindConfig = abs;
    if (rel === "package.json") packageJson = abs;
  });
  return {
    type: "dir",
    location: dir,
    framework: packageJson ? sniffFramework(fs.readFileSync(packageJson, "utf8")) : "static",
    styles: tailwindConfig ? ["tailwind", ...(cssTexts.length ? ["css"] : [])] : ["css"],
    files,
    css: cssTexts,
    tailwindConfig,
    packageJson,
  };
}

function walk(dir, cb, rel = "") {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".next", "dist", "build", "target"].includes(entry.name) || entry.isSymbolicLink()) continue;
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, cb, r);
    else cb(r, abs);
  }
}

function sniffFramework(packageJsonText) {
  try {
    const pkg = JSON.parse(packageJsonText);
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    if (deps["next"]) return "next";
    if (deps.vue || deps["@vue/*"]) return "vue";
    if (deps.react) return "react";
    if (deps.angular) return "angular";
    if (deps.svelte) return "svelte";
    return "static";
  } catch {
    return "static";
  }
}

async function inspectFiles(files) {
  let css = [];
  let tailwindConfig = null;
  let packageJson = null;
  const tailwindBlock = [];
  for (const rel of Object.keys(files)) {
    const lower = rel.toLowerCase();
    if (lower.endsWith(".css")) {
      if (rel.includes("node_modules") || rel.includes("/dist/") || rel.includes("lib/")) continue;
      css.push(files[rel].toString("utf8"));
    }
    if (/tailwind\.config\.(js|ts|cjs|mjs)$/.test(rel) && !rel.includes("node_modules")) {
      if (!tailwindConfig) tailwindConfig = files[rel].toString("utf8");
    }
    if (rel === "package.json") packageJson = files[rel].toString("utf8");
  }
  return {
    framework: packageJson ? sniffFramework(packageJson) : "static",
    styles: tailwindConfig ? ["tailwind", ...(css.length ? ["css"] : [])] : ["css"],
    css,
    tailwindConfig,
  };
}

/**
 * Detect the input type and acquire the source into {source, files, css, tailwindConfig}.
 */
async function acquire(input) {
  const type = detectType(input);
  if (type === "repo") return acquireRepo(input);
  if (type === "url") return acquireUrl(input);
  return acquireDir(input);
}

module.exports = { acquire, detectType, parseRepo, acquireRepo, acquireUrl, acquireDir, sniffFramework, collectImports };
