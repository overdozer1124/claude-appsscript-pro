@echo off
setlocal EnableDelayedExpansion

REM Enhanced Auto Installer with Progress Bar
REM Claude-AppsScript-Pro Complete Auto Installer v4.0.0
REM Features: Visual progress bar, enhanced error handling, step tracking

REM UTF-8 Encoding Setup
chcp 65001 >nul 2>&1

REM PowerShell execution detection
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"

REM Full auto mode
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro Auto Installer v4.0.0

REM Progress tracking variables
set "TOTAL_STEPS=6"
set "CURRENT_STEP=0"

REM Progress bar function
:show_progress
set /a PROGRESS_PERCENT=(%CURRENT_STEP% * 100) / %TOTAL_STEPS%
set "PROGRESS_BAR="
set "PROGRESS_EMPTY="

REM Create progress bar (20 characters width)
set /a FILLED_CHARS=(%PROGRESS_PERCENT% * 20) / 100
set /a EMPTY_CHARS=20 - %FILLED_CHARS%

for /L %%i in (1,1,%FILLED_CHARS%) do set "PROGRESS_BAR=!PROGRESS_BAR!█"
for /L %%i in (1,1,%EMPTY_CHARS%) do set "PROGRESS_EMPTY=!PROGRESS_EMPTY!░"

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║         Claude-AppsScript-Pro Auto Installer v4.0.0              ║
echo ║              Visual Progress Bar Enhanced Edition                 ║
echo ╠══════════════════════════════════════════════════════════════════╣
echo ║ Progress: [!PROGRESS_BAR!!PROGRESS_EMPTY!] %PROGRESS_PERCENT%%% ^(%CURRENT_STEP%/%TOTAL_STEPS%^) ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
goto :eof

REM Initial display
call :show_progress

REM Log file setup
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Installation started (v4.0.0 with progress bar) >> %LOG_FILE%

REM Working directory verification
echo 📂 Current directory: %CD%
echo [%DATE% %TIME%] Working directory: %CD% >> %LOG_FILE%

REM Check if we're in correct directory
if not exist package.json (
    echo ❌ ERROR: package.json not found in current directory
    echo Please run this installer from the claude-appsscript-pro directory
    echo [%DATE% %TIME%] ERROR: Wrong directory - package.json not found >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)

REM =================================================================
REM STEP 1: Node.js Verification
REM =================================================================
set /a CURRENT_STEP=1
call :show_progress

echo 🔍 Step %CURRENT_STEP%: Verifying Node.js installation...
echo [%DATE% %TIME%] Step %CURRENT_STEP%: Node.js verification >> %LOG_FILE%

node --version >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo [%DATE% %TIME%] ERROR: Node.js not found >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
echo ✅ SUCCESS: Node.js found - %NODE_VERSION%
echo [%DATE% %TIME%] Node.js version: %NODE_VERSION% >> %LOG_FILE%

timeout /t 1 >nul 2>&1

REM =================================================================
REM STEP 2: Dependencies Installation
REM =================================================================
set /a CURRENT_STEP=2
call :show_progress

echo 📦 Step %CURRENT_STEP%: Installing dependencies...
echo [%DATE% %TIME%] Step %CURRENT_STEP%: npm install start >> %LOG_FILE%

REM Check if node_modules already exists
if exist "node_modules" (
    echo ℹ️  INFO: Dependencies already installed, skipping npm install
    echo [%DATE% %TIME%] Dependencies already present, skipped >> %LOG_FILE%
    goto :syntax_check
)

echo 🔄 Installing dependencies with silent output...
set "RETRY_COUNT=0"
set "MAX_RETRIES=3"

:npm_install_retry
set /a RETRY_COUNT+=1
echo 📥 Attempt %RETRY_COUNT% of %MAX_RETRIES%...
echo [%DATE% %TIME%] npm install attempt %RETRY_COUNT% >> %LOG_FILE%

