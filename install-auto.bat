@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー
:: バージョン: 3.0.1 - PowerShell対応・OAuth完全自動化版（修正版）

:: =========================
:: 実行モード判定
:: =========================
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"
if /i "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro 完全自動インストーラー v3.0.1

echo.
echo( ╔══════════════════════════════════════════════════════════════╗
echo( ║                                                              ║
echo( ║   Claude-AppsScript-Pro 完全自動インストーラー v3.0.1       ║
echo( ║               🚀 PowerShell対応・完全自動化版                ║
echo( ║                                                              ║
echo( ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  開始時刻: %TIME%
echo 📁 作業ディレクトリ: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 実行モード: PowerShell完全自動モード
) else (
    echo 👤 実行モード: 対話型インストールモード
)
echo.

:: 共有変数
set "LOG_FILE=install-auto.log"
set "NODE_CMD=node"
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_CMD=%ProgramFiles%\nodejs\node.exe"
set "SERVER_JS=%CD%\server.js"
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

echo [%DATE% %TIME%] 完全自動インストール開始 > "%LOG_FILE%"

:: =========================
:: サブルーチン定義
:: =========================
:: .env から OAuth 値を読み取り、HAS_CLIENT_ID / HAS_REFRESH_TOKEN を設定
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
      if defined REFRESH_TOKEN_VALUE (
        if "!REFRESH_TOKEN_VALUE:~0,3!"=="1//" set "HAS_REFRESH_TOKEN=1"
      )
    )
  )
)
exit /b 0

:: OAuth セットアップを実行（共通）
:RunOAuthSetup
echo [%DATE% %TIME%] OAuth設定開始 >> "%LOG_FILE%"
echo 🚀 OAuth設定を開始中...
echo.
echo 📋 注意: OAuth設定には手動でのGoogle認証が必要です
echo    1. ブラウザが自動的に開きます
echo    2. Google認証を完了してください
echo    3. 認証後、このバッチは自動で続行します
echo.

"%NODE_CMD%" "scripts/oauth-setup.cjs" --web
set "OAUTH_SETUP_EXITCODE=!ERRORLEVEL!"
echo [%DATE% %TIME%] oauth-setup exitcode=!OAUTH_SETUP_EXITCODE! >> "%LOG_FILE%"

:: 実行後の自動検証
call :CheckOAuthVars
if defined HAS_CLIENT_ID if defined HAS_REFRESH_TOKEN (
  echo ✅ OAuth認証完了を自動検出 - REFRESH_TOKEN取得済み
  echo [%DATE% %TIME%] OAuth設定完了（自動検証OK） >> "%LOG_FILE%"
  exit /b 0
)

echo ⚠️  OAuth設定が完了していない可能性があります
echo    - .env の CLIENT_ID / REFRESH_TOKEN を確認してください
echo [%DATE% %TIME%] OAuth設定未完了（自動検証NG） >> "%LOG_FILE%"
exit /b 1

:: Claude Desktop の設定を自動更新（PowerShell使用）
:AutoClaudeConfig
echo [%DATE% %TIME%] Claude Desktop設定 自動更新開始 >> "%LOG_FILE%"
echo 🔧 Claude Desktop設定を更新します...

:: 既存ファイルのバックアップ
if exist "%CLAUDE_CONFIG%" (
  copy /y "%CLAUDE_CONFIG%" "%CLAUDE_CONFIG%.bak" >nul 2>&1
  echo 💾 既存設定のバックアップを作成: "%CLAUDE_CONFIG%.bak"
)

:: PowerShellで mcpServers にエントリを作成/更新
set "PS_CMD=$cfg=$env:APPDATA+'\Claude\claude_desktop_config.json';"
set "PS_CMD=%PS_CMD% if(Test-Path $cfg){$j=Get-Content $cfg -Raw ^| ConvertFrom-Json}else{$j=[pscustomobject]@{}};"
set "PS_CMD=%PS_CMD% if(-not $j.mcpServers){$j | Add-Member -NotePropertyName mcpServers -NotePropertyValue (@{})};"
set "PS_CMD=%PS_CMD% $cmd=$env:NODE_CMD; if([string]::IsNullOrEmpty($cmd)){$cmd='node'};"
set "PS_CMD=%PS_CMD% $j.mcpServers.'claude-appsscript-pro'=@{command=$cmd;args=@('%SERVER_JS%')};"
set "PS_CMD=%PS_CMD% $j | ConvertTo-Json -Depth 10 ^| Set-Content -Path $cfg -Encoding UTF8;"

powershell -NoProfile -ExecutionPolicy Bypass -Command "%PS_CMD%"
if errorlevel 1 (
  echo ❌ Claude Desktop設定の自動更新に失敗しました
  echo [%DATE% %TIME%] Claude Desktop設定 失敗 >> "%LOG_FILE%"
  exit /b 1
) else (
  echo ✅ Claude Desktop設定を更新しました
  echo [%DATE% %TIME%] Claude Desktop設定 成功 >> "%LOG_FILE%"
  exit /b 0
)

:: =========================
:: ステップ 1: 基本インストール
:: =========================
echo [1/4] 基本インストール実行中...
call install-windows.bat >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo ❌ 基本インストールでエラーが発生しました
    echo 📄 ログファイル: %LOG_FILE% を確認してください
    echo [%DATE% %TIME%] 基本インストールエラー >> "%LOG_FILE%"
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)
echo ✅ 基本インストール完了

:: =========================
:: ステップ 2: OAuth 設定
:: =========================
echo [2/4] OAuth設定を確認中...
call :CheckOAuthVars
if defined HAS_CLIENT_ID if defined HAS_REFRESH_TOKEN (
  echo ✅ OAuth設定済みを検出（CLIENT_ID + REFRESH_TOKEN）
  goto :OAuthComplete
)

echo ⚠️  OAuth設定が必要です
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 PowerShell自動モード: OAuth設定を自動実行します
    call :RunOAuthSetup
    goto :PostOAuthCheck
)

