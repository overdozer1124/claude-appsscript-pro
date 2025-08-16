@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー v2.1.0 - 論理改善版
:: 作成日: 2025.08.16 - OAuth重複実行問題・Claude Desktop設定問題を完全解決

:: 🔧 PowerShell実行検出（非対話的実行モード）
set "POWERSHELL_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"

:: 🚀 完全自動モード（環境変数での制御）
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro 完全自動インストーラー v2.1.0 - 論理改善版

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   Claude-AppsScript-Pro 完全自動インストーラー v2.1.0       ║
echo ║            🚀 OAuth重複実行問題・完全解決版                  ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  開始時刻: %TIME%
echo 📁 作業ディレクトリ: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 実行モード: PowerShell完全自動モード
) else (
    echo 👤 実行モード: 対話型インストールモード
)
echo.

:: インストールログ作成
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] 完全自動インストール開始（論理改善版） > %LOG_FILE%

:: =========================================================================
:: Step 1: 基本インストール実行
:: =========================================================================
echo [1/4] 基本インストール実行中...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 基本インストールでエラーが発生しました
    echo 📄 ログファイル: %LOG_FILE% を確認してください
    echo [%DATE% %TIME%] 基本インストールエラー >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause
    exit /b 1
)
echo ✅ 基本インストール完了
echo [%DATE% %TIME%] 基本インストール完了 >> %LOG_FILE%

:: =========================================================================
:: Step 2: OAuth設定確認・実行（論理改善）
:: =========================================================================
echo [2/4] OAuth設定を確認中...

:: OAuth状況を確認
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo ✅ OAuth設定済みを検出（CLIENT_ID + REFRESH_TOKEN）
    echo [%DATE% %TIME%] OAuth設定確認済み >> %LOG_FILE%
    goto :OAuthComplete
)

echo ⚠️  OAuth設定が必要です

:: PowerShellモード時は自動実行
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 PowerShell自動モード: OAuth設定を自動実行します
    call :AutoOAuth
    goto :OAuthVerificationStep
)

:: 対話型モードでのOAuth設定
echo.
echo 📋 Google Cloud Console で OAuth クライアント ID を作成する必要があります:
echo    1. https://console.cloud.google.com/apis/credentials
echo    2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」
echo    3. アプリケーションの種類: 「ウェブ アプリケーション」
echo    4. 承認済みリダイレクト URI: http://localhost:3001/oauth/callback
echo.
echo 🔑 OAuth設定を開始しますか？ (Y/N)
set /p OAUTH_CHOICE="選択 (Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
    call :AutoOAuth
) else (
    echo ℹ️  OAuth設定をスキップしました
    echo ⚠️  OAuth設定なしではツールは使用できません
    echo [%DATE% %TIME%] OAuth設定スキップ（ユーザー選択） >> %LOG_FILE%
    goto :OAuthComplete
)

:OAuthVerificationStep
:: OAuth設定後の確認
echo 🔍 OAuth設定結果を確認中...
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo ✅ OAuth設定が正常に完了しました
    echo [%DATE% %TIME%] OAuth設定完了 >> %LOG_FILE%
) else (
    echo ⚠️  OAuth設定が不完全です
    echo 💡 後で手動実行してください: npm run oauth-setup
    echo [%DATE% %TIME%] OAuth設定不完全 >> %LOG_FILE%
)

:OAuthComplete

:: =========================================================================
:: Step 3: Claude Desktop設定
:: =========================================================================
echo [3/4] Claude Desktop設定を確認中...
call :CheckClaudeConfig
if "%CLAUDE_CONFIG_STATUS%"=="COMPLETE" (
    echo ✅ Claude Desktop設定済み
    goto :ConfigComplete
)

:: PowerShellモード時は自動実行
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 PowerShell自動モード: Claude Desktop設定を自動更新します
    call :AutoClaudeConfig
    goto :ConfigComplete
)

:: 対話型モードでの設定確認
echo 🔧 Claude Desktop設定ファイルを更新しますか？ (Y/N)
echo    既存の設定ファイルがある場合は上書きされます
set /p CONFIG_CHOICE="選択 (Y/N): "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo ℹ️  Claude Desktop設定をスキップしました
    echo [%DATE% %TIME%] Claude Desktop設定スキップ >> %LOG_FILE%
)

:ConfigComplete

:: =========================================================================
:: Step 4: 動作確認
:: =========================================================================
echo [4/4] 動作確認中...
echo 🧪 サーバー起動テスト実行中...
node --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ サーバー構文チェック成功
    echo [%DATE% %TIME%] 構文チェック成功 >> %LOG_FILE%
) else (
    echo ❌ サーバー構文チェックでエラーが発生しました
    echo [%DATE% %TIME%] 構文チェックエラー >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" (
        echo 📋 続行しますか？ (Y/N)
        set /p SYNTAX_CONTINUE="選択 (Y/N): "
        if /i "!SYNTAX_CONTINUE!"=="N" (
            echo ⚠️  インストールを中止しました
            pause
            exit /b 1
        )
    )
    echo ⚠️  構文エラーを無視して続行します
)

