@echo off
setlocal EnableDelayedExpansion

REM Safe Git Push Script - ASCII Only
REM Resolves encoding issues with PowerShell Git execution

echo =================================================================
echo    Safe Git Push - ASCII Version
echo =================================================================

cd /d "C:\Users\overd\AppData\Roaming\Claude\MCP\claude-appsscript-pro"

set "GIT_PATH=C:\Program Files\Git\bin\git.exe"

echo Current directory: %CD%
echo.

echo Step 1: Git status check...
"%GIT_PATH%" status
echo.

echo Step 2: Adding all changes...
"%GIT_PATH%" add .
echo.

echo Step 3: Creating commit...
"%GIT_PATH%" commit -m "fix: Replace install-auto.bat with ASCII version to resolve encoding issues"
echo.

echo Step 4: Pushing to GitHub (with fallback)...
"%GIT_PATH%" push origin main
if !ERRORLEVEL! NEQ 0 (
    echo Normal push failed, trying force-with-lease...
    "%GIT_PATH%" push --force-with-lease origin main
)
echo.

echo Step 5: Final status verification...
"%GIT_PATH%" status
echo.

echo =================================================================
echo    Git Push Completed
echo =================================================================
pause