:: 対話型
echo.
echo 📋 Google Cloud Console で OAuth クライアント ID を作成（未済なら）
echo    1) https://console.cloud.google.com/apis/credentials
echo    2) 認証情報を作成 → OAuth 2.0 クライアント ID
echo    3) 種類: ウェブアプリケーション
echo    4) リダイレクトURI: http://localhost:3001/oauth/callback
echo.
echo 🔑 今すぐ OAuth 設定を実行しますか？ (Y/N)
set "OAUTH_CHOICE="
set /p OAUTH_CHOICE="選択 (Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
    call :RunOAuthSetup
) else (
    echo ℹ️  OAuth設定をスキップしました（後で npm run oauth-setup を実行してください）
    echo [%DATE% %TIME%] OAuth設定スキップ（ユーザー選択） >> "%LOG_FILE%"
    goto :OAuthComplete
)

:PostOAuthCheck
:: 成否の最終確認と任意の再試行
call :CheckOAuthVars
if defined HAS_REFRESH_TOKEN (
    echo ✅ .envで REFRESH_TOKEN を確認しました
) else (
    echo ⚠️  REFRESH_TOKEN が未取得です
    echo 🔄 OAuth設定を再試行しますか？ (Y/N)
    set "RETRY_OAUTH="
    set /p RETRY_OAUTH="選択 (Y/N): "
    if /i "!RETRY_OAUTH!"=="Y" (
        call :RunOAuthSetup
        call :CheckOAuthVars
        if not defined HAS_REFRESH_TOKEN (
            echo ❌ 再試行しても取得できませんでした。後で npm run oauth-setup を実行してください。
            echo [%DATE% %TIME%] OAuth設定失敗（再試行後） >> "%LOG_FILE%"
        )
    ) else (
        echo ℹ️  後から手動で npm run oauth-setup を実行してください
        echo [%DATE% %TIME%] OAuth設定スキップ（再試行拒否） >> "%LOG_FILE%"
    )
)

:OAuthComplete

:: =========================
:: ステップ 3: Claude Desktop 設定
:: =========================
echo [3/4] Claude Desktop設定を確認中...
if exist "%CLAUDE_CONFIG%" (
    findstr /C:"claude-appsscript-pro" "%CLAUDE_CONFIG%" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Claude Desktop設定済み
        goto :ConfigComplete
    )
)

if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 PowerShell自動モード: Claude Desktop設定を自動更新します
    call :AutoClaudeConfig
    goto :ConfigComplete
)

echo 🔧 Claude Desktop設定ファイルを更新しますか？ (Y/N)
echo    既存の設定ファイルがある場合は上書き（バックアップ作成）されます
set "CONFIG_CHOICE="
set /p CONFIG_CHOICE="選択 (Y/N): "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo ℹ️  Claude Desktop設定をスキップしました（後で手動設定可能）
)

