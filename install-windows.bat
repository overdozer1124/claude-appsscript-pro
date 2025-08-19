@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: Claude-AppsScript-Pro Windows 基本インストールスクリプト
:: v1.0.0 - 基本機能版

echo.
echo 🚀 Claude-AppsScript-Pro Windows インストール開始
echo ========================================================

:: Node.js 確認
echo 📋 Step 1: Node.js バージョン確認
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js が見つかりません
    echo    https://nodejs.org/ からインストールしてください
    pause
    exit /b 1
)
echo ✅ Node.js 確認完了

:: 依存関係インストール
echo.
echo 📋 Step 2: 依存関係インストール
npm install
if errorlevel 1 (
    echo ❌ npm install 失敗
    pause
    exit /b 1
)
echo ✅ 依存関係インストール完了

:: 構文チェック
echo.
echo 📋 Step 3: 構文チェック
node --check server.js
if errorlevel 1 (
    echo ❌ 構文エラーが見つかりました
    pause
    exit /b 1
)
echo ✅ 構文チェック完了

:: OAuth設定案内
echo.
echo 📋 Step 4: OAuth設定
echo    手動でOAuth設定を実行してください:
echo    npm run oauth-setup
echo.
echo ⚠️  注意: .env ファイルを手動で確認してください

:: Claude Desktop設定案内
echo.
echo 📋 Step 5: Claude Desktop設定
echo    以下の設定を claude_desktop_config.json に追加してください:
echo.
echo    "claude-appsscript-pro": {
echo        "command": "node",
echo        "args": ["server.js"],
echo        "cwd": "%cd%"
echo    }

echo.
echo 🎊 基本インストール完了！
echo    次のステップ:
echo    1. npm run oauth-setup でOAuth設定
echo    2. Claude Desktop 再起動
echo    3. MCP接続確認
echo.
pause
