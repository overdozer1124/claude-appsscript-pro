@echo off
cd /d "C:\Users\overd\AppData\Roaming\Claude\MCP\claude-appsscript-pro"
echo ===================================================
echo   Claude-AppsScript-Pro OAuth Authentication System
echo ===================================================
echo.
echo Checking Node.js environment...
if exist "C:\Program Files\nodejs\node.exe" (
    echo [OK] Node.js found: C:\Program Files\nodejs\node.exe
    
    echo.
    echo Checking dependencies...
    if exist "node_modules\dotenv" (
        echo [OK] dotenv dependency found
    ) else (
        echo [WARN] dotenv dependency missing. Installing...
        "C:\Program Files\nodejs\npm.exe" install dotenv
    )
    
    echo.
    echo ====================================
    echo Starting OAuth authentication...
    echo Browser will launch automatically
    echo ====================================
    echo.
    
    "C:\Program Files\nodejs\node.exe" scripts\oauth-setup-improved.cjs
    
) else (
    echo [ERROR] Node.js not found
    echo.
    echo Please install Node.js from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo OAuth authentication process completed
echo ===================================================
pause
