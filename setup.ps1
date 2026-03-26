# setup.ps1 - One-time setup for ey-attg-sdlc-wizard
# Run this ONCE after cloning the repo to copy the kit content from the original SpecDD project.
#
# Usage:
#   .\setup.ps1
#   .\setup.ps1 -KitSource "C:\path\to\sdd-kit"
#
# After running, the project is ready for local development:
#   npm install
#   npm run bundle-kit   (requires sdd-kit/ to be populated)
#   npm run dev

param(
  [string]$KitSource = "C:\Development\SpecDDStarterKit\SpecDDStarterKit\SDDStarterKit\sdd-kit"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

function Write-Step([string]$msg) {
  Write-Host ""
  Write-Host "  >> $msg" -ForegroundColor Cyan
}
function Write-Done([string]$msg) {
  Write-Host "     OK: $msg" -ForegroundColor Green
}
function Write-Warn([string]$msg) {
  Write-Host "     WARN: $msg" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  EY ATTG SDLC Wizard - Setup" -ForegroundColor White
Write-Host ""

# -- 1. Validate kit source --------------------------------------------------
Write-Step "Checking kit source: $KitSource"

if (-not (Test-Path $KitSource)) {
  Write-Host ""
  Write-Host "  ERROR: Kit source not found at: $KitSource" -ForegroundColor Red
  Write-Host "  Pass the correct path: .\setup.ps1 -KitSource 'C:\path\to\sdd-kit'" -ForegroundColor Red
  exit 1
}
Write-Done "Found kit source"

# -- 2. Copy sdd-kit content (excluding website/ and node_modules/) ----------
Write-Step "Copying sdd-kit content to $ProjectRoot\sdd-kit\"

$KitDest = Join-Path $ProjectRoot "sdd-kit"
if (-not (Test-Path $KitDest)) {
  New-Item -ItemType Directory -Path $KitDest | Out-Null
}

$ExcludeDirs = @("website", "node_modules", ".git")

Get-ChildItem -Path $KitSource -Recurse | Where-Object {
  $relativePath = $_.FullName.Substring($KitSource.Length + 1)
  $topLevel = $relativePath.Split([IO.Path]::DirectorySeparatorChar)[0]
  $ExcludeDirs -notcontains $topLevel
} | ForEach-Object {
  $dest = Join-Path $KitDest $_.FullName.Substring($KitSource.Length + 1)
  if ($_.PSIsContainer) {
    if (-not (Test-Path $dest)) { New-Item -ItemType Directory -Path $dest | Out-Null }
  } else {
    $destDir = Split-Path $dest
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
    Copy-Item -Path $_.FullName -Destination $dest -Force
  }
}

$kitFileCount = (Get-ChildItem -Recurse -File $KitDest).Count
Write-Done "Copied $kitFileCount files to sdd-kit\"

# -- 3. Clean up worker files accidentally created in old location ------------
Write-Step "Checking for stale worker files in original project..."

$StaleWorkerDir = Join-Path $KitSource "website\worker"
if (Test-Path $StaleWorkerDir) {
  $staleFiles = Get-ChildItem -Recurse -File $StaleWorkerDir
  if ($staleFiles.Count -gt 0) {
    Write-Warn "Found $($staleFiles.Count) stale file(s) in $StaleWorkerDir"
    $confirm = Read-Host "    Delete them? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
      Remove-Item -Recurse -Force $StaleWorkerDir
      Write-Done "Deleted stale worker directory"
    } else {
      Write-Warn "Skipped - delete manually if needed"
    }
  } else {
    Write-Done "No stale files found"
  }
} else {
  Write-Done "No stale worker directory found"
}

# -- 4. Copy .npmrc (EY JFrog registry config) ----------------------------
Write-Step "Copying .npmrc registry config..."
$OriginalNpmrc = Join-Path $KitSource "website\.npmrc"
if (Test-Path $OriginalNpmrc) {
  Copy-Item $OriginalNpmrc (Join-Path $ProjectRoot ".npmrc") -Force
  Write-Done "Copied .npmrc"
} else {
  Write-Warn ".npmrc not found in source - you may need to configure it manually"
}

# -- 5. Install npm dependencies (copy from source if auth fails) ----------
Write-Step "Installing npm dependencies..."
$DestNodeModules = Join-Path $ProjectRoot "node_modules"
if (-not (Test-Path $DestNodeModules)) {
  $SrcNodeModules = Join-Path $KitSource "website\node_modules"
  if (Test-Path $SrcNodeModules) {
    Write-Host "     Copying node_modules from source project (avoids registry auth)..." -ForegroundColor Gray
    Copy-Item -Recurse -Force $SrcNodeModules $DestNodeModules
    Write-Done "node_modules copied"
  } else {
    Push-Location $ProjectRoot
    try {
      npm install --prefer-offline 2>&1 | Out-Null
      if ($LASTEXITCODE -ne 0) { npm install 2>&1 | Out-Null }
      Write-Done "npm install complete"
    } finally {
      Pop-Location
    }
  }
} else {
  Write-Done "node_modules already present - skipping install"
}

# -- 5. Bundle the kit files --------------------------------------------------
Write-Step "Bundling kit files to src/data/kit-files.json..."
Push-Location $ProjectRoot
try {
  $env:KIT_PATH = $KitDest
  node scripts/bundle-kit.js
  if ($LASTEXITCODE -eq 0) {
    Write-Done "Bundle complete"
  } else {
    Write-Warn "Bundle failed - run 'npm run bundle-kit' manually after fixing the error"
  }
} finally {
  Pop-Location
}

# -- Summary ------------------------------------------------------------------
Write-Host ""
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Gray
Write-Host "  1. Copy .env.example to .env and fill in PUBLIC_GITHUB_CLIENT_ID + PUBLIC_WORKER_URL" -ForegroundColor Gray
Write-Host "  2. Deploy the Cloudflare Worker:" -ForegroundColor Gray
Write-Host "       cd worker" -ForegroundColor Gray
Write-Host "       npx wrangler deploy" -ForegroundColor Gray
Write-Host "       npx wrangler secret put GITHUB_CLIENT_SECRET" -ForegroundColor Gray
Write-Host "  3. Start the dev server:" -ForegroundColor Gray
Write-Host "       npm run dev" -ForegroundColor Gray
Write-Host "  4. Push project to GitHub and configure:" -ForegroundColor Gray
Write-Host "       Settings > Secrets > GITHUB_CLIENT_ID, WORKER_URL" -ForegroundColor Gray
Write-Host "       Settings > Pages > Source: GitHub Actions" -ForegroundColor Gray
Write-Host ""