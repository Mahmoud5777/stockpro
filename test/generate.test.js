const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync, spawnSync } = require("node:child_process");
const test = require("node:test");

const root = path.join(__dirname, "..");
const generator = path.join(root, "generate.js");
const schema = path.join(root, "schemas", "role.json");
const { loadSchemas, normalizeEntity, validateSchemaSet, validateEntitySchema } = require(generator);

function temporaryDirectory() {
    return fs.mkdtempSync(path.join(os.tmpdir(), "stockpro-generator-"));
}

test("shows help without requiring schema arguments", () => {
    const result = spawnSync(process.execPath, [generator, "--help"], { encoding: "utf8" });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage: node generate\.js/);
});

test("rejects an invalid schema with a useful error", () => {
    const directory = temporaryDirectory();
    const invalid = path.join(directory, "invalid.json");
    fs.writeFileSync(invalid, JSON.stringify({ entity: { name: "Role" } }));
    const result = spawnSync(process.execPath, [generator, invalid, directory], { encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /entity\.module is required/);
});

test("validates relations against a multi-entity schema set", () => {
    const role = loadSchemas(schema)[0];
    const userSiteDroits = normalizeEntity({
        module: "administration",
        name: "UserSiteDroits",
        tableName: "USER_SITE_DROITS",
        idField: "id",
        idColumn: "ID",
        urlPath: "user-site-droits"
    }, "fixture");
    const groupeRole = normalizeEntity({
        module: "administration",
        name: "GroupeRole",
        tableName: "GROUPE_ROLE",
        idField: "id",
        idColumn: "ID",
        urlPath: "groupe-roles"
    }, "fixture");
    assert.deepEqual(validateSchemaSet([role, userSiteDroits, groupeRole], true), []);
    assert.throws(() => validateSchemaSet([role], true), /UserSiteDroits/);
});

test("dry-run plans files without writing them", () => {
    const directory = temporaryDirectory();
    const result = execFileSync(process.execPath, [generator, schema, directory, "--dry-run"], { encoding: "utf8" });
    assert.match(result, /Summary: 0 written, 0 skipped, \d+ planned/);
    assert.match(result, /Role\.java/);
    assert.equal(fs.existsSync(path.join(directory, "server")), false);
});

test("generates, skips, and force-overwrites the expected files", () => {
    const directory = temporaryDirectory();
    execFileSync(process.execPath, [generator, schema, directory], { stdio: "pipe" });
    const role = path.join(directory, "server", "src", "main", "java", "com", "stockpro", "entity", "administration", "Role.java");
    assert.equal(fs.existsSync(role), true);
    const original = fs.readFileSync(role, "utf8");
    fs.writeFileSync(role, "manual change\n");
    const skipped = execFileSync(process.execPath, [generator, schema, directory], { encoding: "utf8" });
    assert.match(skipped, /Summary: 0 written, \d+ skipped/);
    assert.equal(fs.readFileSync(role, "utf8"), "manual change\n");
    execFileSync(process.execPath, [generator, schema, directory, "--force"], { stdio: "pipe" });
    assert.equal(fs.readFileSync(role, "utf8"), original);
});

function writeSchema(dir, entity) {
    const file = path.join(dir, "entity.json");
    fs.writeFileSync(file, JSON.stringify({ entity }));
    return file;
}

function makeEntity(overrides = {}) {
    return Object.assign({
        module: "administration",
        name: "Sample",
        tableName: "SAMPLE",
        idField: "id",
        idColumn: "ID",
        urlPath: "samples",
        idType: "UUID",
        fields: [
            { name: "label", javaType: "String", length: 50, required: true, errorMessage: "required" }
        ]
    }, overrides);
}

test("supports UUID, String and Long identifier types", () => {
    for (const idType of ["UUID", "String", "Long"]) {
        const dir = temporaryDirectory();
        writeSchema(dir, makeEntity({ idType }));
        const out = temporaryDirectory();
        execFileSync(process.execPath, [generator, dir, out], { stdio: "pipe" });
        const entityFile = fs.readFileSync(
            path.join(out, "server/src/main/java/com/stockpro/entity/administration/Sample.java"), "utf8");
        assert.match(entityFile, new RegExp(`private ${idType} id;`));
        if (idType === "UUID") assert.match(entityFile, /UUID\.randomUUID\(\)/);
        if (idType === "Long") assert.match(entityFile, /System\.currentTimeMillis\(\)/);
    }
});

test("resolves many-to-one relations with injected repositories", () => {
    const dir = temporaryDirectory();
    writeSchema(dir, makeEntity({
        name: "Post",
        tableName: "POST",
        urlPath: "posts",
        manyToOne: [
            {
                relationName: "Post_User",
                target: "User",
                targetModule: "security",
                fieldName: "author",
                joinColumn: "AUTHOR_ID",
                targetIdType: "UUID",
                nullable: false,
                orphanRemoval: false
            }
        ],
        oneToMany: []
    }));
    const out = temporaryDirectory();
    execFileSync(process.execPath, [generator, dir, out], { stdio: "pipe" });
    const impl = fs.readFileSync(
        path.join(out, "server/src/main/java/com/stockpro/service/administration/impl/PostServiceImpl.java"), "utf8");
    assert.match(impl, /private final UserRepository userRepository;/);
    assert.match(impl, /resolveUser\(/);
    const dto = fs.readFileSync(
        path.join(out, "server/src/main/java/com/stockpro/dto/administration/PostDTO.java"), "utf8");
    assert.match(dto, /private UUID authorId;/);
});

test("enforces the formal schema contract", () => {
    assert.throws(() => validateEntitySchema(makeEntity({ name: "1bad" }), "x"), /valid Java identifier/);
    assert.throws(() => validateEntitySchema(makeEntity({ idType: "Nope" }), "x"), /idType/);
    assert.throws(() => validateEntitySchema(makeEntity({ fields: [{ name: "x", javaType: "Bogus" }] }), "x"), /invalid javaType/);
    assert.throws(() => validateEntitySchema(makeEntity({ fields: [{ name: "x", javaType: "String", required: true }] }), "x"), /errorMessage/);
    assert.doesNotThrow(() => validateEntitySchema(makeEntity(), "x"));
});

test("detects duplicate tables and url paths across the schema set", () => {
    const a = normalizeEntity(makeEntity({ name: "A", tableName: "TBL", urlPath: "a" }), "x");
    const b = normalizeEntity(makeEntity({ name: "B", tableName: "TBL", urlPath: "b" }), "x");
    assert.throws(() => validateSchemaSet([a, b], { strict: true }), /Duplicate table/);
    const c = normalizeEntity(makeEntity({ name: "C", tableName: "OTHER", urlPath: "a" }), "x");
    assert.throws(() => validateSchemaSet([a, c], { strict: true }), /Duplicate URL path/);
});

test("security levels control which operations are exposed", () => {
    const low = normalizeEntity(makeEntity({ securityLevel: "low" }), "x").securityOperations;
    assert.equal(low.consultation, true);
    assert.equal(low.ajout, false);
    assert.equal(low.export, false);
    const high = normalizeEntity(makeEntity({ securityLevel: "high" }), "x").securityOperations;
    assert.equal(high.ajout, true);
    assert.equal(high.export, true);
    assert.equal(high.suppression, true);
});

test("a generated backend passes formal verification", () => {
    const out = temporaryDirectory();
    execFileSync(process.execPath, [generator, path.join(root, "examples", "stock-crm"), out], { stdio: "pipe" });
    const res = spawnSync(process.execPath, [path.join(root, "verify-app.js"), out],
        { encoding: "utf8", cwd: root });
    assert.equal(res.status, 0, res.stderr);
    assert.match(res.stdout, /App test passed/);
});

test("wizard produces a valid project model", () => {
    const out = temporaryDirectory();
    const answers = [
        "", "", "", out, "", "", "", "",           // application info (8)
        "backend",                                  // generation target
        "", "", "", "", "", "", "",                // 7 features
        "low", "jwt", "Y", "",                     // security
        "1",                                        // entity count
        "Sample", "", "", "", "", "", "", "",      // entity meta
        "", "", ""                                  // end field/relation loops
    ];
    const cli = path.join(root, "cli.js");
    const res = spawnSync(process.execPath, [cli], { input: answers.join("\n") + "\n", encoding: "utf8" });
    const project = path.join(out, "project.json");
    assert.equal(fs.existsSync(project), true, res.stderr || res.stdout);
    const model = JSON.parse(fs.readFileSync(project, "utf8"));
    assert.deepEqual(model.entityOrder, ["Sample"]);
    assert.deepEqual(model.generationOrder, ["Sample"]);
    assert.equal(fs.existsSync(path.join(out, "server/src/main/java/com/stockpro/entity/administration/Sample.java")), true);
});
