@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Claude-AppsScript-Pro Windows Basic Installation Script
:: v1.0.1 - ASCII-only safe version

echo.
echo Claude-AppsScript-Pro Windows Installation Starting
echo ========================================================

:: Node.js verification
echo Step 1: Node.js version check
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo    Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo SUCCESS: Node.js verification completed

:: Dependencies installation
echo.
echo Step 2: Installing dependencies
npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo SUCCESS: Dependencies installation completed

:: Syntax check
echo.
echo Step 3: Syntax check
node --check server.js
if errorlevel 1 (
    echo ERROR: Syntax errors found
    pause
    exit /b 1
)
echo SUCCESS: Syntax check completed

:: OAuth setup guidance
echo.
echo Step 4: OAuth setup
echo    Please run OAuth setup manually:
echo    npm run oauth-setup
echo.
echo WARNING: Please verify .env file manually

:: Claude Desktop setup guidance
echo.
echo Step 5: Claude Desktop configuration
echo    Please add the following to claude_desktop_config.json:
echo.
echo    "claude-appsscript-pro": {
echo        "command": "node",
echo        "args": ["server.js"],
echo        "cwd": "%cd%"
echo    }

echo.
echo Basic installation completed!
echo    Next steps:
echo    1. Run npm run oauth-setup for OAuth configuration
echo    2. Restart Claude Desktop
echo    3. Verify MCP connection
echo.
pause
