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

test("augments entities with frontend type info", () => {
    const entity = augmentForFrontend({
        name: "UserSite",
        module: "security",
        idType: "Long",
        urlPath: "user-sites",
        fields: [{ name: "code", javaType: "String" }, { name: "active", javaType: "Boolean" }],
        manyToOne: [{ target: "Site", targetIdType: "UUID" }],
    });
    assert.equal(entity.idTsType, "number");
    assert.equal(entity.kebabName, "user-site");
    assert.equal(entity.fields[0].tsType, "string");
    assert.equal(entity.fields[1].tsType, "boolean");
    assert.equal(entity.manyToOne[0].tsIdType, "string");
});

test("wizard both target writes a unified manifest and a server backend", () => {
    const out = temporaryDirectory();
    // 8 app info, target=both, 7 features, 4 security, 6 frontend, count, 8 entity meta, 3 loops
    const answers = [
        "", "", "", out, "", "", "", "",
        "both",
        "", "", "", "", "", "", "",
        "high", "jwt", "Y", "",
        "angular", "angular-cli", "primeng", "signals", "Y", "Y",
        "1",
        "Sample", "", "", "", "", "", "", "",
        "", "", "",
    ];
    const cli = path.join(root, "cli.js");
    const res = spawnSync(process.execPath, [cli], { input: answers.join("\n") + "\n", encoding: "utf8" });
    assert.equal(res.status, 0, res.stderr || res.stdout);
    const manifest = JSON.parse(fs.readFileSync(path.join(out, "project.json"), "utf8"));
    assert.deepEqual(manifest.targets, ["backend", "frontend"]);
    assert.equal(manifest.frontend.framework, "angular");
    const backend = fs.existsSync(path.join(out, "server"))
        ? path.join(out, "server")
        : out;
    assert.equal(
        fs.existsSync(path.join(backend, "src/main/java/com/stockpro/entity/administration/Sample.java")),
        true
    );
});

test("angular both target generates a client with no placeholder leaks", () => {
    const out = temporaryDirectory();
    const answers = [
        "", "", "", out, "", "", "", "",
        "both",
        "", "", "", "", "", "", "",
        "high", "jwt", "Y", "",
        "angular", "angular-cli", "primeng", "signals", "Y", "Y",
        "1",
        "Sample", "", "", "", "", "", "", "",
        "", "", "",
    ];
    const cli = path.join(root, "cli.js");
    const res = spawnSync(process.execPath, [cli], { input: answers.join("\n") + "\n", encoding: "utf8" });
    assert.equal(res.status, 0, res.stderr || res.stdout);
    const client = path.join(out, "client");
    const model = path.join(client, "src/app/features/administration/sample/Sample.model.ts");
    const service = path.join(client, "src/app/features/administration/sample/Sample.service.ts");
    assert.equal(fs.existsSync(model), true);
    assert.equal(fs.existsSync(service), true);
    function walk(dir) {
        return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
            e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
    }
    let leaks = 0;
    for (const file of walk(client)) {
        if (fs.readFileSync(file, "utf8").includes("{{") || fs.readFileSync(file, "utf8").includes("}}")) leaks += 1;
    }
    assert.equal(leaks, 0);
});
