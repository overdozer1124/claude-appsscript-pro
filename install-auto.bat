@echo off
setlocal EnableDelayedExpansion

REM ASCII-only version to avoid encoding issues completely
REM Claude-AppsScript-Pro Complete Auto Installer
REM Version: 3.1.1 - Improved npm logging and compatibility

REM PowerShell execution detection
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"

REM Full auto mode
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro Auto Installer v3.1.1 (Improved)

echo.
echo =================================================================
echo    Claude-AppsScript-Pro Complete Auto Installer v3.1.0
echo          Improved npm logging and compatibility
echo =================================================================
echo.

REM Log file setup
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Installation started (Improved version 3.1.1) >> %LOG_FILE%

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

REM Enhanced npm install with retry mechanism for virtual environments
echo Running npm install with retry support...
set "RETRY_COUNT=0"
set "MAX_RETRIES=3"

:npm_install_retry
set /a RETRY_COUNT+=1
echo Attempt %RETRY_COUNT% of %MAX_RETRIES%...
echo [%DATE% %TIME%] npm install attempt %RETRY_COUNT% >> %LOG_FILE%

REM Configure npm for better virtual environment compatibility
  echo Configuring npm settings for stability...
  call npm config set registry https://registry.npmjs.org/ 2>nul || echo Warning: npm config setting failed, continuing...
  call npm config set fetch-retries 5 2>nul || echo Warning: npm config setting failed, continuing...
  call npm config set fetch-retry-mintimeout 10000 2>nul || echo Warning: npm config setting failed, continuing...
  call npm config set fetch-retry-maxtimeout 60000 2>nul || echo Warning: npm config setting failed, continuing...
  call npm config set timeout 300000 2>nul || echo Warning: npm config setting failed, continuing...

REM Clear npm cache to avoid partial downloads
if %RETRY_COUNT% GTR 1 (
    echo Clearing npm cache...
    call npm cache clean --force >nul 2>&1
    echo [%DATE% %TIME%] npm cache cleared >> %LOG_FILE%
)

REM Run npm install with minimal logging for clean output
echo Installing dependencies (this may take a few minutes)...
call npm install --loglevel=warn --no-progress --no-audit
set "NPM_EXIT_CODE=!ERRORLEVEL!"

if !NPM_EXIT_CODE! EQU 0 (
    echo SUCCESS: Dependencies installed successfully
    echo [%DATE% %TIME%] Dependencies installation completed on attempt %RETRY_COUNT% >> %LOG_FILE%
    goto :npm_install_complete
) else (
    echo WARNING: npm install failed with exit code !NPM_EXIT_CODE!
    echo [%DATE% %TIME%] npm install failed on attempt %RETRY_COUNT% with exit code !NPM_EXIT_CODE! >> %LOG_FILE%
    
    if !RETRY_COUNT! LSS !MAX_RETRIES! (
        echo Retrying in 5 seconds...
        timeout /t 5 >nul 2>&1
        goto :npm_install_retry
    ) else (
        echo ERROR: All npm install attempts failed
        echo This may be due to network issues or virtual environment limitations
        echo.
        echo Troubleshooting suggestions:
        echo 1. Check internet connection
        echo 2. Try running: npm install --verbose
        echo 3. Clear npm cache: npm cache clean --force
        echo 4. Restart and try again
        echo.
        echo [%DATE% %TIME%] ERROR: All npm install attempts exhausted >> %LOG_FILE%
        if "%POWERSHELL_MODE%"=="false" pause
        exit /b 1
    )
)

:npm_install_complete

:syntax_check

echo.
echo Step 3: Syntax check...
echo [%DATE% %TIME%] Step 3: Syntax check >> %LOG_FILE%

call node --check server.js
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
        call node scripts/oauth-setup.cjs --web
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
            call node scripts/oauth-setup.cjs --web
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
call node scripts/update-claude-config.cjs
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

REM Run verification script (FIXED - using external JS file)
call node scripts/verification.js
if !ERRORLEVEL! EQU 0 (
    echo SUCCESS: Verification script completed
    echo [%DATE% %TIME%] Verification script successful >> %LOG_FILE%
) else (
    echo WARNING: Verification script failed
    echo [%DATE% %TIME%] Verification script failed >> %LOG_FILE%
)

REM Check if verification file was created
if exist install-verification.json (
    echo SUCCESS: Verification file created
    echo [%DATE% %TIME%] Verification file found >> %LOG_FILE%
) else (
    echo WARNING: Verification file not found
    echo [%DATE% %TIME%] Verification file missing >> %LOG_FILE%
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
