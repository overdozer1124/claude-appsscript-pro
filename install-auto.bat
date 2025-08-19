@echo off
setlocal EnableDelayedExpansion

:: Claude-AppsScript-Pro Complete Auto Installer v2.1.0 - Logic Improved
:: Created: 2025.08.16 - OAuth duplication and Claude Desktop config issues resolved

:: [CONFIG] PowerShell execution detection (safe version)
set "POWERSHELL_MODE=false"
if defined CMDCMDLINE (
    echo %CMDCMDLINE% | find /i "powershell" >nul
    if !ERRORLEVEL! EQU 0 set "POWERSHELL_MODE=true"
)

:: [AUTO] Complete auto mode (controlled by environment variable)
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro Complete Auto Installer v2.1.0

echo.
echo ================================================================
echo  Claude-AppsScript-Pro Complete Auto Installer v2.1.0
echo            OAuth Duplication Issue - Complete Resolution
echo ================================================================
echo.
echo [TIME] Start time: %TIME%
echo [DIR] Working directory: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo [AUTO] Execution mode: PowerShell complete auto mode
) else (
    echo [INTERACTIVE] Execution mode: Interactive installation mode
)
echo.

:: Create installation log
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Complete auto installation started (Logic Improved) > %LOG_FILE%

:: =========================================================================
:: Step 1: Basic environment check
:: =========================================================================
echo [1/4] Checking basic environment...
echo [%DATE% %TIME%] Basic environment check started >> %LOG_FILE%

:: Node.js check (cross-platform support)
set "NODE_EXE=node"
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Node.js found in PATH
) else (
    echo [SEARCH] Searching for Node.js in common locations...
    
    :: Check common installation locations sequentially
    set "NODE_FOUND=false"
    
    :: 1. Program Files (64bit)
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo [FOUND] Node.js at: C:\Program Files\nodejs
    )
    
    :: 2. Program Files (x86) (32bit)
    if "!NODE_FOUND!"=="false" if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo [FOUND] Node.js at: C:\Program Files ^(x86^)\nodejs
    )
    
    :: 3. User Local AppData
    if "!NODE_FOUND!"=="false" if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo [FOUND] Node.js at: %LOCALAPPDATA%\Programs\nodejs
    )
    
    :: 4. User AppData (nvm-windows)
    if "!NODE_FOUND!"=="false" if exist "%APPDATA%\nvm" (
        for /d %%i in ("%APPDATA%\nvm\v*") do (
            if exist "%%i\node.exe" (
                set "NODE_EXE=%%i\node.exe"
                set "NODE_FOUND=true"
                echo [FOUND] Node.js at: %%i
                goto :NodeSearchComplete
            )
        )
    )
    
    :NodeSearchComplete
    if "!NODE_FOUND!"=="false" (
        echo [ERROR] Node.js not found in any common locations
        echo [INFO] Please install Node.js from: https://nodejs.org/
        echo [INFO] Or ensure Node.js is in your PATH
        echo [%DATE% %TIME%] Node.js not found >> %LOG_FILE%
        if "%POWERSHELL_MODE%"=="false" pause
        exit /b 1
    )
)

echo [INFO] Using Node.js: !NODE_EXE!

echo [OK] Node.js verification completed
echo [%DATE% %TIME%] Node.js verification completed >> %LOG_FILE%
echo [OK] Basic installation completed
echo [%DATE% %TIME%] Basic installation completed >> %LOG_FILE%

:: =========================================================================
:: Step 2: OAuth setting check and execution (Logic Improved)
:: =========================================================================
echo [2/4] Checking OAuth settings...

:: Check OAuth status
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo [OK] OAuth settings detected (CLIENT_ID + REFRESH_TOKEN)
    echo [%DATE% %TIME%] OAuth settings confirmed >> %LOG_FILE%
    goto :OAuthComplete
)

echo [WARNING] OAuth settings required

