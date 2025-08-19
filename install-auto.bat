@echo off
setlocal EnableExtensions EnableDelayedExpansion

:: ---- 重要: サブルーチンの先行実行を防ぐ ----
goto :MAIN

:: -------------------------------
:: サブルーチン: .env の OAuth 値確認
:: -------------------------------
:CheckOAuthVars
set "HAS_CLIENT_ID="
set "CLIENT_ID_VALUE="
set "HAS_REFRESH_TOKEN="
set "REFRESH_TOKEN_VALUE="
if exist ".env" (
  for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
    if /i "%%~A"=="GOOGLE_APP_SCRIPT_API_CLIENT_ID" (
      set "CLIENT_ID_VALUE=%%~B"
      if defined CLIENT_ID_VALUE set "HAS_CLIENT_ID=1"
    )
    if /i "%%~A"=="GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN" (
      set "REFRESH_TOKEN_VALUE=%%~B"
      if defined REFRESH_TOKEN_VALUE if "!REFRESH_TOKEN_VALUE:~0,3!"=="1//" set "HAS_REFRESH_TOKEN=1"
    )
  )
)
exit /b 0

:: -------------------------------
:: サブルーチン: OAuth セットアップ実行
:: -------------------------------
:RunOAuthSetup
echo [!DATE! !TIME!] OAuth setup start >> "!LOG_FILE!"
echo Starting OAuth setup...
"%NODE_CMD%" "scripts/oauth-setup.cjs" --web
set "OAUTH_SETUP_EXITCODE=!ERRORLEVEL!"
echo [!DATE! !TIME!] oauth-setup exitcode=!OAUTH_SETUP_EXITCODE! >> "!LOG_FILE!"
call :CheckOAuthVars
if defined HAS_CLIENT_ID if defined HAS_REFRESH_TOKEN (
  echo OAuth: refresh token detected.
  echo [!DATE! !TIME!] OAuth OK >> "!LOG_FILE!"
  exit /b 0
)
echo OAuth: refresh token NOT detected.
echo [!DATE! !TIME!] OAuth NG >> "!LOG_FILE!"
exit /b 1

:: -------------------------------
:: サブルーチン: Claude Desktop設定 自動更新
:: -------------------------------
:AutoClaudeConfig
echo [!DATE! !TIME!] Claude config update start >> "!LOG_FILE!"
set "PS_CMD=$cfg=$env:APPDATA+'\Claude\claude_desktop_config.json';"
set "PS_CMD=%PS_CMD% if(Test-Path $cfg){$j=Get-Content $cfg -Raw ^| ConvertFrom-Json}else{$j=[pscustomobject]@{}};"
set "PS_CMD=%PS_CMD% if(-not $j.mcpServers){$j | Add-Member -NotePropertyName mcpServers -NotePropertyValue (@{})};"
set "PS_CMD=%PS_CMD% $cmd=$env:NODE_CMD; if([string]::IsNullOrEmpty($cmd)){$cmd='node'};"
set "PS_CMD=%PS_CMD% $srv='%SERVER_JS%';"
set "PS_CMD=%PS_CMD% $j.mcpServers.'claude-appsscript-pro'=@{command=$cmd;args=@($srv)};"
set "PS_CMD=%PS_CMD% $j | ConvertTo-Json -Depth 10 ^| Set-Content -Path $cfg -Encoding UTF8;"
powershell -NoProfile -ExecutionPolicy Bypass -Command "%PS_CMD%"
if errorlevel 1 (
  echo Claude config update FAILED
  echo [!DATE! !TIME!] Claude config NG >> "!LOG_FILE!"
  exit /b 1
) else (
  echo Claude config updated.
  echo [!DATE! !TIME!] Claude config OK >> "!LOG_FILE!"
  exit /b 0
)

:: ===============================
:: メインフロー（装飾なし・ASCIIのみ）
:: ===============================
:MAIN
set "SCRIPT_VERSION=3.1.0"
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"
if /i "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

set "LOG_FILE=install-auto.log"
set "NODE_CMD=node"
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles(x86)%\nodejs\node.exe"
set "SERVER_JS=%CD%\server.js"
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

