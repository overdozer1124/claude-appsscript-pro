# 🚀 Claude-AppsScript-Pro Windows Setup Script
# Automatic Node.js PATH configuration and system setup

Write-Host "🚀 Claude-AppsScript-Pro Windows Setup Starting..." -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Yellow

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ This script requires Administrator privileges." -ForegroundColor Red
    Write-Host "   Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Alternative: Use manual setup commands from README.md" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Administrator privileges confirmed" -ForegroundColor Green

# Common Node.js installation paths
$nodePaths = @(
    "C:\Program Files\nodejs",
    "C:\Program Files (x86)\nodejs",
    "$env:LOCALAPPDATA\Programs\nodejs",
    "$env:APPDATA\npm"
)

$nodeFound = $false
$nodeInstallPath = ""

# Check for Node.js installation
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Cyan

foreach ($path in $nodePaths) {
    if (Test-Path "$path\node.exe") {
        $nodeFound = $true
        $nodeInstallPath = $path
        Write-Host "✅ Node.js found at: $path" -ForegroundColor Green
        break
    }
}

if (-not $nodeFound) {
    Write-Host "❌ Node.js not found in common locations." -ForegroundColor Red
    Write-Host "   Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check current PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$pathAlreadySet = $currentPath -split ";" | ForEach-Object { $_.Trim() } | Where-Object { $_ -eq $nodeInstallPath }

if ($pathAlreadySet) {
    Write-Host "✅ Node.js is already in system PATH" -ForegroundColor Green
} else {
    Write-Host "⚙️ Adding Node.js to system PATH..." -ForegroundColor Yellow
    
    # Add Node.js to PATH
    $newPath = "$currentPath;$nodeInstallPath"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
    
    # Update current session PATH
    $env:PATH = "$env:PATH;$nodeInstallPath"
    
    Write-Host "✅ Node.js added to system PATH" -ForegroundColor Green
}

# Verify Node.js and npm are accessible
Write-Host "🔍 Verifying Node.js accessibility..." -ForegroundColor Cyan

try {
    $nodeVersion = & "$nodeInstallPath\node.exe" --version 2>$null
    $npmVersion = & "$nodeInstallPath\npm.exe" --version 2>$null
    
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm version: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error verifying Node.js installation" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

# Check if packages need installation
Write-Host "🔍 Checking npm dependencies..." -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
    
    try {
        & "$nodeInstallPath\npm.exe" install --no-optional --no-fund
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Perform syntax check
Write-Host "🔍 Performing server.js syntax check..." -ForegroundColor Cyan

try {
    & "$nodeInstallPath\node.exe" --check server.js
    Write-Host "✅ server.js syntax check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ server.js syntax check failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

# Check for .env file
Write-Host "🔍 Checking configuration..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "⚠️ .env file not found" -ForegroundColor Yellow
    Write-Host "   Please create .env file with your Google OAuth credentials" -ForegroundColor Yellow
    Write-Host "   See README.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host "✅ .env configuration file found" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Create .env file (if not already done)" -ForegroundColor White
Write-Host "   2. Configure Google OAuth credentials" -ForegroundColor White
Write-Host "   3. Add to Claude Desktop configuration" -ForegroundColor White
Write-Host "   4. Test connection: claude-appsscript-pro:test_connection" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Start the server:" -ForegroundColor Cyan
Write-Host "   npm run start      # Using regular PATH" -ForegroundColor White
Write-Host "   npm run start-win  # Using full path (always works)" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full documentation: README.md" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Yellow
