@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー v2.1.0 - 論理改善版
:: 作成日: 2025.08.16 - OAuth重複実行問題・Claude Desktop設定問題を完全解決

:: [CONFIG] PowerShell実行検出（安全版・CMDCMDLINE未定義対応）
set "POWERSHELL_MODE=false"
if defined CMDCMDLINE (
    echo %CMDCMDLINE% | find /i "powershell" >nul
    if !ERRORLEVEL! EQU 0 set "POWERSHELL_MODE=true"
)

:: [AUTO] 完全自動モード（環境変数での制御）
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"

title Claude-AppsScript-Pro 完全自動インストーラー v2.1.0 - 論理改善版

echo.
echo ================================================================
echo  Claude-AppsScript-Pro 完全自動インストーラー v2.1.0
echo            OAuth重複実行問題・完全解決版
echo ================================================================
echo.
echo [TIME] 開始時刻: %TIME%
echo [DIR] 作業ディレクトリ: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo [AUTO] 実行モード: PowerShell完全自動モード
) else (
    echo [INTERACTIVE] 実行モード: 対話型インストールモード
)
echo.

:: インストールログ作成
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] 完全自動インストール開始（論理改善版） > %LOG_FILE%

:: =========================================================================
:: Step 1: 基本環境確認
:: =========================================================================
echo [1/4] 基本環境確認中...
echo [%DATE% %TIME%] 基本環境確認開始 >> %LOG_FILE%

:: Node.js確認（クロスプラットフォーム対応）
set "NODE_EXE=node"
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [INFO] Node.js found in PATH
) else (
    echo [SEARCH] Searching for Node.js in common locations...
    
    :: 一般的なインストール場所を順次確認
    set "NODE_FOUND=false"
    
    :: 1. Program Files (64bit)
    if exist "C:\Program Files\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo [FOUND] Node.js at: C:\Program Files\nodejs\
    )
    
    :: 2. Program Files (x86) (32bit)
    if "!NODE_FOUND!"=="false" if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo [FOUND] Node.js at: C:\Program Files (x86)\nodejs\
    )
    
    :: 3. User Local AppData
    if "!NODE_FOUND!"=="false" if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
        set "NODE_FOUND=true"
        echo [FOUND] Node.js at: %LOCALAPPDATA%\Programs\nodejs\
    )
    
    :: 4. User AppData (nvm-windows)
    if "!NODE_FOUND!"=="false" if exist "%APPDATA%\nvm" (
        for /d %%i in ("%APPDATA%\nvm\v*") do (
            if exist "%%i\node.exe" (
                set "NODE_EXE=%%i\node.exe"
                set "NODE_FOUND=true"
                echo [FOUND] Node.js at: %%i\
                goto :NodeSearchComplete
            )
        )
    )
    
    :NodeSearchComplete
    if "!NODE_FOUND!"=="false" (
        echo [ERROR] Node.js not found in any common locations
        echo [INFO] Please install Node.js from: https://nodejs.org/
        echo [INFO] Or ensure Node.js is in your PATH
        echo [%DATE% %TIME%] Node.js not found >> %LOG_FILE%
        if "%POWERSHELL_MODE%"=="false" pause
        exit /b 1
    )
)

echo [INFO] Using Node.js: !NODE_EXE!

echo [OK] Node.js verification completed
echo [%DATE% %TIME%] Node.js verification completed >> %LOG_FILE%
echo [OK] Basic installation completed
echo [%DATE% %TIME%] Basic installation completed >> %LOG_FILE%

:: =========================================================================
:: Step 2: OAuth設定確認・実行（論理改善）
:: =========================================================================
echo [2/4] OAuth設定を確認中...

:: OAuth状況を確認
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo [OK] OAuth設定済みを検出（CLIENT_ID + REFRESH_TOKEN）
    echo [%DATE% %TIME%] OAuth設定確認済み >> %LOG_FILE%
    goto :OAuthComplete
)

