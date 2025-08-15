@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー
:: バージョン: 2.0.0 - 完全自動化版

title Claude-AppsScript-Pro 完全自動インストーラー

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   Claude-AppsScript-Pro 完全自動インストーラー v2.0.0       ║
echo ║               🚀 ワンクリック自動セットアップ                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ⏱️  開始時刻: %TIME%
echo 📁 作業ディレクトリ: %CD%
echo.

:: インストールログ作成
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] 完全自動インストール開始 > %LOG_FILE%

:: ステップ1: 基本インストール実行
echo [1/4] 基本インストール実行中...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 基本インストールでエラーが発生しました
    echo 📄 ログファイル: %LOG_FILE% を確認してください
    echo ⚠️  インストールを続行します...
    echo [%DATE% %TIME%] 基本インストールエラー（続行） >> %LOG_FILE%
) else (
    echo ✅ 基本インストール完了
)

:: ステップ2: OAuth設定確認
echo [2/4] OAuth設定を確認中...
if exist .env (
    findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ OAuth設定済みを検出
        goto :OAuthComplete
    )
)

echo ⚠️  OAuth設定が必要です
echo ℹ️  OAuth設定は対話式のため、自動実行後に手動で実行してください
echo 💡 次のコマンドを実行: npm run oauth-setup
echo [%DATE% %TIME%] OAuth設定スキップ（手動設定が必要） >> %LOG_FILE%

:OAuthComplete

:: ステップ3: Claude Desktop設定
echo [3/4] Claude Desktop設定を確認中...
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"
if exist "!CLAUDE_CONFIG!" (
    findstr /C:"claude-appsscript-pro" "!CLAUDE_CONFIG!" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Claude Desktop設定済み
        goto :ConfigComplete
    )
)

echo 🔧 Claude Desktop設定ファイルを自動更新中...
echo [%DATE% %TIME%] Claude Desktop設定自動更新開始 >> %LOG_FILE%

:: 設定ディレクトリ作成
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

:: Node.jsパス検出
set "NODE_PATH="
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_PATH=C:\\Program Files\\nodejs\\node.exe"
) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_PATH=C:\\Program Files (x86)\\nodejs\\node.exe"
) else (
    for /f "delims=" %%i in ('where node 2^>nul') do (
        set "NODE_PATH=%%i"
        set "NODE_PATH=!NODE_PATH:\=\\!"
        goto :NodePathFound
    )
)

:NodePathFound
set "CURRENT_DIR=%CD%"
set "CURRENT_DIR=!CURRENT_DIR:\=\\!"

:: 設定ファイル作成
(
    echo {
    echo   "mcpServers": {
    echo     "claude-appsscript-pro": {
    echo       "command": "!NODE_PATH!",
    echo       "args": ["!CURRENT_DIR!\\server.js"],
    echo       "cwd": "!CURRENT_DIR!"
    echo     }
    echo   }
    echo }
) > "!CLAUDE_CONFIG!"

echo ✅ Claude Desktop設定ファイル更新完了
echo 📁 設定場所: !CLAUDE_CONFIG!

:ConfigComplete

:: ステップ4: 動作確認
echo [4/4] 動作確認中...
echo 🧪 サーバー起動テスト実行中...
timeout /t 2 >nul
node --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ サーバー構文チェック成功
) else (
    echo ❌ サーバー構文チェックでエラー
)

:: 完了メッセージ
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
echo 🚀 次のステップ:
echo    1. OAuth設定: npm run oauth-setup
echo    2. Claude Desktop を再起動
echo    3. Claude で claude-appsscript-pro ツールが利用可能になります
echo.
echo 💡 問題が発生した場合:
echo    - ログファイル %LOG_FILE% を確認
echo    - TROUBLESHOOTING.md を参照
echo    - GitHub Issues に報告
echo.

:: 自動でClaude Desktop再起動
echo 🔄 Claude Desktop を自動再起動中...
taskkill /F /IM "Claude.exe" >nul 2>&1
timeout /t 3 >nul
start "" "%LOCALAPPDATA%\AnthropicClaude\Claude.exe" >nul 2>&1
echo ✅ Claude Desktop 再起動完了

echo [%DATE% %TIME%] 完全自動インストール完了 >> %LOG_FILE%
echo.
echo 🎊 基本セットアップが完了しました！
echo ⚠️  OAuth設定を忘れずに実行してください: npm run oauth-setup
echo.