REM Configure npm
call npm config set registry https://registry.npmjs.org/ >nul 2>&1
call npm config set fetch-retries 5 >nul 2>&1
call npm config set fetch-retry-mintimeout 10000 >nul 2>&1
call npm config set fetch-retry-maxtimeout 60000 >nul 2>&1

REM Clear cache on retry
if %RETRY_COUNT% GTR 1 (
    echo 🧹 Clearing npm cache...
    call npm cache clean --force >nul 2>&1
    echo [%DATE% %TIME%] npm cache cleared >> %LOG_FILE%
)

REM Install with progress indicators
echo 📡 Installing dependencies (silent mode)...
call npm install --silent --no-progress --no-fund 2>nul
set "NPM_EXIT_CODE=!ERRORLEVEL!"

if !NPM_EXIT_CODE! EQU 0 (
    echo ✅ SUCCESS: Dependencies installed successfully
    echo [%DATE% %TIME%] Dependencies installation completed on attempt %RETRY_COUNT% >> %LOG_FILE%
    goto :npm_install_complete
) else (
    echo ⚠️  WARNING: npm install failed with exit code !NPM_EXIT_CODE!
    echo [%DATE% %TIME%] npm install failed on attempt %RETRY_COUNT% with exit code !NPM_EXIT_CODE! >> %LOG_FILE%
    
    if !RETRY_COUNT! LSS !MAX_RETRIES! (
        echo ⏳ Retrying in 3 seconds...
        timeout /t 3 >nul 2>&1
        goto :npm_install_retry
    ) else (
        echo 🔍 ERROR: All attempts failed, trying with verbose output...
        call npm install --verbose
        set "VERBOSE_EXIT_CODE=!ERRORLEVEL!"
        
        if !VERBOSE_EXIT_CODE! NEQ 0 (
            echo ❌ ERROR: Installation failed completely
            echo.
            echo 🔧 Troubleshooting suggestions:
            echo 1. Check internet connection
            echo 2. Try: npm cache clean --force
            echo 3. Restart and try again
            echo 4. Check antivirus software
            echo.
            echo [%DATE% %TIME%] ERROR: All npm install attempts failed >> %LOG_FILE%
            if "%POWERSHELL_MODE%"=="false" pause
            exit /b 1
        )
    )
)

:npm_install_complete
timeout /t 1 >nul 2>&1

:syntax_check

REM =================================================================
REM STEP 3: Syntax Verification
REM =================================================================
set /a CURRENT_STEP=3
call :show_progress

echo 🔍 Step %CURRENT_STEP%: Syntax verification...
echo [%DATE% %TIME%] Step %CURRENT_STEP%: Syntax check >> %LOG_FILE%

call node --check server.js >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ❌ ERROR: server.js has syntax errors
    echo [%DATE% %TIME%] ERROR: server.js syntax error >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)

echo ✅ SUCCESS: Syntax check passed
echo [%DATE% %TIME%] Syntax check passed >> %LOG_FILE%
timeout /t 1 >nul 2>&1

REM =================================================================
REM STEP 4: OAuth Configuration
REM =================================================================
set /a CURRENT_STEP=4
call :show_progress

echo 🔐 Step %CURRENT_STEP%: OAuth configuration...
echo [%DATE% %TIME%] Step %CURRENT_STEP%: OAuth setup start >> %LOG_FILE%

REM Check if OAuth is already configured
set "OAUTH_CONFIGURED=false"
if exist .env (
    findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "OAUTH_CONFIGURED=true"
        echo ℹ️  INFO: OAuth already configured, skipping setup
        echo [%DATE% %TIME%] OAuth already configured >> %LOG_FILE%
    )
)