:: =========================================================================
:: 完了報告
:: =========================================================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                   🎉 インストール完了！                     ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Claude-AppsScript-Pro v3.0.1 インストール完了
echo ⏱️  完了時刻: %TIME%
echo 📄 ログファイル: %LOG_FILE%
echo.

:: 最終状況確認
call :CheckOAuthStatus
call :CheckClaudeConfig

echo 📋 最終確認:
if "%OAUTH_STATUS%"=="COMPLETE" (
    if "%CLAUDE_CONFIG_STATUS%"=="COMPLETE" (
        echo ✅ すべて完了！Claude Desktop を手動で再起動してください
        echo 💡 動作確認: claude-appsscript-pro:test_connection
    ) else (
        echo ⚠️  Claude Desktop設定が未完了です
        echo 💡 手動設定が必要な場合があります
    )
) else (
    echo ⚠️  OAuth設定が未完了です
    echo 💡 手動で実行: npm run oauth-setup
)

echo.
echo 💡 重要: Claude Desktop の再起動は手動で行ってください
echo    - 自動起動は行いません
echo    - ユーザーのタイミングで安全に再起動できます

echo [%DATE% %TIME%] インストール完了 >> %LOG_FILE%
echo.
echo 🎊 セットアップが完了しました！

echo.
echo 💡 おつかれさまでした！
echo    Claude-AppsScript-Pro v3.0.1 のセットアップが完了しました
echo.
if "%POWERSHELL_MODE%"=="false" pause
goto :EOF

:: =========================================================================
:: サブルーチン定義
:: =========================================================================

:CheckOAuthStatus
:: OAuth設定状況を確認
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
:: 自動OAuth設定実行
echo 🚀 OAuth設定を開始します...
echo.
echo ⚠️  重要: 以下の手順で進めます
echo    1. Webサーバーを起動します
echo    2. ブラウザで Google 認証を完了してください
echo    3. 認証完了後、自動で次に進みます
echo.
if "%POWERSHELL_MODE%"=="false" (
    echo 📋 準備ができたらEnterキーを押してください...
    pause >nul
)

echo [%DATE% %TIME%] OAuth設定開始 >> %LOG_FILE%
echo 🔄 OAuth設定プロセスを開始中...
echo.

:: 🔧 修正: OAuth設定はユーザーに見える形で実行（ログリダイレクトなし）
node scripts/oauth-setup.cjs --web
set OAUTH_RESULT=%ERRORLEVEL%

echo.
echo [%DATE% %TIME%] OAuth設定完了（終了コード: %OAUTH_RESULT%） >> %LOG_FILE%
if %OAUTH_RESULT% EQU 0 (
    echo ✅ OAuth設定プロセス完了
) else (
    echo ⚠️  OAuth設定でエラーが発生しました（終了コード: %OAUTH_RESULT%）
    echo 💡 手動で再試行してください: npm run oauth-setup
)
goto :EOF

:CheckClaudeConfig
:: Claude Desktop設定確認
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
:: Claude Desktop設定自動更新
echo 🔧 Claude Desktop設定を更新中...
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"
set "CONFIG_DIR=%APPDATA%\Claude"

:: ディレクトリ作成
if not exist "!CONFIG_DIR!" (
    mkdir "!CONFIG_DIR!" >> %LOG_FILE% 2>&1
    echo 📁 Claude設定ディレクトリを作成しました
)

:: Node.jsパス取得とエスケープ処理
for /f "tokens=*" %%i in ('where node 2^>nul') do set "NODE_PATH=%%i"
if "!NODE_PATH!"=="" (
    set "NODE_PATH=C:\\Program Files\\nodejs\\node.exe"
    echo ⚠️  Nodeパスを標準パスに設定: !NODE_PATH!
) else (
    echo ✅ Nodeパス検出: !NODE_PATH!
    :: JSON用にバックスラッシュをエスケープ
    set "NODE_PATH=!NODE_PATH:\=\\!"
)

:: 現在のディレクトリパスをJSON用にエスケープ
set "CURRENT_DIR=%CD%"
set "CURRENT_DIR=!CURRENT_DIR:\=\\!"

:: 設定ファイル作成（JSONエスケープ対応）
echo { > "!CLAUDE_CONFIG!"
echo   "mcpServers": { >> "!CLAUDE_CONFIG!"
echo     "claude-appsscript-pro": { >> "!CLAUDE_CONFIG!"
echo       "command": "!NODE_PATH!", >> "!CLAUDE_CONFIG!"
echo       "args": ["!CURRENT_DIR!\\server.js"], >> "!CLAUDE_CONFIG!"
echo       "cwd": "!CURRENT_DIR!" >> "!CLAUDE_CONFIG!"
echo     } >> "!CLAUDE_CONFIG!"
echo   } >> "!CLAUDE_CONFIG!"
echo } >> "!CLAUDE_CONFIG!"

echo ✅ Claude Desktop設定ファイルを更新しました
echo 📄 設定ファイル場所: !CLAUDE_CONFIG!
echo [%DATE% %TIME%] Claude Desktop設定完了 >> %LOG_FILE%
goto :EOF
