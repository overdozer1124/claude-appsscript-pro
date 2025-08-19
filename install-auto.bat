@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

REM Claude-AppsScript-Pro 完全自動インストーラー ASCII版
REM バージョン: 2.1.1 - 文字エンコーディング問題解決版

REM PowerShell実行検出
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"

REM 完全自動モード
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro ASCII Installer v2.1.1

echo.
echo =================================================================
echo    Claude-AppsScript-Pro Auto Installer v2.1.1 ASCII Edition
echo                  PowerShell Compatible Safe Version
echo =================================================================
echo.
echo Start Time: %TIME%
echo Working Directory: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo Execution Mode: PowerShell Full Auto Mode
) else (
    echo Execution Mode: Interactive Installation Mode
)
echo.

REM インストールログ作成
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] Full Auto Installation Started > %LOG_FILE%

REM ステップ1: 基本インストール実行
echo [1/4] Executing Basic Installation...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Basic installation failed
    echo Log File: %LOG_FILE% - Check for details
    echo.
    echo Please resolve issues and retry
    echo [%DATE% %TIME%] Basic Installation Error >> %LOG_FILE%
    pause
    exit /b 1
)
echo SUCCESS: Basic Installation Complete

REM ステップ2: OAuth設定確認
echo [2/4] Checking OAuth Configuration...

REM .envファイル存在確認
if not exist .env (
    if "%POWERSHELL_MODE%"=="true" (
        echo PowerShell Auto Mode: Starting automatic OAuth setup
        call :AutoOAuth
        goto :AutoOAuthCheck
    ) else (
        echo.
        echo OAuth configuration is required for tool functionality
        echo Would you like to configure OAuth now? (Y/N)
        echo   - This will open browser for Google authentication
        echo   - Required for Google Apps Script API access
        set /p OAUTH_CHOICE="Choice (Y/N): "
        if /i "!OAUTH_CHOICE!"=="Y" (
            echo Starting OAuth configuration...
            echo [%DATE% %TIME%] OAuth Setup Started (User Choice) >> %LOG_FILE%
            node scripts/oauth-setup.cjs --web
            echo [%DATE% %TIME%] OAuth Setup Completed (User Choice) >> %LOG_FILE%
            
            REM 設定結果確認
            if exist .env (
                findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
                if !ERRORLEVEL! EQU 0 (
                    echo SUCCESS: OAuth configuration completed
                    echo [%DATE% %TIME%] OAuth Setup Success (After User Setup) >> %LOG_FILE%
                ) else (
                    echo WARNING: OAuth configuration incomplete
                    echo Manual setup required: npm run oauth-setup
                    echo [%DATE% %TIME%] OAuth Setup Failed (After User Setup) >> %LOG_FILE%
                )
            ) else (
                echo WARNING: OAuth configuration failed
                echo Manual setup required: npm run oauth-setup
                echo [%DATE% %TIME%] OAuth Setup Failed (After Retry) >> %LOG_FILE%
            )
        ) else (
            echo WARNING: OAuth configuration skipped
            echo Installation will continue but tools will not work
            echo [%DATE% %TIME%] OAuth Setup Skipped (User Choice) >> %LOG_FILE%
            if "%POWERSHELL_MODE%"=="false" pause
        )
    )
) else (
    REM 既存設定確認
    findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo SUCCESS: OAuth already configured
        echo [%DATE% %TIME%] OAuth Already Configured >> %LOG_FILE%
    ) else (
        echo WARNING: Existing .env found but REFRESH_TOKEN missing
        if "%POWERSHELL_MODE%"=="true" (
            echo PowerShell Auto Mode: Re-running OAuth setup
            call :AutoOAuth
            goto :AutoOAuthCheck
        ) else (
            echo Would you like to reconfigure OAuth? (Y/N)
            set /p OAUTH_RECONFIG="Choice (Y/N): "
            if /i "!OAUTH_RECONFIG!"=="Y" (
                echo Reconfiguring OAuth...
                echo [%DATE% %TIME%] OAuth Reconfiguration Started >> %LOG_FILE%
                node scripts/oauth-setup.cjs --web
                echo [%DATE% %TIME%] OAuth Reconfiguration Completed >> %LOG_FILE%
                
                REM 再設定結果確認
                findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
                if !ERRORLEVEL! EQU 0 (
                    echo SUCCESS: OAuth reconfiguration completed
                    echo [%DATE% %TIME%] OAuth Reconfiguration Success >> %LOG_FILE%
                ) else (
                    echo WARNING: OAuth reconfiguration failed
                    echo Manual setup required: npm run oauth-setup
                    echo [%DATE% %TIME%] OAuth Reconfiguration Failed >> %LOG_FILE%
                )
            ) else (
                echo WARNING: OAuth reconfiguration skipped
                echo Manual setup may be required later: npm run oauth-setup
                echo [%DATE% %TIME%] OAuth Reconfiguration Skipped >> %LOG_FILE%
                if "%POWERSHELL_MODE%"=="false" pause
            )
        )
    )
)
goto :OAuthVerificationComplete

