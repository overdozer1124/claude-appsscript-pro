@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 完全自動インストーラー
:: バージョン: 2.1.3 - 処理順序・PowerShell構文エラー完全修正版（v2025.08.16-3）

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
echo ║   Claude-AppsScript-Pro 完全自動インストーラー v2.1.3       ║
echo ║      🔧 処理順序・PowerShell構文エラー完全修正版            ║
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
echo [%DATE% %TIME%] 完全自動インストール開始（v2.1.3） > %LOG_FILE%

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

:: ステップ2: OAuth設定確認・強制実行
echo [2/4] OAuth設定を確認中...
set OAUTH_READY=false

:: .envファイル存在確認
if not exist .env (
    echo ⚠️  .envファイルが存在しません - OAuth設定が必要です
    goto :RequireOAuth
)

:: OAuth設定内容確認
findstr "GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V "GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️  CLIENT_IDが未設定 - OAuth設定が必要です
    goto :RequireOAuth
)

findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo ⚠️  REFRESH_TOKENが未設定 - OAuth設定が必要です
    goto :RequireOAuth
)

echo ✅ OAuth設定は完了済みです
set OAUTH_READY=true
goto :OAuthComplete

:RequireOAuth
echo.
echo 📋 OAuth設定が必要です
echo    Google Cloud Console で OAuth クライアント ID を作成してください:
echo    1. https://console.cloud.google.com/apis/credentials
echo    2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」
echo    3. アプリケーションの種類: 「ウェブ アプリケーション」
echo    4. 承認済みリダイレクト URI: http://localhost:3001/oauth/callback
echo.

:: PowerShellモード時は自動実行停止でユーザー操作を促す
if "%POWERSHELL_MODE%"=="true" (
    echo 🛑 重要: OAuth設定は手動操作が必要です
    echo    PowerShell自動モードでも、OAuth設定は手動で行ってください
    echo.
    echo 📋 次の手順で設定してください:
    echo    1. 上記のGoogle Cloud Console設定を完了
    echo    2. 別のターミナルで: npm run oauth-setup
    echo    3. OAuth設定完了後、このプロセスを再実行
    echo.
    echo ❌ OAuth設定未完了のため、インストールを中断します
    echo [%DATE% %TIME%] OAuth設定未完了で中断（PowerShellモード） >> %LOG_FILE%
    echo.
    echo 💡 OAuth設定完了後に再実行してください: .\install-auto.bat
    pause
    exit /b 1
)

:: 対話型モードでのOAuth設定
echo 🔑 OAuth設定を今すぐ実行しますか？ (Y/N)
echo    Y: 今すぐOAuth設定を開始
echo    N: スキップ（後で手動設定）
set /p OAUTH_CHOICE="選択 (Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
    echo.
    echo 🚀 OAuth設定を開始します...
    echo 📋 注意: ブラウザが開きます。Google認証を完了してください
    call npm run oauth-setup
    if !ERRORLEVEL! EQU 0 (
        echo ✅ OAuth設定が完了しました
        set OAUTH_READY=true
    ) else (
        echo ❌ OAuth設定でエラーが発生しました
        echo 💡 手動で再実行してください: npm run oauth-setup
        set OAUTH_READY=false
        echo [%DATE% %TIME%] OAuth設定エラー >> %LOG_FILE%
    )
) else (
    echo ⚠️  OAuth設定をスキップしました
    echo 💡 この設定なしではツールは使用できません
    echo 📋 後で手動実行してください: npm run oauth-setup
    set OAUTH_READY=false
    echo [%DATE% %TIME%] OAuth設定スキップ >> %LOG_FILE%
)

:OAuthComplete

:: OAuth設定が未完了の場合は、Claude Desktop設定をスキップ
if "%OAUTH_READY%"=="false" (
    echo.
    echo ⚠️  OAuth設定が未完了のため、Claude Desktop設定をスキップします
    echo 💡 OAuth設定完了後に再実行してください
    goto :SkipClaudeConfig
)

:: ステップ3: Claude Desktop設定（OAuth完了時のみ）
echo [3/4] Claude Desktop設定を確認中...
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"
if exist "!CLAUDE_CONFIG!" (
    findstr /C:"claude-appsscript-pro" "!CLAUDE_CONFIG!" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo ✅ Claude Desktop設定済み
        goto :ConfigComplete
    )
)

:: PowerShellモード時は自動実行
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
goto :FinalCheck

:SkipClaudeConfig
echo [3/4] Claude Desktop設定をスキップしました（OAuth未設定）

:FinalCheck
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

:: 最終状況確認
echo 🔍 最終設定状況:
echo    - 基本インストール: 完了
if "%OAUTH_READY%"=="true" (
    echo    - OAuth設定: ✅ 完了
    echo    - Claude Desktop設定: ✅ 完了
    echo.
    echo 🚀 すべて完了！次の手順:
    echo    1. Claude Desktop を手動で再起動してください
    echo    2. claude-appsscript-pro ツールが利用可能になります
    echo    3. 動作確認: claude-appsscript-pro:test_connection
) else (
    echo    - OAuth設定: ❌ 未完了
    echo    - Claude Desktop設定: ⏭️ スキップ
    echo.
    echo 📋 次の手順:
    echo    1. OAuth設定を完了: npm run oauth-setup
    echo    2. このインストーラーを再実行: .\install-auto.bat
    echo    3. Claude Desktop を手動で再起動
)

