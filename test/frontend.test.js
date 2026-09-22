const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.join(__dirname, "..");
const { augmentForFrontend } = require(path.join(root, "generate-frontend.js"));

function temporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "stockpro-fe-"));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

test("augments entities with frontend type and label info", () => {
  const entity = augmentForFrontend({
    name: "Customer",
    module: "crm",
    idType: "Long",
    urlPath: "clients",
    fields: [{ name: "fullName", javaType: "String", required: true }],
    manyToOne: [{ target: "Site", targetIdType: "UUID" }],
  });
  assert.equal(entity.idTsType, "number");
  assert.equal(entity.kebabName, "customer");
  assert.equal(entity.permissionCode, "ADMIN_CUSTOMER");
  assert.equal(entity.fields[0].tsType, "string");
  assert.equal(entity.fields[0].label, "FullName");
  assert.equal(entity.manyToOne[0].tsIdType, "string");
});

test("wizard both target writes a unified manifest and a runnable Next.js client", () => {
  const out = temporaryDirectory();
  // 8 app info, target=both, 7 features, 4 security, 4 frontend, count, 8 entity meta, 3 loops
  const answers = [
    "",
    "",
    "",
    out,
    "",
    "",
    "",
    "",
    "both",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "medium",
    "jwt",
    "Y",
    "",
    "",
    "",
    "",
    "",
    "1",
    "Sample",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];
  const cli = path.join(root, "cli.js");
  const res = spawnSync(process.execPath, [cli], {
    input: answers.join("\n") + "\n",
    encoding: "utf8",
  });
  assert.equal(res.status, 0, res.stderr || res.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(out, "project.json"), "utf8"));
  assert.deepEqual(manifest.targets, ["backend", "frontend"]);
  assert.equal(manifest.frontend.framework, "next");

  const backend = path.join(out, "server");
  assert.equal(
    fs.existsSync(
      path.join(backend, "src/main/java/com/stockpro/entity/administration/Sample.java"),
    ),
    true,
  );
  const client = path.join(out, "client");
  assert.equal(fs.existsSync(path.join(client, "package.json")), true);
  assert.equal(fs.existsSync(path.join(client, "src/lib/entities-registry.ts")), true);
  assert.equal(fs.existsSync(path.join(client, "src/features/shared/EntityCrud.tsx")), true);

  let leaks = 0;
  for (const file of walk(client)) {
    if (fs.readFileSync(file, "utf8").includes("{{")) {
      leaks += 1;
    }
  }
  assert.equal(leaks, 0);
});

test("generate-frontend with next emits a runnable scaffold from schemas", () => {
  const out = temporaryDirectory();
  const cli = path.join(root, "generate-frontend.js");
  const res = spawnSync(
    process.execPath,
    [cli, path.join(root, "examples/stock-crm"), out, "--frontend=next"],
    { encoding: "utf8" },
  );
  assert.equal(res.status, 0, res.stderr || res.stdout);
  assert.equal(fs.existsSync(path.join(out, "package.json")), true);
  const registry = fs.readFileSync(path.join(out, "src/lib/entities-registry.ts"), "utf8");
  assert.match(registry, /entitiesRegistry/);
  assert.match(registry, /Product/);
  let leaks = 0;
  for (const file of walk(out)) {
    if (fs.readFileSync(file, "utf8").includes("{{")) {
      leaks += 1;
    }
  }
  assert.equal(leaks, 0);
});

test("a custom .spack template pack drives a generated Next.js client", () => {
  const packOut = path.join(temporaryDirectory(), "custom.spack");
  const packer = path.join(root, "tools", "pack-frontend.js");
  const staticDir = path.join(root, "templates", "frontend", "next", "static");
  const registry = path.join(root, "templates", "frontend", "next", "entities-registry.ts.hbs");
  const pack = spawnSync(
    process.execPath,
    [packer, staticDir, packOut, "--name=custom", "--framework=next", `--registry=${registry}`],
    { encoding: "utf8" },
  );
  assert.equal(pack.status, 0, pack.stderr || pack.stdout);

  const out = temporaryDirectory();
  const cli = path.join(root, "generate-frontend.js");
  const res = spawnSync(
    process.execPath,
    [
      cli,
      path.join(root, "examples/stock-crm"),
      out,
      "--frontend=next",
      `--frontend-template=${packOut}`,
    ],
    { encoding: "utf8" },
  );
  assert.equal(res.status, 0, res.stderr || res.stdout);
  assert.equal(fs.existsSync(path.join(out, "package.json")), true);
  assert.equal(fs.existsSync(path.join(out, "src/lib/entities-registry.ts")), true);
  assert.equal(
    fs.existsSync(path.join(out, "pack.json")),
    false,
    "pack.json must not leak into the client",
  );
  assert.equal(fs.existsSync(path.join(out, "src", "features", "shared", "EntityCrud.tsx")), true);
  const registryContent = fs.readFileSync(path.join(out, "src/lib/entities-registry.ts"), "utf8");
  assert.match(registryContent, /entitiesRegistry/);
  assert.match(registryContent, /Product/);
  let leaks = 0;
  for (const file of walk(out)) {
    if (file.endsWith(".hbs")) leaks += 1;
    if (fs.readFileSync(file, "utf8").includes("{{")) leaks += 1;
  }
  assert.equal(leaks, 0);
});

test("generate-frontend maps reserved names to the built-in auth registry", () => {
  const schemaDir = temporaryDirectory();
  fs.writeFileSync(
    path.join(schemaDir, "User.json"),
    JSON.stringify({
      entity: {
        module: "administration",
        name: "User",
        tableName: "USER",
        idField: "id",
        idColumn: "USER_ID",
        urlPath: "users",
        fields: [],
      },
    }),
  );
  const out = temporaryDirectory();
  const cli = path.join(root, "generate-frontend.js");
  const res = spawnSync(process.execPath, [cli, schemaDir, out, "--frontend=next"], {
    encoding: "utf8",
  });
  assert.equal(res.status, 0, res.stderr || res.stdout);
  const registry = fs.readFileSync(path.join(out, "src/lib/entities-registry.ts"), "utf8");
  assert.match(registry, /idField: "idUtil"/);
  assert.match(registry, /name: "login"/);
  assert.match(registry, /name: "etatCompte"/);
  const crud = fs.readFileSync(path.join(out, "src/features/shared/EntityCrud.tsx"), "utf8");
  assert.match(crud, /idField/);
});
