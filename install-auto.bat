@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー
:: バージョン: 2.1.1 - PowerShell対応・OAuth完全自動化版（トークンテスト）

:: 🔧 PowerShell実行検出（非対話的実行モード）
set "POWERSHELL_MODE=false"
set "AUTOMATED_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "AUTOMATED_MODE=true"

:: 🚀 完全自動モード（環境変数での制御）
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"
if "%AUTO_INSTALL_MODE%"=="true" set "AUTOMATED_MODE=true"

title Claude-AppsScript-Pro 完全自動インストーラー

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║   Claude-AppsScript-Pro 完全自動インストーラー v2.1.0       ║
echo ║               🚀 PowerShell対応・完全自動化版                ║
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
echo [%DATE% %TIME%] 完全自動インストール開始 > %LOG_FILE%

:: ステップ1: 基本インストール実行
echo [1/4] 基本インストール実行中...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 基本インストールでエラーが発生しました
    echo 📄 ログファイル: %LOG_FILE% を確認してください
    echo.
    echo 💡 問題を解決してから再実行してください
    echo [%DATE% %TIME%] 基本インストールエラー >> %LOG_FILE%
    pause
    exit /b 1
)
echo ✅ 基本インストール完了

:: ステップ2: OAuth設定確認
echo [2/4] OAuth設定を確認中...
if exist .env (
    findstr "GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V "GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo ✅ OAuth設定済みを検出（CLIENT_ID + REFRESH_TOKEN）
            goto :OAuthComplete
        ) else (
            echo ⚠️  CLIENT_IDは設定済みですが、REFRESH_TOKENが未設定です
        )
    )
)

echo ⚠️  OAuth設定が必要です

:: 🚀 PowerShellモード時は自動実行
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 PowerShell自動モード: OAuth設定を自動実行します
    echo.
    echo 📋 注意: OAuth設定には手動でのGoogle認証が必要です
    echo    1. ブラウザが自動的に開きます
    echo    2. Google認証を完了してください
    echo    3. 認証後、バッチファイルが自動継続します
    echo.
    echo 🚀 OAuth設定を開始中...
    echo [%DATE% %TIME%] OAuth設定開始（PowerShell自動モード） >> %LOG_FILE%
    
    call :AutoOAuthSetup
    goto :OAuthComplete
)

