@echo off
echo.
echo 🚀 Claude-AppsScript-Pro v2.1.0 - 超簡単インストーラー
echo ================================================
echo.
echo 📥 GitHubからプロジェクトをダウンロード中...

REM 一時ディレクトリ作成
set TEMP_DIR=%TEMP%\claude-appsscript-pro-temp
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"
cd /d "%TEMP_DIR%"

REM プロジェクトクローン
git clone https://github.com/overdozer1124/claude-appsscript-pro.git
if errorlevel 1 (
    echo ❌ Git clone failed. Please install Git first.
    pause
    exit /b 1
)

REM プロジェクトディレクトリに移動
cd claude-appsscript-pro

echo ✅ ダウンロード完了
echo.
echo 📦 依存関係をインストール中...

REM 依存関係インストール
call npm install
if errorlevel 1 (
    echo ❌ npm install failed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ インストール完了
echo.
echo 🚀 自動セットアップを開始中...

REM 自動インストーラー実行
call install-auto.bat

echo.
echo 🎉 Claude-AppsScript-Pro v2.1.0 セットアップ完了！
echo.
echo 📋 次のステップ:
echo    1. Claude Desktop を再起動
echo    2. 設定 → 開発者 → ローカルMCPサーバーを有効化
echo    3. Claude で claude-appsscript-pro:test_connection を実行
echo.
pause
