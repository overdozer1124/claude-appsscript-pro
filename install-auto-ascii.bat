@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

echo.
echo ================================================================================
echo  Claude-AppsScript-Pro v3.0.2 - Revolutionary Auto Installer (ASCII Safe)
echo ================================================================================
echo  Google Apps Script Development - Next Generation Efficiency Platform
echo  Transform your development experience in just 3 minutes!
echo.
echo  Execution Flow:
echo    Step 1. Smart OAuth Configuration (via Beautiful Web Interface)
echo    Step 2. Claude Desktop Safe Configuration (Preserve existing settings)
echo    Step 3. MCP Server Activation Complete!
echo.
echo  Features:
echo    * 61 Integrated Development Tools
echo    * AI-Powered Autonomous Workflow System
echo    * Real-time Browser Debugging
echo    * 99%% Output Reduction Technology
echo    * Cross-platform OAuth Web Interface
echo.

:: Log file configuration
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Auto Installation Started > %LOG_FILE%

echo Starting intelligent OAuth configuration...
echo.

:: OAuth status verification
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo [SUCCESS] OAuth configuration already completed!
    echo CLIENT_ID + REFRESH_TOKEN are properly configured
    echo [%DATE% %TIME%] OAuth configuration verified >> %LOG_FILE%
    goto :OAuthComplete
)

echo.
echo *** REVOLUTIONARY WEB-BASED OAUTH SETUP ***
echo Beautiful and intuitive interface prepared for you!
echo JSON upload feature available for instant configuration!
echo.

set /p OAUTH_CHOICE="Start revolutionary OAuth setup now? (Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
    echo.
    echo Launching advanced OAuth configuration system...
    call :AutoOAuth
) else (
    echo.
    echo For manual setup later, run: npm run oauth-setup
    echo.
    echo [%DATE% %TIME%] OAuth setup postponed >> %LOG_FILE%
)

:OAuthComplete
echo.
echo *** CLAUDE DESKTOP CONFIGURATION PHASE ***
echo Updating Claude Desktop configuration with safety protection...

call :UpdateClaudeDesktop
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Claude Desktop configuration completed safely!
    echo [%DATE% %TIME%] Claude Desktop config updated >> %LOG_FILE%
) else (
    echo [WARNING] Claude Desktop configuration needs manual attention
    echo [%DATE% %TIME%] Claude Desktop config warning >> %LOG_FILE%
)

echo.
echo *** SYSTEM VALIDATION PHASE ***
echo Performing comprehensive system checks...

:: Syntax validation
call :ValidateSystem
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] All system validations passed!
    echo [%DATE% %TIME%] System validation success >> %LOG_FILE%
) else (
    echo [ERROR] System validation detected issues
    echo [%DATE% %TIME%] System validation failed >> %LOG_FILE%
    goto :Error
)

echo.
echo ================================================================================
echo  INSTALLATION COMPLETED SUCCESSFULLY!
echo ================================================================================
echo.
echo  Your Claude-AppsScript-Pro v3.0.2 is now ready for revolutionary development!
echo.
echo  Next Steps:
echo    1. Restart Claude Desktop application
echo    2. Enable "Local MCP Servers" in Claude Desktop settings
echo    3. Test connection: claude-appsscript-pro:test_connection
echo.
echo  Available Tools: 61 integrated development tools
echo  AI Features: Autonomous workflow system activated
echo  Debug Tools: Real-time browser debugging enabled
echo.
echo  Happy Developing! Your Google Apps Script journey begins now!
echo.

echo [%DATE% %TIME%] Installation completed successfully >> %LOG_FILE%
echo.
echo IMPORTANT: Please restart Claude Desktop manually
echo           - We do not automatically restart for your safety
echo           - You can restart at your convenience
echo.
pause
goto :EOF

:: ==============================================================================
:: FUNCTION: CheckOAuthStatus
:: ==============================================================================
:CheckOAuthStatus
set "OAUTH_STATUS=INCOMPLETE"

if not exist .env (
    echo [INFO] .env file does not exist - OAuth setup required
    echo [%DATE% %TIME%] .env not found >> %LOG_FILE%
    goto :EOF
)

:: Check for required OAuth parameters
findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] CLIENT_ID not configured - OAuth setup required
    echo [%DATE% %TIME%] CLIENT_ID missing >> %LOG_FILE%
    goto :EOF
)