:AutoOAuth
echo Running automatic OAuth setup...
echo [%DATE% %TIME%] Auto OAuth Setup Started >> %LOG_FILE%
node scripts/oauth-setup.cjs --web
echo [%DATE% %TIME%] Auto OAuth Setup Completed >> %LOG_FILE%
goto :AutoOAuthCheck

:AutoOAuthCheck
echo Checking OAuth setup results automatically...
if exist .env (
    findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo SUCCESS: OAuth configuration completed (Auto Mode)
        echo [%DATE% %TIME%] OAuth Setup Success (Auto Mode) >> %LOG_FILE%
    ) else (
        echo WARNING: OAuth configuration incomplete (Auto Mode)
        echo Manual setup required: npm run oauth-setup
        echo [%DATE% %TIME%] OAuth Setup Incomplete (Auto Mode) >> %LOG_FILE%
    )
) else (
    echo WARNING: .env file not created
    echo OAuth setup may have failed
    echo [%DATE% %TIME%] OAuth Setup Failed (Auto Mode - no env file) >> %LOG_FILE%
)
goto :OAuthVerificationComplete

:OAuthVerificationComplete
REM REFRESH_TOKENの最終確認
if exist .env (
    findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo SUCCESS: REFRESH_TOKEN verified in .env file
    ) else (
        echo WARNING: REFRESH_TOKEN not found in .env
        echo OAuth configuration may be incomplete
    )
)
goto :OAuthComplete

:OAuthComplete

REM ステップ3: Claude Desktop設定
echo [3/4] Checking Claude Desktop Configuration...
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"
if exist "!CLAUDE_CONFIG!" (
    findstr /C:"claude-appsscript-pro" "!CLAUDE_CONFIG!" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo SUCCESS: Claude Desktop already configured
        goto :ConfigComplete
    )
)

REM PowerShellモード時は自動実行
if "%POWERSHELL_MODE%"=="true" (
    echo PowerShell Auto Mode: Updating Claude Desktop config automatically
    call :AutoClaudeConfig
    goto :ConfigComplete
)

REM 対話型モードでは従来通りユーザー確認
echo Would you like to update Claude Desktop configuration? (Y/N)
echo    Existing configuration file will be updated safely
set /p CONFIG_CHOICE="Choice (Y/N): "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo INFO: Claude Desktop configuration skipped
    echo Manual configuration required (can be done later)
)

goto :ConfigComplete

:AutoClaudeConfig
echo Updating Claude Desktop configuration...
echo [%DATE% %TIME%] Claude Desktop Config Update Started >> %LOG_FILE%

REM Node.js パスの自動検出
for /f "tokens=*" %%i in ('where node 2^>nul') do set "NODE_PATH=%%i"
if "!NODE_PATH!"=="" (
    set "NODE_PATH=C:\Program Files\nodejs\node.exe"
    echo WARNING: Node.js path not found. Using default: !NODE_PATH!
) else (
    echo SUCCESS: Node.js path detected: !NODE_PATH!
)

REM プロジェクトディレクトリの絶対パス
set "PROJECT_PATH=%CD%"

REM Claude Desktop設定ディレクトリ作成
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

REM 安全な設定更新（既存設定保護）
node scripts/update-claude-config.cjs "!NODE_PATH!" "!PROJECT_PATH!" >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Claude Desktop config update failed
    echo Manual configuration may be required
    echo [%DATE% %TIME%] Claude Desktop Config Update Failed >> %LOG_FILE%
) else (
    echo SUCCESS: Claude Desktop configuration updated
    echo [%DATE% %TIME%] Claude Desktop Config Update Success >> %LOG_FILE%
)

