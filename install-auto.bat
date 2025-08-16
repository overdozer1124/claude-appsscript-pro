@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー
:: バージョン: 3.0.1 - BOM修正版+WebベースOAuth対応（v2025.08.16-5）

:: PowerShell実行検出（非対話的実行モード）
set "POWERSHELL_MODE=false"
set "AUTOMATED_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "AUTOMATED_MODE=true"

:: 完全自動モード（環境変数での制御）
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"
if "%AUTO_INSTALL_MODE%"=="true" set "AUTOMATED_MODE=true"

title Claude-AppsScript-Pro 完全自動インストーラー

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   Claude-AppsScript-Pro 完全自動インストーラー v3.0.1       ║
echo ║         BOM修正版 + WebベースOAuth設定対応                   ║
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
echo [%DATE% %TIME%] 完全自動インストール開始（v3.0.1） > %LOG_FILE%

:: ステップ1: 基本インストール実行
echo [1/4] 基本インストール実行中...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 基本インストールでエラーが発生しました
    echo 📄 ログファイル: %LOG_FILE% を確認してください
    echo.
    echo 💡 問題を解決してから再実行してください
    echo [%DATE% %TIME%] 基本インストールエラー >> %LOG_FILE%
    goto :error_exit
)

echo ✅ [1/4] 基本インストール完了
echo [%DATE% %TIME%] 基本インストール完了 >> %LOG_FILE%

:: ステップ2: OAuth重複実行問題の解決
echo [2/4] OAuth設定確認中...

:: REFRESH_TOKENが既に存在するかチェック
set "REFRESH_TOKEN_EXISTS=false"
if exist ".env" (
    findstr /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "REFRESH_TOKEN_EXISTS=true"
        echo     ✅ 既存のREFRESH_TOKENが.envに見つかりました
        echo [%DATE% %TIME%] 既存REFRESH_TOKEN検出 >> %LOG_FILE%
    )
)

:: REFRESH_TOKENが存在する場合はOAuth設定をスキップ
if "%REFRESH_TOKEN_EXISTS%"=="true" (
    echo ✅ [2/4] OAuth設定済み - OAuth設定をスキップします
    echo [%DATE% %TIME%] OAuth設定済み - スキップ >> %LOG_FILE%
    goto :check_claude_desktop
)

:: WebベースOAuth設定の実行
echo [2/4] WebベースOAuth設定を開始します...
echo.
echo 🌐 WebベースOAuth設定について:
echo    - ブラウザでoauth-web-setup.htmlが開きます
echo    - 画面の指示に従ってGoogle認証を完了してください
echo    - 認証完了後、このウィンドウに戻ってください
echo.

:: oauth-web-setup.htmlの存在確認
if not exist "scripts\oauth-web-setup.html" (
    echo ❌ エラー: scripts\oauth-web-setup.html が見つかりません
    echo [%DATE% %TIME%] oauth-web-setup.html不存在エラー >> %LOG_FILE%
    goto :error_exit
)

:: WebベースOAuth設定を起動
echo 🚀 WebベースOAuth設定を起動しています...
start "" "scripts\oauth-web-setup.html"

echo.
echo 📋 次の手順を実行してください:
echo    1. 開いたブラウザでGoogle認証を完了する
echo    2. 設定完了後、任意のキーを押して続行する
echo.
pause

:: OAuth設定完了確認
set "OAUTH_COMPLETED=false"
if exist ".env" (
    findstr /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set "OAUTH_COMPLETED=true"
        echo ✅ OAuth設定が正常に完了しました
        echo [%DATE% %TIME%] OAuth設定完了確認 >> %LOG_FILE%
    )
)

if "%OAUTH_COMPLETED%"=="false" (
    echo ⚠️  警告: OAuth設定が完了していない可能性があります
    echo    手動でnpm run oauth-setupを実行することもできます
    echo [%DATE% %TIME%] OAuth設定未完了警告 >> %LOG_FILE%
)

echo ✅ [2/4] OAuth設定処理完了
echo [%DATE% %TIME%] OAuth設定処理完了 >> %LOG_FILE%

:check_claude_desktop
:: ステップ3: Claude Desktop設定
echo [3/4] Claude Desktop設定中...

:: Node.jsパスの取得
set "NODE_PATH="
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('where node') do set "NODE_PATH=%%i"
) else (
    set "NODE_PATH=C:\Program Files\nodejs\node.exe"
)

:: 現在のディレクトリ取得
set "CURRENT_DIR=%CD%"

:: Claude Desktop設定ファイルパス
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

:: Claude Desktop設定ファイル作成
echo {  > "%CLAUDE_CONFIG%"
echo   "mcpServers": {  >> "%CLAUDE_CONFIG%"
echo     "claude-appsscript-pro": {  >> "%CLAUDE_CONFIG%"
echo       "command": "%NODE_PATH%",  >> "%CLAUDE_CONFIG%"
echo       "args": ["%CURRENT_DIR%\server.js"],  >> "%CLAUDE_CONFIG%"
echo       "cwd": "%CURRENT_DIR%"  >> "%CLAUDE_CONFIG%"
echo     }  >> "%CLAUDE_CONFIG%"
echo   }  >> "%CLAUDE_CONFIG%"
echo }  >> "%CLAUDE_CONFIG%"

echo ✅ [3/4] Claude Desktop設定完了
echo     設定ファイル: %CLAUDE_CONFIG%
echo     Node.jsパス: %NODE_PATH%
echo     プロジェクトパス: %CURRENT_DIR%
echo [%DATE% %TIME%] Claude Desktop設定完了 >> %LOG_FILE%

:: ステップ4: 最終検証
echo [4/4] 最終検証中...

:: 構文チェック
echo     📝 server.js構文チェック実行中...
"%NODE_PATH%" --check server.js >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ エラー: server.js構文チェックに失敗しました
    echo [%DATE% %TIME%] 構文チェックエラー >> %LOG_FILE%
    goto :error_exit
)

echo     ✅ 構文チェック合格

:: .envファイル確認
if not exist ".env" (
    echo ⚠️  警告: .envファイルが見つかりません
    echo     OAuth設定が必要な可能性があります
    echo [%DATE% %TIME%] 警告: .envファイル不存在 >> %LOG_FILE%
) else (
    echo     ✅ .envファイル存在確認
)

echo ✅ [4/4] 最終検証完了
echo [%DATE% %TIME%] 最終検証完了 >> %LOG_FILE%

:: 成功完了
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║               🎉 インストール完了成功！                      ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo   Claude-AppsScript-Pro v3.0.1 セットアップが完了しました
echo.
echo   📋 次のステップ:
echo      1. Claude Desktopを手動で再起動してください
echo      2. 接続テスト: claude-appsscript-pro:test_connection
echo      3. 必要に応じてOAuth確認: npm run oauth-setup
echo.
echo   💡 重要: Claude Desktopの再起動は手動で行ってください
echo      - 自動起動は行いません
echo      - ユーザーのタイミングで安全に再起動できます
echo.

echo [%DATE% %TIME%] インストール完了成功 >> %LOG_FILE%
echo.
echo 🎊 セットアップが完了しました！
echo    Claude-AppsScript-Pro v3.0.1 のセットアップが完了しました
echo.
goto :end

:error_exit
echo.
echo ❌ エラー: インストールに失敗しました
echo    詳細は %LOG_FILE% を確認してください
echo [%DATE% %TIME%] インストール失敗 >> %LOG_FILE%
pause
exit /b 1

:end
pause