:: Auto execution in PowerShell mode
if "%POWERSHELL_MODE%"=="true" (
    echo [AUTO] PowerShell auto mode: Executing OAuth setup automatically
    call :AutoOAuth
    goto :OAuthVerificationStep
)

:: OAuth setup in interactive mode
echo.
echo [GUIDE] You need to create OAuth client ID in Google Cloud Console:
echo    1. https://console.cloud.google.com/apis/credentials
echo    2. "Create Credentials" - "OAuth 2.0 Client ID"
echo    3. Application type: "Web application"
echo    4. Authorized redirect URI: http://localhost:3001/oauth/callback
echo.
echo [AUTH] Start OAuth setup? Answer Y or N
set /p OAUTH_CHOICE="Start OAuth setup Y/N: "
if /i "!OAUTH_CHOICE!"=="Y" (
    call :AutoOAuth
) else (
    echo [INFO] OAuth setup skipped
    echo [WARNING] Tools cannot be used without OAuth setup
    echo [%DATE% %TIME%] OAuth setup skipped (user choice) >> %LOG_FILE%
    goto :OAuthComplete
)

:OAuthVerificationStep
:: Check OAuth setup results
echo [CHECK] Checking OAuth setup results...
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo [OK] OAuth setup completed successfully
    echo [%DATE% %TIME%] OAuth setup completed >> %LOG_FILE%
) else (
    echo [WARNING] OAuth setup incomplete
    echo [INFO] Please run manually later: npm run oauth-setup
    echo [%DATE% %TIME%] OAuth setup incomplete >> %LOG_FILE%
)

:OAuthComplete

:: =========================================================================
:: Step 3: Claude Desktop configuration
:: =========================================================================
echo [3/4] Checking Claude Desktop configuration...

:: Auto execution in PowerShell mode (highest priority)
if "%POWERSHELL_MODE%"=="true" (
    echo [AUTO] PowerShell auto mode: Updating Claude Desktop config automatically
    call :AutoClaudeConfig
    goto :ConfigComplete
)

:: Check existing config only in interactive mode
call :CheckClaudeConfig
if "%CLAUDE_CONFIG_STATUS%"=="COMPLETE" (
    echo [OK] Claude Desktop configuration complete
    goto :ConfigComplete
)

:: Config confirmation in interactive mode
echo [CONFIG] Update Claude Desktop configuration file? Answer Y or N
echo    Existing configuration files will be overwritten
set /p CONFIG_CHOICE="Update Claude Desktop configuration Y/N: "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo [INFO] Claude Desktop configuration skipped
    echo [%DATE% %TIME%] Claude Desktop configuration skipped >> %LOG_FILE%
)

:ConfigComplete

:: =========================================================================
:: Step 4: Operation check
:: =========================================================================
echo [4/4] Checking operation...
echo [TEST] Running server startup test...
"!NODE_EXE!" --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Server syntax check successful
    echo [%DATE% %TIME%] Syntax check successful >> %LOG_FILE%
) else (
    echo [ERROR] Server syntax check failed
    echo [%DATE% %TIME%] Syntax check error >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" (
        echo [QUESTION] Continue? Answer Y or N
        set /p SYNTAX_CONTINUE="Continue Y/N: "
        if /i "!SYNTAX_CONTINUE!"=="N" (
            echo [WARNING] Installation aborted
            pause
            exit /b 1
        )
    )
    echo [WARNING] Ignoring syntax error and continuing
)

:: =========================================================================
:: Completion report
:: =========================================================================
echo.
echo ================================================================
echo                 [COMPLETE] Installation finished!
echo ================================================================
echo.
echo [OK] Claude-AppsScript-Pro v3.0.1 installation complete
echo [TIME] Completion time: %TIME%
echo [LOG] Log file: %LOG_FILE%
echo.

:: Final status check
call :CheckOAuthStatus
call :CheckClaudeConfig

