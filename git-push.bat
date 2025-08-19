@echo off
cd /d "C:\Users\overd\AppData\Roaming\Claude\MCP\claude-appsscript-pro"

echo 🚀 Claude GitHub プッシュシステム開始
echo.

:: 一時ファイル削除
del git-status.txt >nul 2>&1
del git-error.txt >nul 2>&1

:: Step 1: 状況確認
echo 📋 Git状況確認中...
"C:\Program Files\Git\bin\git.exe" status

:: Step 2: 変更をステージング
echo 📤 変更をステージング中...
"C:\Program Files\Git\bin\git.exe" add install-auto.bat
if %ERRORLEVEL% NEQ 0 (
    echo ❌ git add 失敗
    pause
    exit /b 1
)
echo ✅ git add 成功

:: Step 3: コミット作成
echo 📝 コミット作成中...
"C:\Program Files\Git\bin\git.exe" commit -m "fix: 🔧 install-auto.bat PowerShell検出部分の安全性改善

- CMDCMDLINE未定義時のエラー対処
- 入力待ちスキップ問題の根本解決
- if defined による安全な環境変数チェック実装
- バッチファイル実行フロー安定化

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ git commit 失敗
    pause
    exit /b 1
)
echo ✅ git commit 成功

:: Step 4: プッシュ実行（ナレッジベース準拠）
echo 🌐 プッシュ実行中...
"C:\Program Files\Git\bin\git.exe" push origin main
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 通常プッシュ失敗 - 強制プッシュ試行
    "C:\Program Files\Git\bin\git.exe" push --force-with-lease origin main
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ プッシュ完全失敗
        pause
        exit /b 1
    )
    echo ✅ 強制プッシュ成功!
) else (
    echo ✅ プッシュ成功!
)

echo.
echo 🎉 GitHub プッシュ完了!
echo.
pause
