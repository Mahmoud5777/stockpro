const fs = require("node:fs");
const path = require("node:path");

const psQuote = (value) => `'${value.replace(/'/g, "''")}'`;
const shQuote = (value) => `'${value.replace(/'/g, "'\\''")}'`;

function writeDevScripts(absoluteOutput, serverRoot, clientRoot) {
  if (!serverRoot && !clientRoot) return;
  fs.mkdirSync(absoluteOutput, { recursive: true });
  const relative = (directory) => path.relative(absoluteOutput, directory) || ".";
  const ps1 = [
    "# StockPro generated app - development launcher",
    "param([switch]$NoInstall, [switch]$Check)",
    "$ErrorActionPreference = 'Stop'",
    ". (Join-Path $PSScriptRoot 'dev-env.ps1')",
    "",
    "function Start-DevServer($Directory, $Command) {",
    "  $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Command))",
    "  Start-Process -FilePath 'powershell.exe' -WorkingDirectory $Directory -ArgumentList @('-NoProfile', '-NoExit', '-EncodedCommand', $encoded) -WindowStyle Normal",
    "}",
    "",
  ];
  if (serverRoot) {
    ps1.push(
      `$backendDir = Join-Path $PSScriptRoot ${psQuote(relative(serverRoot))}`,
      "if (-not (Test-Path -LiteralPath $backendDir -PathType Container)) { throw \"Backend directory missing: $backendDir\" }",
    );
  }
  if (clientRoot) {
    ps1.push(
      `$frontendDir = Join-Path $PSScriptRoot ${psQuote(relative(clientRoot))}`,
      "if (-not (Test-Path -LiteralPath $frontendDir -PathType Container)) { throw \"Frontend directory missing: $frontendDir\" }",
    );
  }
  ps1.push(
    `$tools = Initialize-DevTools -Frontend:$${Boolean(clientRoot)} -Backend:$${Boolean(serverRoot)}`,
    "if ($Check) { $tools | Format-List; return }",
  );
  if (clientRoot) {
    ps1.push(
      "if (-not $NoInstall) {",
      "  Push-Location -LiteralPath $frontendDir",
      "  try {",
      "    & npm.cmd install",
      "    if ($LASTEXITCODE -ne 0) { throw \"npm install failed (exit $LASTEXITCODE). Servers were not started.\" }",
      "  } finally { Pop-Location }",
      "}",
    );
  }
  if (serverRoot) {
    ps1.push(
      "Write-Host 'Starting backend at http://localhost:8080 in a separate window...'",
      "Start-DevServer $backendDir \"`$Host.UI.RawUI.WindowTitle = 'StockPro Backend (:8080)'; & mvn.cmd spring-boot:run\"",
    );
  }
  if (clientRoot) {
    ps1.push(
      "Write-Host 'Starting frontend at http://localhost:3000 in a separate window...'",
      "Start-DevServer $frontendDir \"`$Host.UI.RawUI.WindowTitle = 'StockPro Frontend (:3000)'; & npm.cmd run dev\"",
    );
  }
  fs.writeFileSync(path.join(absoluteOutput, "dev-run.ps1"), ps1.join("\r\n") + "\r\n");
  fs.copyFileSync(path.join(__dirname, "dev-env.ps1"), path.join(absoluteOutput, "dev-env.ps1"));
  fs.writeFileSync(path.join(absoluteOutput, "dev-run.cmd"), [
    "@echo off",
    'powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0dev-run.ps1" %*',
    "exit /b %errorlevel%",
    "",
  ].join("\r\n"));

  const sh = ["#!/usr/bin/env bash", "set -e", 'DIR="$(cd "$(dirname "$0")" && pwd)"'];
  const shDirectory = (directory) => `"$DIR/"${shQuote(relative(directory).replace(/\\/g, "/"))}`;
  if (serverRoot) sh.push(`( cd ${shDirectory(serverRoot)} && mvn spring-boot:run ) &`);
  if (clientRoot) sh.push(`( cd ${shDirectory(clientRoot)} && npm install && npm run dev ) &`);
  sh.push("wait");
  fs.writeFileSync(path.join(absoluteOutput, "dev-run.sh"), sh.join("\n") + "\n");
}

module.exports = { writeDevScripts };