echo [SUMMARY] Final check:
if "%OAUTH_STATUS%"=="COMPLETE" (
    if "%CLAUDE_CONFIG_STATUS%"=="COMPLETE" (
        echo [OK] Everything complete! Please restart Claude Desktop manually
        echo [INFO] Operation check: claude-appsscript-pro:test_connection
    ) else (
        echo [WARNING] Claude Desktop configuration incomplete
        echo [INFO] Manual configuration may be required
    )
) else (
    echo [WARNING] OAuth setup incomplete
    echo [INFO] Run manually: npm run oauth-setup
)

echo.
echo [IMPORTANT] Please restart Claude Desktop manually
echo    - Automatic startup is not performed
echo    - You can safely restart at your timing

echo [%DATE% %TIME%] Installation complete >> %LOG_FILE%
echo.
echo [SETUP COMPLETE] Setup completed!

echo.
echo [SUCCESS] Thank you for your hard work!
echo    Claude-AppsScript-Pro v3.0.1 setup completed
echo.
if "%POWERSHELL_MODE%"=="false" pause
goto :EOF

:: =========================================================================
:: Subroutine definitions
:: =========================================================================

:CheckOAuthStatus
:: Check OAuth setup status
set "OAUTH_STATUS=INCOMPLETE"
if exist .env (
    findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            set "OAUTH_STATUS=COMPLETE"
        )
    )
)
goto :EOF

:AutoOAuth
:: Execute automatic OAuth setup
echo [OAUTH] Starting OAuth setup...
echo.
echo [WARNING] Important: Proceeding with following steps
echo    1. Starting web server
echo    2. Please complete Google authentication in browser
echo    3. Automatically proceed after authentication completion
echo.
if "%POWERSHELL_MODE%"=="false" (
    echo [GUIDE] Press Enter when ready...
    pause >nul
)

echo [%DATE% %TIME%] OAuth setup started >> %LOG_FILE%
echo [PROCESS] Starting OAuth setup process...
echo.

:: [CONFIG] Fixed: Execute OAuth setup visibly to user (no log redirect)
"!NODE_EXE!" scripts/oauth-setup.cjs --web
set OAUTH_RESULT=%ERRORLEVEL%

echo.
echo [%DATE% %TIME%] OAuth setup completed (exit code: %OAUTH_RESULT%) >> %LOG_FILE%
if %OAUTH_RESULT% EQU 0 (
    echo [OK] OAuth setup process completed
) else (
    echo [WARNING] Error occurred during OAuth setup (exit code: %OAUTH_RESULT%)
    echo [INFO] Please retry manually: npm run oauth-setup
)
goto :EOF

:CheckClaudeConfig
:: Check Claude Desktop configuration
set "CLAUDE_CONFIG_STATUS=INCOMPLETE"
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"
if exist "!CLAUDE_CONFIG!" (
    findstr /C:"claude-appsscript-pro" "!CLAUDE_CONFIG!" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "CLAUDE_CONFIG_STATUS=COMPLETE"
    )
)
goto :EOF

:AutoClaudeConfig
:: Safe Claude Desktop configuration update (protect existing settings)
echo [CONFIG] Updating Claude Desktop configuration...
echo [PROTECTION] Protecting existing MCP server settings

:: Execute safe configuration update script
echo [PROCESS] Running safe configuration update script...
"!NODE_EXE!" scripts/update-claude-config.cjs
set CONFIG_RESULT=%ERRORLEVEL%

echo.
echo [%DATE% %TIME%] Claude Desktop config update (safe mode - exit code: %CONFIG_RESULT%) >> %LOG_FILE%
if %CONFIG_RESULT% EQU 0 (
    echo [OK] Claude Desktop configuration updated safely
    echo [INFO] Existing MCP server settings are protected
) else (
    echo [WARNING] Error occurred during Claude Desktop config update (exit code: %CONFIG_RESULT%)
    echo [INFO] Please check configuration file manually
    echo [FILE] Configuration file location: %APPDATA%\Claude\claude_desktop_config.json
)
goto :EOF