@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo  Claude-AppsScript-Pro Windows Installer v3.0.1
echo ======================================================
echo.

REM Node.js パス自動検出
set "NODE_PATH="
for %%p in (
    "C:\Program Files\nodejs\node.exe"
    "C:\Program Files (x86)\nodejs\node.exe"
    "%ProgramFiles%\nodejs\node.exe"
    "%ProgramFiles(x86)%\nodejs\node.exe"
    "%LOCALAPPDATA%\Programs\nodejs\node.exe"
) do (
    if exist %%p (
        set "NODE_PATH=%%~p"
        goto :found
    )
)

REM PATHからNode.jsを検索
where node >nul 2>&1
if %errorlevel% equ 0 (
    for /f "delims=" %%i in ('where node') do (
        set "NODE_PATH=%%i"
        goto :found
    )
)

echo [ERROR] Node.js が見つかりません。
echo Node.js 18.0.0以上をインストールしてください。
echo https://nodejs.org/
pause
exit /b 1

:found
echo [OK] Node.js を検出: %NODE_PATH%

REM バージョン確認
for /f "tokens=*" %%v in ('"%NODE_PATH%" --version') do set NODE_VERSION=%%v
echo [OK] Node.js バージョン: %NODE_VERSION%

REM NPMパス設定
set "NPM_PATH=%NODE_PATH:node.exe=npm.cmd%"
if not exist "%NPM_PATH%" (
    set "NPM_PATH=%NODE_PATH:node.exe=npm%"
)

REM 依存関係インストール
echo.
echo 依存関係をインストール中...
"%NPM_PATH%" install --no-fund --no-audit
if %errorlevel% neq 0 (
    echo [ERROR] 依存関係のインストールに失敗しました。
    pause
    exit /b 1
)

echo.
echo [OK] 依存関係インストール完了

REM PowerShell実行ポリシー設定
echo.
echo PowerShell実行ポリシーを設定中...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser -Force" >nul 2>&1

REM install.js実行
echo.
echo セットアップスクリプトを実行中...
"%NODE_PATH%" install.js
if %errorlevel% neq 0 (
    echo [ERROR] セットアップに失敗しました。
    pause
    exit /b 1
)

echo.
echo ======================================================
echo  インストール完了！
echo ======================================================
echo.
echo 次のステップ:
echo 1. Claude Desktop を再起動
echo 2. OAuth認証を設定 (手順は上記参照)
echo 3. Claude で "claude-appsscript-pro:test_connection" を実行
echo.
pause
