function Add-DevPath($Directory) {
  if ($Directory -and (Test-Path -LiteralPath $Directory -PathType Container)) {
    $env:Path = "$Directory;$env:Path"
  }
}

function Find-DevDirectory($Candidates, $RequiredFiles) {
  foreach ($candidate in $Candidates) {
    if (-not $candidate) { continue }
    $valid = $true
    foreach ($requiredFile in $RequiredFiles) {
      if (-not (Test-Path -LiteralPath (Join-Path $candidate $requiredFile) -PathType Leaf)) {
        $valid = $false
        break
      }
    }
    if ($valid) { return (Resolve-Path -LiteralPath $candidate).Path }
  }
}

function Initialize-DevTools([switch]$Frontend, [switch]$Backend) {
  # Refresh paths for this process only, including tools installed after the terminal opened.
  $env:Path = (@($env:Path, [Environment]::GetEnvironmentVariable('Path', 'User'), [Environment]::GetEnvironmentVariable('Path', 'Machine')) | Where-Object { $_ }) -join ';'
  $toolRoots = @()
  $ancestor = Get-Item -LiteralPath $PSScriptRoot
  while ($ancestor) {
    $toolRoot = Join-Path $ancestor.FullName '.tools'
    if (Test-Path -LiteralPath $toolRoot -PathType Container) { $toolRoots += $toolRoot }
    $ancestor = $ancestor.Parent
  }
  $tools = [ordered]@{}

  if ($Frontend) {
    $nodeCandidates = @()
    foreach ($toolRoot in $toolRoots) {
      $nodeCandidates += Join-Path $toolRoot 'node'
      $nodeCandidates += $toolRoot
      $nodeCandidates += @(Get-ChildItem -LiteralPath $toolRoot -Directory -Filter 'node-*-win-*' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -ExpandProperty FullName)
    }
    $nodeCandidates += $env:NODE_HOME
    $npmCommand = Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue
    if ($npmCommand) { $nodeCandidates += Split-Path -Parent $npmCommand.Source }
    if ($env:ProgramFiles) { $nodeCandidates += Join-Path $env:ProgramFiles 'nodejs' }
    if ($env:LOCALAPPDATA) { $nodeCandidates += Join-Path $env:LOCALAPPDATA 'Programs\nodejs' }
    $nodeDirectory = Find-DevDirectory $nodeCandidates @('node.exe', 'npm.cmd')
    if ($nodeDirectory) { Add-DevPath $nodeDirectory }
    if (-not (Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue) -or -not (Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue)) {
      throw 'Node.js/npm could not be found. Install the complete Node.js distribution, or place it in .tools\node beside this app or its generator.'
    }
    $tools.Node = (Get-Command node.exe -CommandType Application).Source
    $tools.Npm = (Get-Command npm.cmd -CommandType Application).Source
  }

  if ($Backend) {
    $mavenCandidates = @()
    foreach ($mavenHome in @($env:MAVEN_HOME, $env:M2_HOME)) {
      if ($mavenHome) { $mavenCandidates += Join-Path $mavenHome 'bin' }
    }
    foreach ($toolRoot in $toolRoots) {
      $mavenCandidates += Join-Path $toolRoot 'maven\bin'
      $mavenCandidates += @(Get-ChildItem -Path (Join-Path $toolRoot 'apache-maven-*\bin') -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
    }
    if ($env:USERPROFILE) {
      $mavenCandidates += @(Get-ChildItem -Path (Join-Path $env:USERPROFILE '.m2\wrapper\dists\apache-maven-*\*\bin') -Directory -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -ExpandProperty FullName)
    }
    if (-not (Get-Command mvn.cmd -CommandType Application -ErrorAction SilentlyContinue)) {
      Add-DevPath (Find-DevDirectory $mavenCandidates @('mvn.cmd'))
    }
    if (-not (Get-Command mvn.cmd -CommandType Application -ErrorAction SilentlyContinue)) {
      throw 'Maven could not be found. Install Maven, set MAVEN_HOME, or place it in .tools\maven.'
    }

    $javaCandidates = @($env:JAVA_HOME, $env:JDK_HOME)
    $javaCommand = Get-Command java.exe -CommandType Application -ErrorAction SilentlyContinue
    if ($javaCommand) { $javaCandidates += Split-Path -Parent (Split-Path -Parent $javaCommand.Source) }
    foreach ($toolRoot in $toolRoots) {
      $javaCandidates += Join-Path $toolRoot 'jdk'
      $javaCandidates += @(Get-ChildItem -LiteralPath $toolRoot -Directory -Filter 'jdk*' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -ExpandProperty FullName)
    }
    if ($env:USERPROFILE) {
      $javaCandidates += @(Get-ChildItem -Path (Join-Path $env:USERPROFILE '.jdks\*') -Directory -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -ExpandProperty FullName)
    }
    $javaHome = Find-DevDirectory $javaCandidates @('bin\java.exe', 'bin\javac.exe')
    if (-not $javaHome) { throw 'A Java JDK could not be found. Install a JDK and set JAVA_HOME, or place it in .tools\jdk.' }
    $env:JAVA_HOME = $javaHome
    Add-DevPath (Join-Path $javaHome 'bin')
    $tools.Java = (Get-Command java.exe -CommandType Application).Source
    $tools.Maven = (Get-Command mvn.cmd -CommandType Application).Source
  }
  return [pscustomobject]$tools
}
