@echo off
echo Claude-AppsScript-Pro クイックセットアップ
echo ========================================
echo.
echo インストール方法を選択してください：
echo.
echo [1] Windowsでインストール
echo [2] macOS/Linuxでインストール
echo [3] 手動セットアップ
echo.
set /p choice="選択 (1-3): "

if "%choice%"=="1" (
    echo.
    echo Windowsインストーラーを起動します...
    call install-auto.bat
) else if "%choice%"=="2" (
    echo.
    echo macOS/Linux用のインストールコマンド：
    echo.
    echo   chmod +x install.sh
    echo   ./install.sh
    echo.
    echo または:
    echo   npm install
    echo   npm run quick-install
    echo.
    pause
) else (
    echo.
    echo 手動セットアップの手順：
    echo.
    echo 1. npm install
    echo 2. .envファイルの設定
    echo 3. Google Cloud ConsoleでOAuth設定
    echo 4. npm run oauth-setup
    echo 5. Claude Desktop設定更新
    echo.
    echo 詳細はREADME.mdを参照してください。
    echo.
    pause
)
