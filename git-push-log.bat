@echo off
cd /d "C:\Users\overd\AppData\Roaming\Claude\MCP\claude-appsscript-pro"

set LOG_FILE=git-push-log.txt
echo [%DATE% %TIME%] Claude GitHub プッシュシステム開始 > %LOG_FILE%

echo 🚀 Claude GitHub プッシュシステム開始
echo 🚀 Claude GitHub プッシュシステム開始 >> %LOG_FILE%

:: Step 1: 状況確認  
echo 📋 Git状況確認中...
echo 📋 Git状況確認中... >> %LOG_FILE%
"C:\Program Files\Git\bin\git.exe" status >> %LOG_FILE% 2>&1

:: Step 2: 変更をステージング
echo 📤 変更をステージング中...
echo 📤 変更をステージング中... >> %LOG_FILE%
"C:\Program Files\Git\bin\git.exe" add install-auto.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ git add 失敗 >> %LOG_FILE%
    echo ❌ git add 失敗
    exit /b 1
)
echo ✅ git add 成功 >> %LOG_FILE%
echo ✅ git add 成功

:: Step 3: コミット作成
echo 📝 コミット作成中...
echo 📝 コミット作成中... >> %LOG_FILE%
"C:\Program Files\Git\bin\git.exe" commit -m "fix: install-auto.bat PowerShell検出部分の安全性改善" >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ git commit 失敗 >> %LOG_FILE%
    echo ❌ git commit 失敗
    exit /b 1
)
echo ✅ git commit 成功 >> %LOG_FILE%
echo ✅ git commit 成功

:: Step 4: プッシュ実行
echo 🌐 プッシュ実行中...
echo 🌐 プッシュ実行中... >> %LOG_FILE%
"C:\Program Files\Git\bin\git.exe" push origin main >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ 通常プッシュ失敗 - 強制プッシュ試行 >> %LOG_FILE%
    echo ⚠️ 通常プッシュ失敗 - 強制プッシュ試行
    "C:\Program Files\Git\bin\git.exe" push --force-with-lease origin main >> %LOG_FILE% 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ プッシュ完全失敗 >> %LOG_FILE%
        echo ❌ プッシュ完全失敗
        exit /b 1
    )
    echo ✅ 強制プッシュ成功! >> %LOG_FILE%
    echo ✅ 強制プッシュ成功!
) else (
    echo ✅ プッシュ成功! >> %LOG_FILE%
    echo ✅ プッシュ成功!
)

echo [%DATE% %TIME%] プッシュ完了 >> %LOG_FILE%
echo 🎉 GitHub プッシュ完了!