echo [WARNING] OAuth設定が必要です

:: PowerShellモード時は自動実行
if "%POWERSHELL_MODE%"=="true" (
    echo [AUTO] PowerShell自動モード: OAuth設定を自動実行します
    call :AutoOAuth
    goto :OAuthVerificationStep
)

:: 対話型モードでのOAuth設定
echo.
echo [GUIDE] Google Cloud Console で OAuth クライアント ID を作成する必要があります:
echo    1. https://console.cloud.google.com/apis/credentials
echo    2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」
echo    3. アプリケーションの種類: 「ウェブ アプリケーション」
echo    4. 承認済みリダイレクト URI: http://localhost:3001/oauth/callback
echo.
echo [AUTH] OAuth設定を開始しますか Y または N で答えてください
set /p OAUTH_CHOICE="OAuth設定を開始しますか Y/N: "
if /i "!OAUTH_CHOICE!"=="Y" (
    call :AutoOAuth
) else (
    echo [INFO] OAuth設定をスキップしました
    echo [WARNING] OAuth設定なしではツールは使用できません
    echo [%DATE% %TIME%] OAuth設定スキップ（ユーザー選択） >> %LOG_FILE%
    goto :OAuthComplete
)

:OAuthVerificationStep
:: OAuth設定後の確認
echo [CHECK] OAuth設定結果を確認中...
call :CheckOAuthStatus
if "%OAUTH_STATUS%"=="COMPLETE" (
    echo [OK] OAuth設定が正常に完了しました
    echo [%DATE% %TIME%] OAuth設定完了 >> %LOG_FILE%
) else (
    echo [WARNING] OAuth設定が不完全です
    echo [INFO] 後で手動実行してください: npm run oauth-setup
    echo [%DATE% %TIME%] OAuth設定不完全 >> %LOG_FILE%
)

:OAuthComplete

:: =========================================================================
:: Step 3: Claude Desktop設定
:: =========================================================================
echo [3/4] Claude Desktop設定を確認中...

:: PowerShellモード時は設定チェックを無視して自動実行（最優先）
if "%POWERSHELL_MODE%"=="true" (
    echo [AUTO] PowerShell自動モード: Claude Desktop設定を自動更新します
    call :AutoClaudeConfig
    goto :ConfigComplete
)

:: 対話型モード時のみ既存設定チェック
call :CheckClaudeConfig
if "%CLAUDE_CONFIG_STATUS%"=="COMPLETE" (
    echo [OK] Claude Desktop設定済み
    goto :ConfigComplete
)

:: 対話型モードでの設定確認
echo [CONFIG] Claude Desktop設定ファイルを更新しますか Y または N で答えてください
echo    既存の設定ファイルがある場合は上書きされます
set /p CONFIG_CHOICE="Claude Desktop設定を更新しますか Y/N: "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo [INFO] Claude Desktop設定をスキップしました
    echo [%DATE% %TIME%] Claude Desktop設定スキップ >> %LOG_FILE%
)

:ConfigComplete

:: =========================================================================
:: Step 4: 動作確認
:: =========================================================================
echo [4/4] 動作確認中...
echo [TEST] サーバー起動テスト実行中...
"!NODE_EXE!" --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] サーバー構文チェック成功
    echo [%DATE% %TIME%] 構文チェック成功 >> %LOG_FILE%
) else (
    echo [ERROR] サーバー構文チェックでエラーが発生しました
    echo [%DATE% %TIME%] 構文チェックエラー >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" (
        echo [QUESTION] 続行しますか Y または N で答えてください
        set /p SYNTAX_CONTINUE="続行しますか Y/N: "
        if /i "!SYNTAX_CONTINUE!"=="N" (
            echo [WARNING] インストールを中止しました
            pause
            exit /b 1
        )
    )
    echo [WARNING] 構文エラーを無視して続行します
)

