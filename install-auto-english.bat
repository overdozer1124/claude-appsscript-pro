@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro Complete Auto Installer
:: Version: 3.0.1 - Full Encoding & Character Fix (v2025.08.16-4)

:: PowerShell execution detection (non-interactive mode)
set "POWERSHELL_MODE=false"
set "AUTOMATED_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "AUTOMATED_MODE=true"

:: Complete auto mode (environment variable control)
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"
if "%AUTO_INSTALL_MODE%"=="true" set "AUTOMATED_MODE=true"

title Claude-AppsScript-Pro Complete Auto Installer

echo.
echo ================================================================
echo.
echo   Claude-AppsScript-Pro Complete Auto Installer v3.0.1
echo           Full Encoding and Character Fix Edition
echo.
echo ================================================================
echo.
echo Start time: %TIME%
echo Working directory: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo Execution mode: PowerShell Complete Auto Mode
) else (
    echo Execution mode: Interactive Installation Mode
)
echo.

:: Create installation log
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Complete auto installation started (v3.0.1) > %LOG_FILE%

:: Step 1: Basic installation execution
echo [1/4] Running basic installation...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Basic installation failed
    echo Log file: %LOG_FILE% - please check for details
    echo.
    echo Please resolve the issue and run again
    echo [%DATE% %TIME%] Basic installation error >> %LOG_FILE%
    goto :error_exit
)

echo [1/4] Basic installation completed
echo [%DATE% %TIME%] Basic installation completed >> %LOG_FILE%

:: Step 2: Check and resolve OAuth duplication
echo [2/4] Checking OAuth configuration...

:: Check if REFRESH_TOKEN already exists
set "REFRESH_TOKEN_EXISTS=false"
if exist ".env" (
    findstr /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "REFRESH_TOKEN_EXISTS=true"
        echo     Existing REFRESH_TOKEN found in .env
        echo [%DATE% %TIME%] Existing REFRESH_TOKEN detected >> %LOG_FILE%
    )
)

:: If REFRESH_TOKEN exists, skip OAuth setup
if "%REFRESH_TOKEN_EXISTS%"=="true" (
    echo [2/4] OAuth already configured - skipping OAuth setup
    echo [%DATE% %TIME%] OAuth already configured - skipped >> %LOG_FILE%
    goto :check_claude_desktop
)

:: Run OAuth setup only if needed
echo [2/4] Running OAuth setup...
if "%POWERSHELL_MODE%"=="true" (
    echo     PowerShell auto mode: Running OAuth setup automatically
    npm run oauth-setup >> %LOG_FILE% 2>&1
) else (
    echo     Interactive mode: Running OAuth setup
    npm run oauth-setup
)

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: OAuth setup failed
    echo [%DATE% %TIME%] OAuth setup error >> %LOG_FILE%
    goto :error_exit
)

echo [2/4] OAuth setup completed
echo [%DATE% %TIME%] OAuth setup completed >> %LOG_FILE%

:check_claude_desktop
:: Step 3: Claude Desktop configuration
echo [3/4] Configuring Claude Desktop...

:: Get Node.js path
set "NODE_PATH="
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('where node') do set "NODE_PATH=%%i"
) else (
    set "NODE_PATH=C:\Program Files\nodejs\node.exe"
)

:: Get current directory
set "CURRENT_DIR=%CD%"

:: Claude Desktop config path
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

:: Create Claude Desktop config
echo {  > "%CLAUDE_CONFIG%"
echo   "mcpServers": {  >> "%CLAUDE_CONFIG%"
echo     "claude-appsscript-pro": {  >> "%CLAUDE_CONFIG%"
echo       "command": "%NODE_PATH%",  >> "%CLAUDE_CONFIG%"
echo       "args": ["%CURRENT_DIR%\server.js"],  >> "%CLAUDE_CONFIG%"
echo       "cwd": "%CURRENT_DIR%"  >> "%CLAUDE_CONFIG%"
echo     }  >> "%CLAUDE_CONFIG%"
echo   }  >> "%CLAUDE_CONFIG%"
echo }  >> "%CLAUDE_CONFIG%"

echo [3/4] Claude Desktop configuration completed
echo [%DATE% %TIME%] Claude Desktop configuration completed >> %LOG_FILE%

:: Step 4: Final verification
echo [4/4] Running final verification...

:: Syntax check
echo     Checking server.js syntax...
"%NODE_PATH%" --check server.js >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: server.js syntax check failed
    echo [%DATE% %TIME%] Syntax check error >> %LOG_FILE%
    goto :error_exit
)

echo     Syntax check passed

:: Check .env file
if not exist ".env" (
    echo WARNING: .env file not found
    echo [%DATE% %TIME%] Warning: .env file not found >> %LOG_FILE%
) else (
    echo     .env file exists
)

echo [4/4] Final verification completed
echo [%DATE% %TIME%] Final verification completed >> %LOG_FILE%

:: Success completion
echo.
echo ================================================================
echo.
echo   INSTALLATION COMPLETED SUCCESSFULLY!
echo.
echo ================================================================
echo.
echo   Claude-AppsScript-Pro v3.0.1 setup is complete
echo.
echo   Next steps:
echo   1. Restart Claude Desktop manually
echo   2. Test connection: claude-appsscript-pro:test_connection
echo   3. Check OAuth if needed: npm run oauth-setup
echo.
echo   Important: Claude Desktop restart is manual
echo            - No automatic restart will be performed
echo            - You can safely restart when convenient
echo.

echo [%DATE% %TIME%] Installation completed successfully >> %LOG_FILE%
echo.
echo Setup completed successfully!
echo    Claude-AppsScript-Pro v3.0.1 setup is complete
echo.
goto :end

:error_exit
echo.
echo ERROR: Installation failed
echo Please check %LOG_FILE% for details
echo [%DATE% %TIME%] Installation failed >> %LOG_FILE%
pause
exit /b 1

:end
pause