findstr /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=" .env >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [INFO] REFRESH_TOKEN not configured - OAuth setup required
    echo [%DATE% %TIME%] REFRESH_TOKEN missing >> %LOG_FILE%
    goto :EOF
)

:: Verify token is not empty
for /f "tokens=2 delims==" %%i in ('findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=" .env') do (
    set "TOKEN_VALUE=%%i"
)

if "!TOKEN_VALUE!"=="" (
    echo [INFO] REFRESH_TOKEN is empty - OAuth setup required
    echo [%DATE% %TIME%] REFRESH_TOKEN empty >> %LOG_FILE%
    goto :EOF
)

set "OAUTH_STATUS=COMPLETE"
echo [%DATE% %TIME%] OAuth status verified as complete >> %LOG_FILE%
goto :EOF

:: ==============================================================================
:: FUNCTION: AutoOAuth
:: ==============================================================================
:AutoOAuth
echo.
echo Initializing revolutionary OAuth system...
echo.

:: Start OAuth setup with web interface
node scripts/oauth-setup.cjs --web
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] OAuth configuration completed successfully!
    echo [%DATE% %TIME%] OAuth setup completed >> %LOG_FILE%
) else (
    echo [ERROR] OAuth setup encountered an issue
    echo [%DATE% %TIME%] OAuth setup failed >> %LOG_FILE%
    echo.
    echo Troubleshooting options:
    echo   1. Check internet connection
    echo   2. Verify Google Cloud Console settings
    echo   3. Try manual setup: npm run oauth-setup
    echo.
    set /p CONTINUE_CHOICE="Continue installation anyway? (Y/N): "
    if /i "!CONTINUE_CHOICE!" neq "Y" (
        echo Installation aborted by user request
        goto :Error
    )
)

goto :EOF

:: ==============================================================================
:: FUNCTION: UpdateClaudeDesktop
:: ==============================================================================
:UpdateClaudeDesktop
echo.
echo Updating Claude Desktop configuration with advanced safety features...

node scripts/update-claude-config.cjs
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Claude Desktop configuration updated safely
    echo [%DATE% %TIME%] Claude config updated successfully >> %LOG_FILE%
    exit /b 0
) else (
    echo [WARNING] Claude Desktop configuration update encountered issues
    echo [%DATE% %TIME%] Claude config update warning >> %LOG_FILE%
    echo.
    echo Manual configuration may be required:
    echo   Location: %%APPDATA%%\Claude\claude_desktop_config.json
    echo.
    exit /b 1
)

:: ==============================================================================
:: FUNCTION: ValidateSystem
:: ==============================================================================
:ValidateSystem
echo.
echo Performing comprehensive system validation...

:: Check Node.js availability
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not accessible
    echo [%DATE% %TIME%] Node.js validation failed >> %LOG_FILE%
    exit /b 1
)

:: Syntax validation for server.js
echo Validating server.js syntax...
node --check server.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] server.js syntax validation failed
    echo [%DATE% %TIME%] server.js syntax error >> %LOG_FILE%
    exit /b 1
)

:: Package dependencies check
echo Validating package dependencies...
if not exist node_modules (
    echo [WARNING] node_modules not found - running npm install
    npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed
        echo [%DATE% %TIME%] npm install failed >> %LOG_FILE%
        exit /b 1
    )
)

echo [SUCCESS] All system validations completed
echo [%DATE% %TIME%] System validation success >> %LOG_FILE%
exit /b 0

:: ==============================================================================
:: ERROR HANDLER
:: ==============================================================================
:Error
echo.
echo ================================================================================
echo  INSTALLATION ENCOUNTERED AN ISSUE
echo ================================================================================
echo.
echo  Don't worry! This is often easily resolvable.
echo.
echo  Common solutions:
echo    1. Restart this installer (most issues resolve automatically)
echo    2. Check internet connection for OAuth setup
echo    3. Verify Node.js installation: node --version
echo    4. Review log file: install-auto.log
echo.
echo  For detailed troubleshooting, see: TROUBLESHOOTING.md
echo.

echo [%DATE% %TIME%] Installation error occurred >> %LOG_FILE%
pause
exit /b 1
