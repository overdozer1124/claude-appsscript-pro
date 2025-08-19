@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

echo Starting basic test...

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
        echo [FOUND] Node.js at: C:\Program Files\nodejs
    )
    
    echo Test completed: NODE_FOUND=!NODE_FOUND!
)

echo Test script finished successfully
pause