:: 対話型モードでは従来通りユーザー確認
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
    call :AutoOAuthSetup
) else (
    echo ℹ️  OAuth設定をスキップしました
    echo 💡 後で手動実行してください: npm run oauth-setup
    echo ⚠️  OAuth設定なしではツールは使用できません
    echo.
    echo 💭 今すぐOAuth設定を行うことを強く推奨します
    echo 🔄 スキップして続行する場合はEnterキーを押してください
    echo [%DATE% %TIME%] OAuth設定スキップ（初回選択） >> %LOG_FILE%
    pause >nul
)

    echo 🚀 OAuth設定を開始します...
    echo.
    echo ⚠️  重要: 以下の手順で進めます
    echo    1. npm run oauth-setup を実行
    echo    2. ブラウザで Google 認証を完了
    echo    3. 認証完了後、手動でEnterキーを押して次に進む
    echo.
    echo 📋 準備ができたらEnterキーを押してください...
    pause >nul
    
    echo [%DATE% %TIME%] OAuth設定開始 >> %LOG_FILE%
    echo 🔄 OAuth設定プロセスを開始中...
    
    node scripts/oauth-setup.cjs --web
    set OAUTH_ERRORLEVEL=!ERRORLEVEL!
    
    echo.
    echo ⚠️  npm run oauth-setup の実行が完了しました
    echo.
    
    :: 🚀 新機能: OAuth成功の自動検証（重複実行防止）
    echo 🔍 REFRESH_TOKEN取得状況を自動確認中...
    if exist .env (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo ✅ OAuth認証完了を自動検出 - REFRESH_TOKEN取得済み
            echo 📋 認証は正常に完了しました
            echo [%DATE% %TIME%] OAuth設定完了（自動検証） >> %LOG_FILE%
            goto :OAuthVerificationComplete
        ) else (
            echo ⚠️  REFRESH_TOKENが未取得です
            echo 💡 ユーザー確認が必要です
        )
    ) else (
        echo ⚠️  .envファイルが見つかりません
        echo 💡 OAuth設定が失敗した可能性があります
    )

    :: 自動検証失敗時のみユーザー確認
    echo.
    echo 🔍 認証状況を確認します...
    echo    - ブラウザでGoogle認証を完了しましたか？
    echo    - .envファイルにREFRESH_TOKENが保存されましたか？
    echo.
    echo 📋 OAuth認証が完全に完了した場合のみ Y を選択してください
    echo 🔑 OAuth認証は完了しましたか？ (Y/N)
    set /p OAUTH_COMPLETE="選択 (Y/N): "
    
    if /i "!OAUTH_COMPLETE!"=="Y" (
        echo ✅ OAuth設定完了を確認しました
        echo [%DATE% %TIME%] OAuth設定完了（ユーザー確認） >> %LOG_FILE%
        goto :OAuthVerificationComplete
    ) else (
        echo ⚠️  OAuth認証が未完了です
        echo.
        echo 💡 以下の方法で後から設定できます:
        echo    1. npm run oauth-setup を再実行
        echo    2. ブラウザでGoogle認証を完了
        echo    3. .envファイルの設定を確認
        echo.
        echo [%DATE% %TIME%] OAuth設定未完了（ユーザー選択） >> %LOG_FILE%
        echo 📋 続行するには、まずOAuth設定を完了してください
        
        :: 🔧 修正: 再試行前にREFRESH_TOKEN再確認（重複実行防止）
        echo 🔍 最終確認: REFRESH_TOKEN状況を再チェック中...
        if exist .env (
            findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
            if !ERRORLEVEL! EQU 0 (
                echo ✅ 実際にはREFRESH_TOKENが取得されています
                echo 💡 OAuth設定は完了済みです - 次に進みます
                echo [%DATE% %TIME%] OAuth設定完了（再確認で検出） >> %LOG_FILE%
                goto :OAuthVerificationComplete
            )
        )
        
        echo 🔄 今すぐOAuth設定を再試行しますか？ (Y/N)
        set /p RETRY_OAUTH="選択 (Y/N): "
        if /i "!RETRY_OAUTH!"=="Y" (
            echo 🔄 OAuth設定を再試行中...
            echo [%DATE% %TIME%] OAuth設定再試行開始 >> %LOG_FILE%
            node scripts/oauth-setup.cjs --web
            
            :: 🚀 再試行後も自動検証（重複実行防止）
            echo.
            echo 🔍 再試行結果を自動確認中...
            if exist .env (
                findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
                if !ERRORLEVEL! EQU 0 (
                    echo ✅ OAuth設定が完了しました（自動検証）
                    echo [%DATE% %TIME%] OAuth設定完了（再試行成功・自動検証） >> %LOG_FILE%
                    goto :OAuthVerificationComplete
                ) else (
                    echo ⚠️  OAuth設定が失敗しました
                    echo 💡 手動で後から設定してください: npm run oauth-setup
                    echo [%DATE% %TIME%] OAuth設定失敗（再試行後） >> %LOG_FILE%
                )
            )
        ) else (
            echo ⚠️  OAuth設定をスキップしました
            echo 💡 インストールは続行しますが、ツールは使用できません
            echo [%DATE% %TIME%] OAuth設定スキップ（ユーザー選択） >> %LOG_FILE%
            if "%POWERSHELL_MODE%"=="false" pause
        )
    )

    :OAuthVerificationComplete
    :: REFRESH_TOKENの最終確認
    if exist .env (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo ✅ .envファイルでREFRESH_TOKEN確認済み
        ) else (
            echo ⚠️  .envにREFRESH_TOKENが見つかりません
            echo 💡 OAuth設定が不完全の可能性があります
        )
    )
) else (
    echo ℹ️  OAuth設定をスキップしました
    echo 💡 後で手動実行してください: npm run oauth-setup
    echo ⚠️  OAuth設定なしではツールは使用できません
    echo.
    echo 💭 今すぐOAuth設定を行うことを強く推奨します
    echo 🔄 スキップして続行する場合はEnterキーを押してください
    echo [%DATE% %TIME%] OAuth設定スキップ（初回選択） >> %LOG_FILE%
    if "%POWERSHELL_MODE%"=="false" pause >nul
)

goto :OAuthComplete

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

