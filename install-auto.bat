@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion
echo.
echo ===============================================================================
echo Claude-AppsScript-Pro Auto Installer v3.0.2
echo ===============================================================================
echo Google Apps Script Development - Revolutionary Efficiency!
echo The most exciting development experience awaits you!
echo.
echo Execution Flow:
echo  1. OAuth Setup (via attractive Web interface)
echo  2. Claude Desktop Configuration (safe update)
echo  3. MCP Server Completion!
echo.

:: Log file setting
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Auto Installation Started > %LOG_FILE%

echo Starting OAuth setup...
echo.

:: OAuth status check
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo [SUCCESS] OAuth setup already completed!
    echo CLIENT_ID + REFRESH_TOKEN are properly configured
    echo [%DATE% %TIME%] OAuth setup verified >> %LOG_FILE%
    goto :OAuthComplete
)

echo Starting attractive OAuth setup Web application...
echo Beautiful and enjoyable interface prepared for you!
echo.

set /p OAUTH_CHOICE="Start OAuth setup now? (Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
    echo.
    echo Starting attractive OAuth setup!
    call :AutoOAuth
) else (
    echo.
    echo For later setup, please run: npm run oauth-setup
    echo.
    echo [%DATE% %TIME%] OAuth setup skipped >> %LOG_FILE%
)

:OAuthComplete
echo.
echo Updating Claude Desktop configuration automatically...
node scripts/update-claude-config.cjs >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Claude Desktop configuration updated automatically!
    echo [%DATE% %TIME%] Claude Desktop config auto-update completed >> %LOG_FILE%
) else (
    echo [WARNING] Auto-update failed. Manual configuration guide:
    echo [%DATE% %TIME%] Claude Desktop config auto-update failed >> %LOG_FILE%
    call :ShowManualConfig
)

echo.
echo Running server.js syntax check...
node --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Syntax check completed! Everything is normal
    echo [%DATE% %TIME%] Syntax check success >> %LOG_FILE%
) else (
    echo [WARNING] Syntax errors found...
    echo [%DATE% %TIME%] Syntax check failed >> %LOG_FILE%
    echo Details: Please check %LOG_FILE%
)

echo.
echo ===============================================================================
echo                    COMPLETED! Congratulations!
echo.
echo    Claude-AppsScript-Pro v3.0.2 setup completed successfully
echo.
echo                  Your amazing development journey begins!
echo ===============================================================================
echo.

echo Next Steps:
echo.
echo   1. Restart Claude Desktop
echo      - Required to apply settings
echo.
echo   2. Run connection test in Claude
echo      - claude-appsscript-pro:test_connection
echo.
echo   3. Start exciting development!
echo      - Try: "Create a task management system for Web use"
echo.

echo Installation Details:
echo   Tools: 61 powerful tools
echo   Features: AI autonomous development, real-time debugging, full automation
echo   Log file: %LOG_FILE%
echo.

echo IMPORTANT: Please restart Claude Desktop manually
echo    - Automatic startup is not performed
echo    - You can safely restart at your timing

echo [%DATE% %TIME%] Installation completed >> %LOG_FILE%
echo.
echo Setup completed successfully!

echo.
echo Thank you for your hard work!
echo    Claude-AppsScript-Pro v3.0.2 setup is now complete
echo.
pause
goto :eof

:: =============================================================================
:: Subroutine: OAuth Status Check
:: =============================================================================
:CheckOAuthStatus
set "OAUTH_STATUS=INCOMPLETE"

:: Check .env file existence
if not exist ".env" (
    set "OAUTH_STATUS=INCOMPLETE"
    goto :eof
)

:: Check CLIENT_ID and REFRESH_TOKEN
findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID" .env >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set "OAUTH_STATUS=INCOMPLETE"
    goto :eof
)

findstr /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN" .env >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set "OAUTH_STATUS=INCOMPLETE"
    goto :eof
)

:: Check that CLIENT_ID and REFRESH_TOKEN are not empty
for /f "tokens=2 delims==" %%i in ('findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID" .env') do (
    if "%%i"=="" (
        set "OAUTH_STATUS=INCOMPLETE"
        goto :eof
    )
)

for /f "tokens=2 delims==" %%i in ('findstr /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN" .env') do (
    if "%%i"=="" (
        set "OAUTH_STATUS=INCOMPLETE"
        goto :eof
    )
)

set "OAUTH_STATUS=COMPLETE"
goto :eof

:: =============================================================================
:: Subroutine: Auto OAuth Setup
:: =============================================================================
:AutoOAuth
echo Running OAuth setup script...
node scripts/oauth-setup.cjs >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] OAuth setup completed successfully!
    echo [%DATE% %TIME%] OAuth setup completed >> %LOG_FILE%
) else (
    echo [WARNING] OAuth setup error occurred...
    echo [%DATE% %TIME%] OAuth setup error >> %LOG_FILE%
    echo Details: Please check %LOG_FILE%
    echo.
    echo Manual setup method:
    echo    Run: npm run oauth-setup
)
goto :eof

:: =============================================================================
:: Subroutine: Manual Configuration Guide
:: =============================================================================
:ShowManualConfig
echo.
echo Manual configuration guide:
echo.
echo Config file location: %APPDATA%\Claude\claude_desktop_config.json
echo.
echo Configuration content to add:
echo.
echo {
echo   "mcpServers": {
echo     "claude-appsscript-pro": {
echo       "command": "node",
echo       "args": ["%CD%\server.js"],
echo       "cwd": "%CD%"
echo     }
echo   }
echo }
echo.
goto :eof