echo.
echo 💡 重要: Claude Desktop の再起動は手動で行ってください
echo    自動起動は行いません

echo [%DATE% %TIME%] インストール完了 >> %LOG_FILE%
echo.
echo 🎊 セットアップが完了しました！

:: PowerShell実行時のpause回避
if "%AUTOMATED_MODE%"=="true" (
    echo ✅ 自動モード: pauseをスキップ
    exit /b 0
) else (
    pause
)

:: === 関数セクション ===

:: Claude Desktop設定自動化関数（修正版 v2025.08.16-3）
:AutoClaudeConfig
echo 🖥️ Claude Desktop設定を自動更新中（構文エラー修正版 v3）...
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

:: 修正されたPowerShellスクリプト
echo 🔧 PowerShell実行中...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"try { ^
    Write-Host '🔧 PowerShell null安全性強化版v3 開始...'; ^
    $configPath = '%CLAUDE_CONFIG%'; ^
    $nodeExe = '%NODE_PATH%'; ^
    $projectDir = '%CURRENT_DIR%'; ^
    $serverPath = Join-Path $projectDir 'server.js'; ^
    $configDir = Split-Path $configPath -Parent; ^
    if (!(Test-Path $configDir)) { ^
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null; ^
        Write-Host '✅ 設定ディレクトリ作成完了' ^
    }; ^
    if (Test-Path $configPath) { ^
        try { ^
            $configContent = Get-Content $configPath -Raw; ^
            if ($configContent -and $configContent.Trim()) { ^
                $config = $configContent | ConvertFrom-Json; ^
                Write-Host '✅ 既存設定ファイル読み込み完了' ^
            } else { ^
                $config = New-Object PSObject; ^
                Write-Host '⚠️ 空の設定ファイル - 新規作成' ^
            } ^
        } catch { ^
            $config = New-Object PSObject; ^
            Write-Host '⚠️ 設定ファイル読み込みエラー - 新規作成' ^
        } ^
    } else { ^
        $config = New-Object PSObject; ^
        Write-Host '💡 設定ファイル未存在 - 新規作成' ^
    }; ^
    if ($config -eq $null) { ^
        $config = New-Object PSObject ^
    }; ^
    if (-not ($config.PSObject.Properties.Name -contains 'mcpServers')) { ^
        $config | Add-Member -Type NoteProperty -Name 'mcpServers' -Value (New-Object PSObject) -Force ^
    }; ^
    if ($config.mcpServers -eq $null) { ^
        $config.mcpServers = New-Object PSObject ^
    }; ^
    $serverConfig = New-Object PSObject; ^
    $serverConfig | Add-Member -Type NoteProperty -Name 'command' -Value $nodeExe; ^
    $serverConfig | Add-Member -Type NoteProperty -Name 'args' -Value @($serverPath); ^
    $serverConfig | Add-Member -Type NoteProperty -Name 'cwd' -Value $projectDir; ^
    $envObject = New-Object PSObject; ^
    $envObject | Add-Member -Type NoteProperty -Name 'NODE_ENV' -Value 'production'; ^
    $serverConfig | Add-Member -Type NoteProperty -Name 'env' -Value $envObject; ^
    if (-not ($config.mcpServers.PSObject.Properties.Name -contains 'claude-appsscript-pro')) { ^
        $config.mcpServers | Add-Member -Type NoteProperty -Name 'claude-appsscript-pro' -Value $serverConfig -Force ^
    } else { ^
        $config.mcpServers.'claude-appsscript-pro' = $serverConfig ^
    }; ^
    $config | ConvertTo-Json -Depth 10 | Set-Content $configPath -Encoding UTF8; ^
    Write-Host '✅ Claude Desktop設定ファイルを更新しました（v3）' ^
} catch { ^
    Write-Host '❌ PowerShell実行エラー:' $_.Exception.Message; ^
    Write-Host '🔍 詳細:' $_.ScriptStackTrace ^
}"

if %ERRORLEVEL% EQU 0 (
    echo ✅ Claude Desktop設定ファイル更新完了（構文エラー修正版 v3）
    echo 📍 設定ファイル: %CLAUDE_CONFIG%
    echo 🔧 Node.js パス: %NODE_PATH%
    echo [%DATE% %TIME%] Claude Desktop設定完了（v3修正版） >> %LOG_FILE%
) else (
    echo ❌ Claude Desktop設定更新でエラーが発生しました
    echo 💡 手動設定が必要な場合があります
    echo [%DATE% %TIME%] Claude Desktop設定エラー（v3修正版） >> %LOG_FILE%
)
goto :eof