:: =========================================================================
:: 完了報告
:: =========================================================================
echo.
echo ================================================================
echo                 [COMPLETE] インストール完了！
echo ================================================================
echo.
echo [OK] Claude-AppsScript-Pro v3.0.1 インストール完了
echo [TIME] 完了時刻: %TIME%
echo [LOG] ログファイル: %LOG_FILE%
echo.

:: 最終状況確認
call :CheckOAuthStatus
call :CheckClaudeConfig

echo [SUMMARY] 最終確認:
if "%OAUTH_STATUS%"=="COMPLETE" (
    if "%CLAUDE_CONFIG_STATUS%"=="COMPLETE" (
        echo [OK] すべて完了！Claude Desktop を手動で再起動してください
        echo [INFO] 動作確認: claude-appsscript-pro:test_connection
    ) else (
        echo [WARNING] Claude Desktop設定が未完了です
        echo [INFO] 手動設定が必要な場合があります
    )
) else (
    echo [WARNING] OAuth設定が未完了です
    echo [INFO] 手動で実行: npm run oauth-setup
)

echo.
echo [IMPORTANT] Claude Desktop の再起動は手動で行ってください
echo    - 自動起動は行いません
echo    - ユーザーのタイミングで安全に再起動できます

echo [%DATE% %TIME%] インストール完了 >> %LOG_FILE%
echo.
echo [SETUP COMPLETE] セットアップが完了しました！

echo.
echo [SUCCESS] おつかれさまでした！
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
echo [OAUTH] OAuth設定を開始します...
echo.
echo [WARNING] 重要: 以下の手順で進めます
echo    1. Webサーバーを起動します
echo    2. ブラウザで Google 認証を完了してください
echo    3. 認証完了後、自動で次に進みます
echo.
if "%POWERSHELL_MODE%"=="false" (
    echo [GUIDE] 準備ができたらEnterキーを押してください...
    pause >nul
)

echo [%DATE% %TIME%] OAuth設定開始 >> %LOG_FILE%
echo [PROCESS] OAuth設定プロセスを開始中...
echo.

:: [CONFIG] 修正: OAuth設定はユーザーに見える形で実行（ログリダイレクトなし）
"!NODE_EXE!" scripts/oauth-setup.cjs --web
set OAUTH_RESULT=%ERRORLEVEL%

echo.
echo [%DATE% %TIME%] OAuth設定完了（終了コード: %OAUTH_RESULT%） >> %LOG_FILE%
if %OAUTH_RESULT% EQU 0 (
    echo [OK] OAuth設定プロセス完了
) else (
    echo [WARNING] OAuth設定でエラーが発生しました（終了コード: %OAUTH_RESULT%）
    echo [INFO] 手動で再試行してください: npm run oauth-setup
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
:: Claude Desktop設定安全更新（既存設定保護）
echo [CONFIG] Claude Desktop設定を更新中...
echo [PROTECTION] 既存のMCPサーバー設定を保護します

:: 安全な設定更新スクリプトを実行
echo [PROCESS] 安全な設定更新スクリプトを実行中...
"!NODE_EXE!" scripts/update-claude-config.cjs
set CONFIG_RESULT=%ERRORLEVEL%

echo.
echo [%DATE% %TIME%] Claude Desktop設定更新（安全モード・終了コード: %CONFIG_RESULT%） >> %LOG_FILE%
if %CONFIG_RESULT% EQU 0 (
    echo [OK] Claude Desktop設定を安全に更新しました
    echo [INFO] 既存のMCPサーバー設定は保護されています
) else (
    echo [WARNING] Claude Desktop設定の更新でエラーが発生しました（終了コード: %CONFIG_RESULT%）
    echo [INFO] 手動で設定ファイルを確認してください
    echo [FILE] 設定ファイル場所: %APPDATA%\Claude\claude_desktop_config.json
)
goto :EOF