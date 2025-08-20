@echo off
setlocal EnableDelayedExpansion

REM ASCII-only version to avoid encoding issues completely
REM Claude-AppsScript-Pro Complete Auto Installer
REM Version: 2.1.2 - ASCII-only safe version

REM PowerShell execution detection
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"

REM Full auto mode
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro Auto Installer v2.1.2 (ASCII)

echo.
echo =================================================================
echo    Claude-AppsScript-Pro Complete Auto Installer v2.1.2
echo                PowerShell Compatible - Full Automation
echo =================================================================
echo.

REM Log file setup
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Installation started (ASCII version) >> %LOG_FILE%

REM Working directory verification
echo Current directory: %CD%
echo [%DATE% %TIME%] Working directory: %CD% >> %LOG_FILE%

REM Check if we're in correct directory
if not exist package.json (
    echo ERROR: package.json not found in current directory
    echo Please run this installer from the claude-appsscript-pro directory
    echo [%DATE% %TIME%] ERROR: Wrong directory - package.json not found >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)

echo Step 1: Verifying Node.js installation...
echo [%DATE% %TIME%] Step 1: Node.js verification >> %LOG_FILE%

REM Node.js version check
node --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo [%DATE% %TIME%] ERROR: Node.js not found >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
echo SUCCESS: Node.js found - %NODE_VERSION%
echo [%DATE% %TIME%] Node.js version: %NODE_VERSION% >> %LOG_FILE%

echo.
echo Step 2: Installing dependencies...
echo [%DATE% %TIME%] Step 2: npm install start >> %LOG_FILE%

REM Check if node_modules already exists to avoid redundant installation
if exist "node_modules" (
    echo INFO: Dependencies already installed, skipping npm install
    echo [%DATE% %TIME%] Dependencies already present, skipped >> %LOG_FILE%
    goto :syntax_check
)

REM Run npm install with timeout and error handling
echo Running npm install...
timeout /t 2 >nul 2>&1
npm install --silent --no-progress >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo WARNING: Silent install failed, trying verbose mode...
    npm install
    if !ERRORLEVEL! NEQ 0 (
        echo ERROR: npm install failed
        echo [%DATE% %TIME%] ERROR: npm install failed >> %LOG_FILE%
        if "%POWERSHELL_MODE%"=="false" pause
        exit /b 1
    )
)

echo SUCCESS: Dependencies installed
echo [%DATE% %TIME%] Dependencies installation completed >> %LOG_FILE%

:syntax_check

echo.
echo Step 3: Syntax check...
echo [%DATE% %TIME%] Step 3: Syntax check >> %LOG_FILE%

node --check server.js
if !ERRORLEVEL! NEQ 0 (
    echo ERROR: server.js has syntax errors
    echo [%DATE% %TIME%] ERROR: server.js syntax error >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)

echo SUCCESS: Syntax check passed
echo [%DATE% %TIME%] Syntax check passed >> %LOG_FILE%

echo.
echo Step 4: OAuth configuration...
echo [%DATE% %TIME%] Step 4: OAuth setup start >> %LOG_FILE%

REM Check if OAuth is already configured
set "OAUTH_CONFIGURED=false"
if exist .env (
    findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "OAUTH_CONFIGURED=true"
        echo INFO: OAuth already configured, skipping setup
        echo [%DATE% %TIME%] OAuth already configured >> %LOG_FILE%
    )
)

if "%OAUTH_CONFIGURED%"=="false" (
    if "%POWERSHELL_MODE%"=="true" (
        echo Running automated OAuth setup...
        node scripts/oauth-setup.cjs --web
    ) else (
        echo.
        echo OAuth setup is required for full functionality
        echo This will open a web browser for Google authentication
        echo.
        set /p "OAUTH_CHOICE=Run OAuth setup now? [Y/n]: "
        if /i "!OAUTH_CHOICE!"=="n" (
            echo Skipping OAuth setup
            echo You can run it later with: npm run oauth-setup
            echo [%DATE% %TIME%] OAuth setup skipped by user >> %LOG_FILE%
        ) else (
            echo Running OAuth setup...
            node scripts/oauth-setup.cjs --web
            echo [%DATE% %TIME%] OAuth setup completed >> %LOG_FILE%
        )
    )
    
    REM Verify OAuth configuration
    if exist .env (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo SUCCESS: OAuth configured successfully
            echo [%DATE% %TIME%] OAuth verification successful >> %LOG_FILE%
        ) else (
            echo WARNING: OAuth configuration incomplete
            echo You can complete it later with: npm run oauth-setup
            echo [%DATE% %TIME%] OAuth verification failed >> %LOG_FILE%
        )
    )
)

echo.
echo Step 5: Claude Desktop configuration...
echo [%DATE% %TIME%] Step 5: Claude Desktop config start >> %LOG_FILE%

REM Get Node.js absolute path
for /f "tokens=*" %%i in ('where node') do set "NODE_PATH=%%i"
echo Node.js path: %NODE_PATH%

REM Update Claude Desktop configuration
node scripts/update-claude-config.cjs
if !ERRORLEVEL! NEQ 0 (
    echo WARNING: Failed to update Claude Desktop configuration
    echo You may need to update it manually
    echo [%DATE% %TIME%] Claude Desktop config update failed >> %LOG_FILE%
) else (
    echo SUCCESS: Claude Desktop configuration updated
    echo [%DATE% %TIME%] Claude Desktop config updated >> %LOG_FILE%
)

echo.
echo Step 6: Final verification...
echo [%DATE% %TIME%] Step 6: Final verification >> %LOG_FILE%

REM Create process info file
node -e "
const fs = require('fs');
const path = require('path');
const info = {
    version: '3.0.1',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    timestamp: new Date().toISOString()
};
fs.writeFileSync('install-verification.json', JSON.stringify(info, null, 2));
console.log('Verification file created');
"

if exist install-verification.json (
    echo SUCCESS: Installation verification completed
    echo [%DATE% %TIME%] Installation verification successful >> %LOG_FILE%
) else (
    echo WARNING: Verification file creation failed
    echo [%DATE% %TIME%] Verification file creation failed >> %LOG_FILE%
)

echo.
echo =================================================================
echo                    INSTALLATION COMPLETED
echo =================================================================
echo.
echo Next steps:
echo 1. Restart Claude Desktop application
echo 2. Enable "Local MCP servers" in Claude Desktop settings
echo 3. Test connection with: claude-appsscript-pro:test_connection
echo.
echo If OAuth was skipped, run: npm run oauth-setup
echo.
echo Installation log: %LOG_FILE%
echo [%DATE% %TIME%] Installation completed successfully >> %LOG_FILE%
echo.

if "%POWERSHELL_MODE%"=="false" (
    echo Press any key to exit...
    pause >nul
)

echo Installation completed at %DATE% %TIME%
exit /b 0