if "%OAUTH_CONFIGURED%"=="false" (
    if "%POWERSHELL_MODE%"=="true" (
        echo 🌐 Running automated OAuth setup...
        call node scripts/oauth-setup.cjs --web
    ) else (
        echo.
        echo 🔑 OAuth setup is required for full functionality
        echo This will open a web browser for Google authentication
        echo.
        set /p "OAUTH_CHOICE=Run OAuth setup now? [Y/n]: "
        if /i "!OAUTH_CHOICE!"=="n" (
            echo ⏭️  Skipping OAuth setup
            echo You can run it later with: npm run oauth-setup
            echo [%DATE% %TIME%] OAuth setup skipped by user >> %LOG_FILE%
        ) else (
            echo 🚀 Running OAuth setup...
            call node scripts/oauth-setup.cjs --web
            echo [%DATE% %TIME%] OAuth setup completed >> %LOG_FILE%
        )
    )
    
    REM Verify OAuth configuration
    if exist .env (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo ✅ SUCCESS: OAuth configured successfully
            echo [%DATE% %TIME%] OAuth verification successful >> %LOG_FILE%
        ) else (
            echo ⚠️  WARNING: OAuth configuration incomplete
            echo You can complete it later with: npm run oauth-setup
            echo [%DATE% %TIME%] OAuth verification failed >> %LOG_FILE%
        )
    )
)

timeout /t 1 >nul 2>&1

REM =================================================================
REM STEP 5: Claude Desktop Configuration
REM =================================================================
set /a CURRENT_STEP=5
call :show_progress

echo ⚙️  Step %CURRENT_STEP%: Claude Desktop configuration...
echo [%DATE% %TIME%] Step %CURRENT_STEP%: Claude Desktop config start >> %LOG_FILE%

REM Get Node.js absolute path
for /f "tokens=*" %%i in ('where node') do set "NODE_PATH=%%i"
echo 📍 Node.js path: %NODE_PATH%

REM Update Claude Desktop configuration
call node scripts/update-claude-config.cjs >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️  WARNING: Failed to update Claude Desktop configuration
    echo You may need to update it manually
    echo [%DATE% %TIME%] Claude Desktop config update failed >> %LOG_FILE%
) else (
    echo ✅ SUCCESS: Claude Desktop configuration updated
    echo [%DATE% %TIME%] Claude Desktop config updated >> %LOG_FILE%
)

timeout /t 1 >nul 2>&1

REM =================================================================
REM STEP 6: Final Verification
REM =================================================================
set /a CURRENT_STEP=6
call :show_progress

echo 🔍 Step %CURRENT_STEP%: Final verification...
echo [%DATE% %TIME%] Step %CURRENT_STEP%: Final verification >> %LOG_FILE%

REM Run verification script
call node scripts/verification.js >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo ✅ SUCCESS: Verification script completed
    echo [%DATE% %TIME%] Verification script successful >> %LOG_FILE%
) else (
    echo ⚠️  WARNING: Verification script failed
    echo [%DATE% %TIME%] Verification script failed >> %LOG_FILE%
)

REM Check verification file
if exist install-verification.json (
    echo ✅ SUCCESS: Verification file created
    echo [%DATE% %TIME%] Verification file found >> %LOG_FILE%
) else (
    echo ⚠️  WARNING: Verification file not found
    echo [%DATE% %TIME%] Verification file missing >> %LOG_FILE%
)

timeout /t 1 >nul 2>&1

REM =================================================================
REM INSTALLATION COMPLETED
REM =================================================================
call :show_progress

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║                    🎉 INSTALLATION COMPLETED! 🎉                  ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.
echo 📋 Next steps:
echo 1. 🔄 Restart Claude Desktop application
echo 2. ⚙️  Enable "Local MCP servers" in Claude Desktop settings
echo 3. 🧪 Test connection with: claude-appsscript-pro:test_connection
echo.
echo 💡 If OAuth was skipped, run: npm run oauth-setup
echo.
echo 📄 Installation log: %LOG_FILE%
echo [%DATE% %TIME%] Installation completed successfully >> %LOG_FILE%
echo.

if "%POWERSHELL_MODE%"=="false" (
    echo Press any key to exit...
    pause >nul
)

echo 🎊 Installation completed at %DATE% %TIME%
exit /b 0