echo ============================================================
echo Claude-AppsScript-Pro Installer (SAFE ASCII MODE) v%SCRIPT_VERSION%
echo CWD: %CD%
echo Mode: %POWERSHELL_MODE%
echo Log: %LOG_FILE%
echo ============================================================
echo [%DATE% %TIME%] installer start > "%LOG_FILE%"

:: Step 1
echo [1/4] Running base install...
if not exist "install-windows.bat" (
  echo ERROR: install-windows.bat not found
  echo [%DATE% %TIME%] base installer missing >> "%LOG_FILE%"
  if "%POWERSHELL_MODE%"=="false" pause
  exit /b 1
)
call install-windows.bat >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo ERROR: base install error. See %LOG_FILE%.
  echo [%DATE% %TIME%] base install error >> "%LOG_FILE%"
  if "%POWERSHELL_MODE%"=="false" pause
  exit /b 1
)
echo OK: base install

:: Step 2
echo [2/4] Checking OAuth...
call :CheckOAuthVars
if defined HAS_CLIENT_ID if defined HAS_REFRESH_TOKEN (
  echo OAuth already configured.
  goto :OAuthComplete
)
echo OAuth not configured.
if "%POWERSHELL_MODE%"=="true" (
  call :RunOAuthSetup
  goto :AfterOAuthTry
)

echo Do you want to run OAuth setup now? (Y/N)
set "OAUTH_CHOICE="
set /p OAUTH_CHOICE="Choice (Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
  call :RunOAuthSetup
) else (
  echo Skipped OAuth setup (you can run: npm run oauth-setup)
  echo [%DATE% %TIME%] OAuth skipped by user >> "%LOG_FILE%"
  goto :OAuthComplete
)

:AfterOAuthTry
call :CheckOAuthVars
if defined HAS_REFRESH_TOKEN (
  echo OAuth refresh token found.
) else (
  echo OAuth refresh token NOT found.
  echo Retry OAuth setup? (Y/N)
  set "RETRY_OAUTH="
  set /p RETRY_OAUTH="Choice (Y/N): "
  if /i "!RETRY_OAUTH!"=="Y" (
    call :RunOAuthSetup
  ) else (
    echo Skipped retry. Continue.
  )
)

:OAuthComplete

:: Step 3
echo [3/4] Checking Claude Desktop config...
if exist "%CLAUDE_CONFIG%" (
  findstr /C:"claude-appsscript-pro" "%CLAUDE_CONFIG%" >nul 2>&1
  if !ERRORLEVEL! EQU 0 (
    echo Claude config already has entry.
    goto :ConfigComplete
  )
)
if "%POWERSHELL_MODE%"=="true" (
  call :AutoClaudeConfig
  goto :ConfigComplete
)
echo Update Claude Desktop config now? (Y/N)
set "CONFIG_CHOICE="
set /p CONFIG_CHOICE="Choice (Y/N): "
if /i "!CONFIG_CHOICE!"=="Y" (
  call :AutoClaudeConfig
) else (
  echo Skipped Claude config update.
)

:ConfigComplete

:: Step 4
echo [4/4] Syntax check server.js ...
"%NODE_CMD%" --check "%SERVER_JS%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo ERROR: server.js syntax check failed. See %LOG_FILE%.
  echo [%DATE% %TIME%] server check error >> "%LOG_FILE%"
) else (
  echo OK: server.js syntax check passed.
)

:: Summary
echo ============================================================
echo Install finished (SAFE ASCII MODE).
echo See log: %LOG_FILE%
echo ============================================================

:: Final OAuth status
call :CheckOAuthVars
set "OAUTH_READY=false"
if defined HAS_CLIENT_ID if defined HAS_REFRESH_TOKEN set "OAUTH_READY=true"

if /i "%OAUTH_READY%"=="true" (
  echo Status: Base=OK, OAuth=OK, ClaudeConfig=maybe OK, Syntax=checked
  echo Next: Restart Claude Desktop.
) else (
  echo Status: Base=OK, OAuth=NG, ClaudeConfig=maybe OK, Syntax=checked
  echo Next: Run "npm run oauth-setup" and restart Claude Desktop.
)

echo [%DATE% %TIME%] installer end >> "%LOG_FILE%"

if "%POWERSHELL_MODE%"=="false" pause
endlocal
