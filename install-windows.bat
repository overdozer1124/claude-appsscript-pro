@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro Windows簡単インストーラー
:: バージョン: 1.0.0

title Claude-AppsScript-Pro インストーラー

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║     Claude-AppsScript-Pro Windows簡単インストーラー         ║
echo ║                      Version 1.0.0                          ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:: Node.jsの存在確認
echo [1/5] Node.jsを確認中...

:: Node.jsパスの自動検出
set "NODE_PATH="
set "NPM_PATH="

:: Program Filesから検索
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files\nodejs\node.exe"
    set "NPM_PATH=C:\Program Files\nodejs\npm.cmd"
    goto :NodeFound
)

:: Program Files (x86)から検索
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_PATH=C:\Program Files (x86)\nodejs\node.exe"
    set "NPM_PATH=C:\Program Files (x86)\nodejs\npm.cmd"
    goto :NodeFound
)

:: PATHから検索
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "delims=" %%i in ('where node') do (
        set "NODE_PATH=%%i"
        goto :SetNpmPath
    )
)

:SetNpmPath
if defined NODE_PATH (
    set "NPM_PATH=!NODE_PATH:node.exe=npm.cmd!"
    goto :NodeFound
)

:: Node.jsが見つからない場合
echo [ERROR] Node.jsが見つかりません。
echo.
echo Node.js v18.0.0以上をインストールしてください：
echo https://nodejs.org/
echo.
pause
exit /b 1

:NodeFound
echo [SUCCESS] Node.jsを検出しました: !NODE_PATH!

:: Node.jsバージョン確認
echo [2/5] Node.jsバージョンを確認中...
"!NODE_PATH!" --version >temp_version.txt 2>&1
set /p NODE_VERSION=<temp_version.txt
del temp_version.txt

echo [SUCCESS] Node.js !NODE_VERSION! を使用します

:: 依存関係のインストール
echo [3/5] 依存関係をインストール中...
echo これには数分かかる場合があります...
"!NPM_PATH!" install --no-optional --no-fund >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] 依存関係のインストールで警告が発生しました
    echo 続行します...
) else (
    echo [SUCCESS] 依存関係のインストール完了
)

:: .envファイルの作成
echo [4/5] 環境設定ファイルを作成中...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo [SUCCESS] .envファイルを作成しました
    ) else (
        (
            echo # Google Apps Script API認証情報
            echo GOOGLE_APP_SCRIPT_API_CLIENT_ID=
            echo GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=
            echo GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=
            echo GOOGLE_APP_SCRIPT_API_REDIRECT_URI=http://localhost:3001/oauth/callback
            echo.
            echo # 推奨設定
            echo LOG_LEVEL=info
            echo SCRIPT_API_TIMEOUT_MS=30000
            echo MAX_CONCURRENT_REQUESTS=5
            echo.
            echo # デバッグ設定（開発時のみ）
            echo DEBUG_MODE=false
            echo VERBOSE_LOGGING=false
        ) > .env
        echo [SUCCESS] .envファイルを作成しました
    )
) else (
    echo [INFO] .envファイルは既に存在します
)

:: インテリジェントインストーラーの実行
echo [5/5] インテリジェントセットアップを実行中...
echo.

:: install.jsが存在する場合は実行
if exist install.js (
    "!NODE_PATH!" install.js
) else (
    :: install.jsがない場合は手動セットアップ案内
    echo ════════════════════════════════════════════════════════════════
    echo.
    echo インストールがほぼ完了しました！
    echo.
    echo 残りの手動設定：
    echo.
    echo 1. Google Cloud Console で OAuth 設定
    echo    https://console.cloud.google.com
    echo.
    echo 2. 以下のAPIを有効化：
    echo    - Google Apps Script API
    echo    - Google Drive API
    echo    - Google Sheets API
    echo.
    echo 3. OAuth 2.0 クライアントIDを作成
    echo    タイプ: Webアプリケーション
    echo    リダイレクトURI: http://localhost:3001/oauth/callback
    echo.
    echo 4. .envファイルに認証情報を設定
    echo.
    echo 5. 以下のコマンドでリフレッシュトークンを取得：
    echo    node scripts\oauth-setup-cmd.cjs
    echo.
    echo 6. Claude Desktop設定ファイルを更新：
    echo    %APPDATA%\Claude\claude_desktop_config.json
    echo.
    echo    以下の内容を追加：
    echo    {
    echo      "mcpServers": {
    echo        "claude-appsscript-pro": {
    echo          "command": "!NODE_PATH!",
    echo          "args": ["%CD%\server.js"],
    echo          "cwd": "%CD%"
    echo        }
    echo      }
    echo    }
    echo.
    echo 7. Claude Desktopを再起動
    echo.
    echo ════════════════════════════════════════════════════════════════
)

echo.
echo インストール処理が完了しました。
echo.
echo 次のステップ: npm run oauth-setup
echo.