:: 🚀 PowerShellモード時は自動実行
if "%POWERSHELL_MODE%"=="true" (
    echo 🤖 PowerShell自動モード: Claude Desktop設定を自動更新します
    call :AutoClaudeConfig
    goto :ConfigComplete
)

:: 対話型モードでは従来通りユーザー確認
echo 🔧 Claude Desktop設定ファイルを更新しますか？ (Y/N)
echo    既存の設定ファイルがある場合は上書きされます
set /p CONFIG_CHOICE="選択 (Y/N): "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo ℹ️  Claude Desktop設定をスキップしました
    echo 💡 手動設定が必要です（後で設定可能）
)

:ConfigComplete

:: ステップ4: 動作確認
echo [4/4] 動作確認中...
echo 🧪 サーバー起動テスト実行中...
timeout /t 2 >nul
node --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ サーバー構文チェック成功
) else (
    echo ❌ サーバー構文チェックでエラーが発生しました
    echo 📄 詳細なエラー内容:
    echo.
    node --check server.js
    echo.
    echo [%DATE% %TIME%] サーバー構文チェックエラー >> %LOG_FILE%
    echo 💡 構文エラーを修正してから再実行してください
    echo.
    echo 📋 続行しますか？ (Y/N)
    echo    Y: 構文エラーを無視して続行（推奨しません）
    echo    N: インストールを中止して問題を解決
    set /p SYNTAX_CONTINUE="選択 (Y/N): "
    if /i "!SYNTAX_CONTINUE!"=="N" (
        echo ⚠️  インストールを中止しました
        echo 💡 構文エラーを修正してから再実行してください
        pause
        exit /b 1
    ) else (
        echo ⚠️  構文エラーを無視して続行します
        echo 💡 MCPサーバーが正常に動作しない可能性があります
    )
)

:: 完了メッセージ
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║                   🎉 インストール完了！                     ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo ✅ Claude-AppsScript-Pro v3.0.1 基本インストール完了
echo ⏱️  完了時刻: %TIME%
echo 📄 ログファイル: %LOG_FILE%
echo.

:: OAuth設定状況確認
echo 🔍 OAuth設定状況を最終確認中...
if exist .env (
    findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo ✅ OAuth設定完全完了 - すべて準備完了！
            echo    - CLIENT_ID: 設定済み
            echo    - REFRESH_TOKEN: 設定済み
            set OAUTH_READY=true
        ) else (
            echo ⚠️  OAuth設定が不完全です
            echo    - CLIENT_ID: 設定済み
            echo    - REFRESH_TOKEN: 未設定
            echo 💡 手動で実行: npm run oauth-setup
            set OAUTH_READY=false
        )
    ) else (
        echo ⚠️  OAuth設定が未完了です
        echo    - CLIENT_ID: 未設定
        echo    - REFRESH_TOKEN: 未設定
        echo 💡 手動で実行: npm run oauth-setup
        set OAUTH_READY=false
    )
) else (
    echo ⚠️  .envファイルが存在しません
    echo 💡 OAuth設定が必要です: npm run oauth-setup
    set OAUTH_READY=false
)

echo.
echo 💡 問題が発生した場合:
echo    - ログファイル %LOG_FILE% を確認
echo    - TROUBLESHOOTING.md を参照
echo    - GitHub Issues に報告
echo.

:: 完了メッセージと手動操作案内
echo.
echo 🎊 インストール作業完了！
echo.
if "!OAUTH_READY!"=="true" (
    echo ✅ 現在の状況:
    echo    - 基本インストール: 完了
    echo    - OAuth設定: 完了（CLIENT_ID + REFRESH_TOKEN）
    echo    - Claude Desktop設定: 完了
    echo    - 構文チェック: 通過
    echo.
    echo 🚀 Claude Desktop を手動で再起動すると、すぐにツールが利用可能になります
) else (
    echo ⚠️  現在の状況:
    echo    - 基本インストール: 完了
    echo    - OAuth設定: 未完了
    echo    - Claude Desktop設定: 完了
    echo    - 構文チェック: 通過
    echo.
    echo 📋 OAuth設定完了後に Claude Desktop を手動で再起動してください
)
echo.

