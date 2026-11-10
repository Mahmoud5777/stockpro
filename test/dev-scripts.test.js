const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const test = require("node:test");
const { writeDevScripts } = require("../lib/dev-scripts");

function fixture(targets) {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "stockpro-launcher-"));
  const out = path.join(base, "app team's workspace");
  const backend = targets.includes("backend") ? path.join(out, "server team's") : null;
  const frontend = targets.includes("frontend") ? path.join(out, "client team's") : null;
  for (const directory of [out, backend, frontend].filter(Boolean)) fs.mkdirSync(directory, { recursive: true });
  writeDevScripts(out, backend, frontend);
  const bin = path.join(base, "bin");
  fs.mkdirSync(bin);
  // Discovery only; Start-Process is mocked and these executables are never run.
  fs.writeFileSync(path.join(bin, "node.exe"), "test executable");
  const javaHome = path.join(base, "jdk");
  fs.mkdirSync(path.join(javaHome, "bin"), { recursive: true });
  for (const name of ["java.exe", "javac.exe"]) fs.writeFileSync(path.join(javaHome, "bin", name), "test executable");
  fs.writeFileSync(path.join(bin, "mvn.cmd"), "@echo off\r\nexit /b 0\r\n");
  fs.writeFileSync(path.join(bin, "npm.cmd"), [
    "@echo off",
    'if "%STOCKPRO_TEST_NPM_FAIL%"=="1" exit /b 23',
    'echo installed>"%STOCKPRO_TEST_INSTALL_MARKER%"',
    "exit /b 0",
    "",
  ].join("\r\n"));
  return { base, out, backend, frontend, bin, javaHome };
}

function runLauncher(files, { noInstall = false, failInstall = false, portable = false } = {}) {
  const capture = path.join(files.base, "captured.json");
  const marker = path.join(files.base, "installed.txt");
  const script = [
    "$global:captured = New-Object 'System.Collections.Generic.List[object]'",
    "function Start-Process {",
    "  param($FilePath, $WorkingDirectory, $ArgumentList, $WindowStyle)",
    "  $global:captured.Add([pscustomobject]@{ file = $FilePath; directory = $WorkingDirectory; args = $ArgumentList; style = $WindowStyle; path = $env:Path; javaHome = $env:JAVA_HOME })",
    "}",
    "$result = 0",
    "try {",
    `  & $env:STOCKPRO_TEST_LAUNCHER${noInstall ? " -NoInstall" : ""}`,
    "} catch { [Console]::Error.WriteLine($_.Exception.Message); $result = 1 }",
    "ConvertTo-Json -InputObject @($global:captured.ToArray()) -Depth 4 | Set-Content -LiteralPath $env:STOCKPRO_TEST_CAPTURE -Encoding UTF8",
    "exit $result",
  ].join("\n");
  const powershell = path.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
  const result = spawnSync(powershell, [
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64"),
  ], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: portable ? path.join(process.env.SystemRoot, "System32") : `${files.bin}${path.delimiter}${process.env.PATH || ""}`,
      JAVA_HOME: files.javaHome,
      STOCKPRO_TEST_LAUNCHER: path.join(files.out, "dev-run.ps1"),
      STOCKPRO_TEST_CAPTURE: capture,
      STOCKPRO_TEST_INSTALL_MARKER: marker,
      STOCKPRO_TEST_NPM_FAIL: failInstall ? "1" : "0",
    },
  });
  assert.equal(result.error, undefined);
  return {
    ...result,
    launched: JSON.parse(fs.readFileSync(capture, "utf8").replace(/^\uFEFF/, "")),
    installed: fs.existsSync(marker),
  };
}

test("Windows entry point invokes its adjacent launcher with a process-only policy override", () => {
  const files = fixture(["frontend"]);
  const cmd = fs.readFileSync(path.join(files.out, "dev-run.cmd"), "utf8");
  assert.match(cmd, /powershell\.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-run\.ps1" %\*/);
  assert.match(cmd, /exit \/b %errorlevel%/);
  assert.equal(fs.existsSync(path.join(files.out, "dev-run.ps1")), true);
  assert.equal(fs.existsSync(path.join(files.out, "dev-env.ps1")), true);
  assert.equal(fs.existsSync(path.join(files.out, "dev-run.sh")), true);
});

test("PowerShell finds a complete project-local Node distribution when npm is absent from PATH", {
  skip: process.platform !== "win32",
}, () => {
  const files = fixture(["frontend"]);
  const localNode = path.join(files.base, ".tools", "node-v22-test-win-x64");
  fs.mkdirSync(localNode, { recursive: true });
  for (const name of ["node.exe", "npm.cmd"]) fs.copyFileSync(path.join(files.bin, name), path.join(localNode, name));
  // The incomplete standalone executable must not be mistaken for an npm installation.
  fs.copyFileSync(path.join(files.bin, "node.exe"), path.join(files.base, ".tools", "node.exe"));
  const result = runLauncher(files, { portable: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.installed, true);
  assert.equal(result.launched.length, 1);
  assert.equal(result.launched[0].path.split(path.delimiter)[0], localNode);
});

test("PowerShell launches selected targets with safe paths and -NoInstall skips npm install", {
  skip: process.platform !== "win32",
}, () => {
  for (const targets of [["backend"], ["frontend"], ["backend", "frontend"]]) {
    const files = fixture(targets);
    const result = runLauncher(files, { noInstall: true });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.equal(result.installed, false);
    assert.deepEqual(result.launched.map((entry) => entry.directory), [files.backend, files.frontend].filter(Boolean));
    for (const entry of result.launched) {
      assert.equal(entry.file, "powershell.exe");
      assert.equal(entry.style, "Normal");
      if (files.backend) assert.equal(entry.javaHome, files.javaHome);
      assert.deepEqual(entry.args.slice(0, 3), ["-NoProfile", "-NoExit", "-EncodedCommand"]);
      const command = Buffer.from(entry.args[3], "base64").toString("utf16le");
      assert.match(command, /\$Host\.UI\.RawUI\.WindowTitle/);
      assert.match(command, entry.directory === files.backend ? /& mvn\.cmd spring-boot:run/ : /& npm\.cmd run dev/);
    }
  }
});

test("PowerShell installs frontend dependencies and does not start servers after an install failure", {
  skip: process.platform !== "win32",
}, () => {
  let result = runLauncher(fixture(["backend", "frontend"]));
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(result.installed, true);
  assert.equal(result.launched.length, 2);
  result = runLauncher(fixture(["backend", "frontend"]), { failInstall: true });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /npm install failed \(exit 23\)/);
  assert.equal(result.installed, false);
  assert.equal(result.launched.length, 0);
});
