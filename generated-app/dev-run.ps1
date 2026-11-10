# StockPro generated app - development launcher
param([switch]$NoInstall, [switch]$Check)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'dev-env.ps1')

function Start-DevServer($Directory, $Command) {
  $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($Command))
  Start-Process -FilePath 'powershell.exe' -WorkingDirectory $Directory -ArgumentList @('-NoProfile', '-NoExit', '-EncodedCommand', $encoded) -WindowStyle Normal
}

$backendDir = Join-Path $PSScriptRoot 'server'
if (-not (Test-Path -LiteralPath $backendDir -PathType Container)) { throw "Backend directory missing: $backendDir" }
$frontendDir = Join-Path $PSScriptRoot 'client'
if (-not (Test-Path -LiteralPath $frontendDir -PathType Container)) { throw "Frontend directory missing: $frontendDir" }
$tools = Initialize-DevTools -Frontend:$true -Backend:$true
if ($Check) { $tools | Format-List; return }
if (-not $NoInstall) {
  Push-Location -LiteralPath $frontendDir
  try {
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed (exit $LASTEXITCODE). Servers were not started." }
  } finally { Pop-Location }
}
Write-Host 'Starting backend at http://localhost:8080 in a separate window...'
Start-DevServer $backendDir "`$Host.UI.RawUI.WindowTitle = 'StockPro Backend (:8080)'; & mvn.cmd spring-boot:run"
Write-Host 'Starting frontend at http://localhost:3000 in a separate window...'
Start-DevServer $frontendDir "`$Host.UI.RawUI.WindowTitle = 'StockPro Frontend (:3000)'; & npm.cmd run dev"