echo 📋 次の手順（手動操作）:
echo    1. Claude Desktop を終了してください
echo    2. Claude Desktop を再起動してください
if "!OAUTH_READY!"=="false" (
    echo    3. OAuth設定を実行: npm run oauth-setup
    echo    4. 再度 Claude Desktop を手動で再起動してください
)
echo    3. claude-appsscript-pro ツールが利用可能になります
echo.

echo 🎊 最終確認:
if "!OAUTH_READY!"=="true" (
    echo ✅ すべて完了！Claude Desktop を手動で再起動してください
    echo 💡 動作確認: claude-appsscript-pro:test_connection
) else (
    echo ⚠️  OAuth設定が未完了です
    echo 📋 次のステップ:
    echo    1. OAuth設定: npm run oauth-setup
    echo    2. Claude Desktop を手動で再起動
    echo    3. claude-appsscript-pro ツールが利用可能になります
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

:: PowerShell実行時のpause回避
if "%AUTOMATED_MODE%"=="true" (
    echo ✅ 自動モード: pauseをスキップ
    exit /b 0
) else (
    pause
)

:: === 関数セクション ===

:: Claude Desktop設定自動化関数
:AutoClaudeConfig
echo 🖥️ Claude Desktop設定を自動更新中...
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

:: Node.jsパス検出
for /f "delims=" %%i in ('where node 2^>nul') do set "NODE_PATH=%%i"
if "%NODE_PATH%"=="" (
    echo ❌ Node.jsパスが見つかりません
    echo 💡 手動設定が必要です
    goto :eof
)

:: 現在のディレクトリを取得
set "CURRENT_DIR=%CD%"

:: JSON設定生成（PowerShell使用）
powershell -Command "& {
    $configPath = '%CLAUDE_CONFIG%'
    $nodeExe = '%NODE_PATH%'
    $projectDir = '%CURRENT_DIR%'
    $serverPath = Join-Path $projectDir 'server.js'
    
    # ディレクトリが存在しない場合は作成
    $configDir = Split-Path $configPath -Parent
    if (!(Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    # 既存設定を読み込み（存在する場合）
    if (Test-Path $configPath) {
        try {
            $config = Get-Content $configPath -Raw | ConvertFrom-Json
        } catch {
            $config = @{}
        }
    } else {
        $config = @{}
    }
    
    # mcpServers セクションが存在しない場合は作成
    if (!$config.mcpServers) {
        $config | Add-Member -Type NoteProperty -Name 'mcpServers' -Value @{}
    }
    
    # claude-appsscript-pro 設定を追加/更新
    $serverConfig = @{
        command = $nodeExe
        args = @($serverPath)
        cwd = $projectDir
        env = @{
            NODE_ENV = 'production'
        }
    }
    
    $config.mcpServers | Add-Member -Type NoteProperty -Name 'claude-appsscript-pro' -Value $serverConfig -Force
    
    # JSON形式で保存
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8
    
    Write-Host '✅ Claude Desktop設定ファイルを更新しました'
}" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Claude Desktop設定ファイル更新完了
    echo 📍 設定ファイル: %CLAUDE_CONFIG%
    echo 🔧 Node.js パス: %NODE_PATH%
) else (
    echo ❌ Claude Desktop設定更新でエラーが発生
    echo 💡 手動設定が必要な場合があります
)
goto :eof

:: OAuth設定完全自動実行関数
:AutoOAuthSetup
echo 🔐 OAuth設定の自動実行を開始...

:: .envファイルの存在確認
if not exist .env (
    echo ❌ .envファイルが見つかりません
    echo 💡 手動で実行: npm run oauth-setup
    goto :eof
)

:: REFRESH_TOKEN確認
findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ OAuth設定は既に完了しています
    set OAUTH_READY=true
    goto :eof
)

:: CLIENT_ID確認
findstr /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V /C:"GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  CLIENT_IDが設定されていません
    echo 💡 手動で実行: npm run oauth-setup
    goto :eof
)

echo 🤖 OAuth設定を自動実行中...
call npm run oauth-setup

:: 実行結果の検証
if %ERRORLEVEL% EQU 0 (
    echo ✅ OAuth設定が完了しました
    set OAUTH_READY=true
) else (
    echo ❌ OAuth設定でエラーが発生しました
    echo 💡 手動で再実行: npm run oauth-setup
    set OAUTH_READY=false
)
goto :eof
pause