const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { stagedTemplates } = require("../generate-frontend");
const { parseArgs } = require("../lib/args");
const root = path.join(__dirname, "..");
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "stockpro-pipeline-"));
const run = (file, args) => spawnSync(process.execPath, [path.join(root, file), ...args], { encoding: "utf8", cwd: root });
function model(name, extra = {}) {
  return { name, module: "demo", tableName: name.toUpperCase(), idField: "recordId", idColumn: "ID", idType: "Long", urlPath: name.toLowerCase(), fields: [], ...extra };
}
test("frontend round trip keeps relation IDs, field validation and quoted user labels", () => {
  const schemas = tmp();
  fs.writeFileSync(path.join(schemas, "1.json"), JSON.stringify({ entity: model("Category", { fields: [{ name: "title", javaType: "String" }] }) }));
  fs.writeFileSync(path.join(schemas, "2.json"), JSON.stringify({ entity: model("Item", { fields: [
    { name: "title", javaType: "String", label: 'A "quoted" label\nwith a line break', required: true, errorMessage: "Required" },
    { name: "secret", javaType: "String", writeOnly: true }, { name: "due", javaType: "LocalDate" },
  ], manyToOne: [{ target: "Category", targetModule: "demo", targetIdType: "Long", targetIdField: "recordId", fieldName: "category", joinColumn: "CATEGORY_ID", nullable: false }] }) }));
  const client = tmp();
  const result = run("generate-frontend.js", [schemas, client]);
  assert.equal(result.status, 0, result.stderr);
  const source = fs.readFileSync(path.join(client, "src/lib/entities-registry.ts"), "utf8");
  const registry = JSON.parse(source.match(/entitiesRegistry[^=]*=\s*(\[[\s\S]*\]);/)[1]);
  const item = registry.find((entity) => entity.name === "Item");
  assert.equal(item.idField, "recordId");
  assert.equal(item.fields[0].label, 'A "quoted" label\nwith a line break');
  assert.equal(item.fields[1].inputType, "password");
  assert.equal(item.fields[2].inputType, "date");
  const relation = item.fields.find((field) => field.name === "categoryId");
  assert.equal(relation.type, "number");
  assert.equal(relation.relation.idField, "recordId");
  assert.equal(relation.required, true);
});
test("frontend dry-run leaves output absent and force is required to overwrite", () => {
  const parent = tmp(), client = path.join(parent, "client"), schemas = path.join(root, "generated-app/schemas");
  assert.equal(run("generate-frontend.js", [schemas, client, "--dry-run"]).status, 0);
  assert.equal(fs.existsSync(client), false);
  assert.equal(run("generate-frontend.js", [schemas, client]).status, 0);
  const css = path.join(client, "src/app/globals.css");
  fs.writeFileSync(css, "/* user customization */");
  assert.equal(run("generate-frontend.js", [schemas, client]).status, 0);
  assert.equal(fs.readFileSync(css, "utf8"), "/* user customization */");
  assert.equal(run("generate-frontend.js", [schemas, client, "--force"]).status, 0);
  assert.notEqual(fs.readFileSync(css, "utf8"), "/* user customization */");
});
test("template packs reject paths outside staging and missing template bytes", () => {
  assert.throws(() => stagedTemplates({ "../escape.txt": Buffer.from("bad") }, {}, {}), /Unsafe/);
  assert.throws(() => stagedTemplates({ "C:/escape.txt": Buffer.from("bad") }, {}, {}), /Unsafe/);
  assert.throws(() => stagedTemplates({}, { templates: ["missing.hbs"] }, {}), /missing/);
});
test("frontend verifier fails for a missing client rather than passing with zero files", () => {
  const out = tmp();
  fs.writeFileSync(path.join(out, "project.json"), JSON.stringify({ targets: ["frontend"], entityCount: 1, generationOrder: ["Item"] }));
  const result = run("verify-app.js", [out]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Missing frontend file/);
});
test("paginated generation keeps its list method when search and method security are disabled", () => {
  const schemas = tmp(), out = tmp();
  fs.writeFileSync(path.join(schemas, "item.json"), JSON.stringify({ entity: model("Item", { features: { pagination: true, search: false, security: false } }) }));
  const result = run("generate.js", [schemas, out, "--strict-relations"]);
  assert.equal(result.status, 0, result.stderr);
  const controller = fs.readFileSync(path.join(out, "src/main/java/com/stockpro/controller/demo/ItemController.java"), "utf8");
  assert.ok(!controller.includes("@PreAuthorize"));
  const service = fs.readFileSync(path.join(out, "src/main/java/com/stockpro/service/demo/ItemService.java"), "utf8");
  assert.match(service, /findAll\(String search/);
  const initializer = fs.readFileSync(path.join(out, "src/main/java/com/stockpro/security/DataInitializer.java"), "utf8");
  assert.match(initializer, /ADMIN_ITEM/);
});
test("CLI options accept spaces and preserve equals signs in paths", () => {
  assert.deepEqual(parseArgs(["source", "--out", "a=b", "--force"], ["out"]), { options: { out: "a=b", force: true }, positional: ["source"] });
  assert.equal(parseArgs(["--out=a=b"], ["out"]).options.out, "a=b");
});
test("mixed-schema fixture generates without missing relation targets", () => {
  const result = run("generate.js", [path.join(__dirname, "fixtures/pipeline-schemas"), tmp(), "--strict-relations"]);
  assert.equal(result.status, 0, result.stderr);
});
