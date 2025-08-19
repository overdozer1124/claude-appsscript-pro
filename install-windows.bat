@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 基本インストールスクリプト
:: install-auto.bat から呼び出される基本セットアップ

echo 📦 基本インストール開始...

:: Node.js確認
echo 🔍 Node.js検出中...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Node.js検出: PATH内
    set "NODE_EXE=node"
) else (
    echo 🔍 Node.js標準パスを検索中...
    set "NODE_FOUND=false"
    
    :: 標準的なインストール場所を確認
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo ✅ Node.js検出: C:\Program Files\nodejs
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo ✅ Node.js検出: C:\Program Files (x86)\nodejs
    ) else (
        echo ❌ Node.js が見つかりません
        echo 💡 https://nodejs.org/ からインストールしてください
        exit /b 1
    )
)

:: Node.jsバージョン確認
echo 🔍 Node.jsバージョン確認...
for /f "tokens=*" %%i in ('"%NODE_EXE%" --version 2^>nul') do set "NODE_VERSION=%%i"
if defined NODE_VERSION (
    echo ✅ Node.js バージョン: %NODE_VERSION%
) else (
    echo ❌ Node.jsバージョン取得失敗
    exit /b 1
)

:: 依存関係インストール確認
echo 📦 依存関係確認中...
if not exist "node_modules" (
    echo 🔄 npm install 実行中...
    "%NODE_EXE%" "%APPDATA%\npm\npm" install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ npm install 失敗
        exit /b 1
    )
    echo ✅ 依存関係インストール完了
) else (
    echo ✅ node_modules存在確認済み
)

:: package.json確認
echo 📋 package.json確認...
if exist "package.json" (
    echo ✅ package.json存在確認
) else (
    echo ❌ package.json が見つかりません
    exit /b 1
)

:: server.js基本確認
echo 🔍 server.js確認...
if exist "server.js" (
    echo ✅ server.js存在確認
    
    :: 基本構文チェック
    echo 🧪 基本構文チェック...
    "%NODE_EXE%" --check server.js >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo ✅ server.js構文チェック通過
    ) else (
        echo ⚠️  server.js構文エラー（処理継続）
    )
) else (
    echo ❌ server.js が見つかりません
    exit /b 1
)

:: .env ファイル基本確認
echo 📝 .env ファイル確認...
if exist ".env" (
    echo ✅ .env ファイル存在
) else (
    echo ⚠️  .env ファイル未作成（OAuth設定時に作成）
)

echo ✅ 基本インストール完了
exit /b 0