:ConfigComplete

:: =========================
:: ステップ 4: 動作確認
:: =========================
echo [4/4] 動作確認中...
echo 🧪 サーバー起動テスト（構文チェック）...
timeout /t 2 >nul
"%NODE_CMD%" --check "%SERVER_JS%" >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
    echo ❌ サーバー構文チェックでエラーが発生しました
    echo 📄 詳細:
    echo.
    "%NODE_CMD%" --check "%SERVER_JS%"
    echo.
    echo [%DATE% %TIME%] サーバー構文チェックエラー >> "%LOG_FILE%"
    echo 💡 構文エラーを修正してから再実行してください
    if "%POWERSHELL_MODE%"=="false" (
        echo.
        echo 📋 続行しますか？ (Y/N)
        echo    Y: 構文エラーを無視して続行（非推奨）
        echo    N: インストールを中止
        set "SYNTAX_CONTINUE="
        set /p SYNTAX_CONTINUE="選択 (Y/N): "
        if /i "!SYNTAX_CONTINUE!"=="N" (
            echo ⚠️  インストールを中止しました
            pause
            exit /b 1
        ) else (
            echo ⚠️  構文エラーを無視して続行します（MCPサーバーが動作しない可能性）
        )
    )
) else (
    echo ✅ サーバー構文チェック成功
)

:: =========================
:: 完了メッセージ
:: =========================
echo.
echo( ╔══════════════════════════════════════════════════════════════╗
echo( ║                                                              ║
echo( ║                   🎉 インストール完了！                     ║
echo( ║                                                              ║
echo( ╚══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Claude-AppsScript-Pro v3.0.1 基本インストール完了
echo ⏱️  完了時刻: %TIME%
echo 📄 ログファイル: %LOG_FILE%
echo.

:: OAuth最終確認
echo 🔍 OAuth設定状況を最終確認中...
call :CheckOAuthVars
set "OAUTH_READY=false"
if defined HAS_CLIENT_ID if defined HAS_REFRESH_TOKEN (
  echo ✅ OAuth設定完全完了 - すべて準備完了！
  echo    - CLIENT_ID: 設定済み
  echo    - REFRESH_TOKEN: 設定済み
  set "OAUTH_READY=true"
) else (
  if defined HAS_CLIENT_ID (
    echo ⚠️  OAuth設定が不完全です
    echo    - CLIENT_ID: 設定済み
    echo    - REFRESH_TOKEN: 未設定
  ) else (
    echo ⚠️  OAuth設定が未完了です
    echo    - CLIENT_ID: 未設定
    echo    - REFRESH_TOKEN: 未設定
  )
  echo 💡 手動で実行: npm run oauth-setup
)

echo.
echo 💡 問題が発生した場合:
echo    - ログファイル %LOG_FILE% を確認
echo    - TROUBLESHOOTING.md を参照
echo    - GitHub Issues に報告
echo.

echo 🎊 インストール作業完了！
echo.
if /i "!OAUTH_READY!"=="true" (
    echo ✅ 現在の状況:
    echo    - 基本インストール: 完了
    echo    - OAuth設定: 完了（CLIENT_ID + REFRESH_TOKEN）
    echo    - Claude Desktop設定: 完了
    echo    - 構文チェック: 通過
    echo.
    echo 🚀 Claude Desktop を手動で再起動すると、すぐにツールが利用可能です
) else (
    echo ⚠️ 現在の状況:
    echo    - 基本インストール: 完了
    echo    - OAuth設定: 未完了
    echo    - Claude Desktop設定: 完了
    echo    - 構文チェック: 通過
    echo.
    echo 📋 OAuth設定完了後に Claude Desktop を手動で再起動してください
)

echo.
echo 📋 次の手順（手動操作）:
echo    1. Claude Desktop を終了
echo    2. Claude Desktop を再起動
if /i "!OAUTH_READY!"=="false" (
    echo    3. OAuth設定を実行: npm run oauth-setup
    echo    4. 再度 Claude Desktop を再起動
) else (
    echo    3. claude-appsscript-pro ツールが利用可能になります
)
echo.
echo 💡 重要: Claude Desktop の再起動は自動では行いません
echo    - ユーザーのタイミングで安全に再起動できます

echo [%DATE% %TIME%] インストール完了 >> "%LOG_FILE%"
echo.
echo 🎊 セットアップが完了しました！
echo.
echo おつかれさまでした！
pause
endlocal