goto :ConfigComplete

:ConfigComplete

REM ステップ4: 最終構文チェック
echo [4/4] Running Final Syntax Check...
echo [%DATE% %TIME%] Final Syntax Check Started >> %LOG_FILE%

REM server.js構文チェック
node --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: server.js syntax check failed
    echo Log File: %LOG_FILE% - Check syntax errors
    echo Installation cannot complete with syntax errors
    echo [%DATE% %TIME%] Syntax Check Failed >> %LOG_FILE%
    pause
    exit /b 1
) else (
    echo SUCCESS: server.js syntax check passed
    echo [%DATE% %TIME%] Syntax Check Success >> %LOG_FILE%
)

REM 最終完了表示
echo.
echo =================================================================
echo                    Installation Complete!
echo =================================================================
echo.
echo SUCCESS: Claude-AppsScript-Pro v3.0.1 Basic Installation Complete
echo Completion Time: %TIME%
echo Log File: %LOG_FILE%
echo.

REM OAuth設定状況確認
echo Checking final OAuth configuration status...
if exist .env (
    findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo SUCCESS: OAuth configuration fully complete - All ready!
            echo    - CLIENT_ID: Configured
            echo    - REFRESH_TOKEN: Configured
            set OAUTH_READY=true
        ) else (
            echo WARNING: OAuth configuration incomplete
            echo    - CLIENT_ID: Configured
            echo    - REFRESH_TOKEN: Not configured
            echo Manual setup required: npm run oauth-setup
            set OAUTH_READY=false
        )
    ) else (
        echo WARNING: OAuth configuration not complete
        echo    - CLIENT_ID: Not configured
        echo    - REFRESH_TOKEN: Not configured
        echo Manual setup required: npm run oauth-setup
        set OAUTH_READY=false
    )
) else (
    echo WARNING: .env file does not exist
    echo OAuth configuration required: npm run oauth-setup
    set OAUTH_READY=false
)

echo.
echo If problems occur:
echo    - Check log file %LOG_FILE%
echo    - Refer to TROUBLESHOOTING.md
echo    - Report to GitHub Issues
echo.

REM 完了メッセージと手動操作案内
echo.
echo Installation Work Complete!
echo.
if "!OAUTH_READY!"=="true" (
    echo SUCCESS: Current Status:
    echo    - Basic Installation: Complete
    echo    - OAuth Configuration: Complete (CLIENT_ID + REFRESH_TOKEN)
    echo    - Claude Desktop Configuration: Complete
    echo    - Syntax Check: Passed
    echo.
    echo Manually restart Claude Desktop to enable tools immediately
) else (
    echo WARNING: Current Status:
    echo    - Basic Installation: Complete
    echo    - OAuth Configuration: Incomplete
    echo    - Claude Desktop Configuration: Complete
    echo    - Syntax Check: Passed
    echo.
    echo Manually restart Claude Desktop after completing OAuth setup
)
echo.

echo Next Steps (Manual Operations):
echo    1. Exit Claude Desktop
echo    2. Restart Claude Desktop
if "!OAUTH_READY!"=="false" (
    echo    3. Run OAuth setup: npm run oauth-setup
    echo    4. Restart Claude Desktop again manually
)
echo    3. claude-appsscript-pro tools will be available
echo.

echo Final Verification:
if "!OAUTH_READY!"=="true" (
    echo SUCCESS: Everything complete! Manually restart Claude Desktop
    echo Test command: claude-appsscript-pro:test_connection
) else (
    echo WARNING: OAuth configuration incomplete
    echo Next Steps:
    echo    1. OAuth setup: npm run oauth-setup
    echo    2. Manually restart Claude Desktop
    echo    3. claude-appsscript-pro tools will be available
)

echo.
echo IMPORTANT: Claude Desktop restart must be done manually
echo    - No automatic startup performed
echo    - User can safely restart at their timing

echo [%DATE% %TIME%] Installation Complete >> %LOG_FILE%
echo.
echo Setup Complete!

echo.
echo Thank you for your patience!
echo    Claude-AppsScript-Pro v3.0.1 setup has been completed
echo.
pause
