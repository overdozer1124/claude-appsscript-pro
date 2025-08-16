@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: Claude-AppsScript-Pro 螳悟・閾ｪ蜍輔う繝ｳ繧ｹ繝医・繝ｩ繝ｼ
:: 繝舌・繧ｸ繝ｧ繝ｳ: 2.1.3 - 蜃ｦ逅・・ｺ上・PowerShell讒区枚繧ｨ繝ｩ繝ｼ螳悟・菫ｮ豁｣迚茨ｼ・2025.08.16-3・・

:: 肌 PowerShell螳溯｡梧､懷・・磯撼蟇ｾ隧ｱ逧・ｮ溯｡後Δ繝ｼ繝会ｼ・
set "POWERSHELL_MODE=false"
set "AUTOMATED_MODE=false"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "POWERSHELL_MODE=true"
echo %CMDCMDLINE% | find /i "powershell" >nul && set "AUTOMATED_MODE=true"

:: 噫 螳悟・閾ｪ蜍輔Δ繝ｼ繝会ｼ育腸蠅・､画焚縺ｧ縺ｮ蛻ｶ蠕｡・・
if "%AUTO_INSTALL_MODE%"=="true" set "POWERSHELL_MODE=true"
if "%AUTO_INSTALL_MODE%"=="true" set "AUTOMATED_MODE=true"

title Claude-AppsScript-Pro 螳悟・閾ｪ蜍輔う繝ｳ繧ｹ繝医・繝ｩ繝ｼ

echo.
echo 笊披武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶風
echo 笊・                                                             笊・
echo 笊・  Claude-AppsScript-Pro 螳悟・閾ｪ蜍輔う繝ｳ繧ｹ繝医・繝ｩ繝ｼ v2.1.3       笊・
echo 笊・     肌 蜃ｦ逅・・ｺ上・PowerShell讒区枚繧ｨ繝ｩ繝ｼ螳悟・菫ｮ豁｣迚・           笊・
echo 笊・                                                             笊・
echo 笊壺武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶幅
echo.
echo 竢ｱ・・ 髢句ｧ区凾蛻ｻ: %TIME%
echo 刀 菴懈･ｭ繝・ぅ繝ｬ繧ｯ繝医Μ: %CD%
if "%POWERSHELL_MODE%"=="true" (
    echo ､・螳溯｡後Δ繝ｼ繝・ PowerShell螳悟・閾ｪ蜍輔Δ繝ｼ繝・
) else (
    echo 側 螳溯｡後Δ繝ｼ繝・ 蟇ｾ隧ｱ蝙九う繝ｳ繧ｹ繝医・繝ｫ繝｢繝ｼ繝・
)
echo.

:: 繧､繝ｳ繧ｹ繝医・繝ｫ繝ｭ繧ｰ菴懈・
set "LOG_FILE=install-auto.log"
echo [%DATE% %TIME%] 螳悟・閾ｪ蜍輔う繝ｳ繧ｹ繝医・繝ｫ髢句ｧ具ｼ・2.1.3・・> %LOG_FILE%

:: 繧ｹ繝・ャ繝・: 蝓ｺ譛ｬ繧､繝ｳ繧ｹ繝医・繝ｫ螳溯｡・
echo [1/4] 蝓ｺ譛ｬ繧､繝ｳ繧ｹ繝医・繝ｫ螳溯｡御ｸｭ...
call install-windows.bat >> %LOG_FILE% 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 笶・蝓ｺ譛ｬ繧､繝ｳ繧ｹ繝医・繝ｫ縺ｧ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆
    echo 塘 繝ｭ繧ｰ繝輔ぃ繧､繝ｫ: %LOG_FILE% 繧堤｢ｺ隱阪＠縺ｦ縺上□縺輔＞
    echo.
    echo 庁 蝠城｡後ｒ隗｣豎ｺ縺励※縺九ｉ蜀榊ｮ溯｡後＠縺ｦ縺上□縺輔＞
    echo [%DATE% %TIME%] 蝓ｺ譛ｬ繧､繝ｳ繧ｹ繝医・繝ｫ繧ｨ繝ｩ繝ｼ >> %LOG_FILE%
    pause
    exit /b 1
)
echo 笨・蝓ｺ譛ｬ繧､繝ｳ繧ｹ繝医・繝ｫ螳御ｺ・

:: 繧ｹ繝・ャ繝・: OAuth險ｭ螳夂｢ｺ隱阪・蠑ｷ蛻ｶ螳溯｡・
echo [2/4] OAuth險ｭ螳壹ｒ遒ｺ隱堺ｸｭ...
set OAUTH_READY=false

:: .env繝輔ぃ繧､繝ｫ蟄伜惠遒ｺ隱・
if not exist .env (
    echo 笞・・ .env繝輔ぃ繧､繝ｫ縺悟ｭ伜惠縺励∪縺帙ｓ - OAuth險ｭ螳壹′蠢・ｦ√〒縺・
    goto :RequireOAuth
)

:: OAuth險ｭ螳壼・螳ｹ遒ｺ隱・
findstr "GOOGLE_APP_SCRIPT_API_CLIENT_ID=" .env | findstr /V "GOOGLE_APP_SCRIPT_API_CLIENT_ID=$" >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo 笞・・ CLIENT_ID縺梧悴險ｭ螳・- OAuth險ｭ螳壹′蠢・ｦ√〒縺・
    goto :RequireOAuth
)

findstr "GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=1//" .env >nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo 笞・・ REFRESH_TOKEN縺梧悴險ｭ螳・- OAuth險ｭ螳壹′蠢・ｦ√〒縺・
    goto :RequireOAuth
)

echo 笨・OAuth險ｭ螳壹・螳御ｺ・ｸ医∩縺ｧ縺・
set OAUTH_READY=true
goto :OAuthComplete

:RequireOAuth
echo.
echo 搭 OAuth險ｭ螳壹′蠢・ｦ√〒縺・
echo    Google Cloud Console 縺ｧ OAuth 繧ｯ繝ｩ繧､繧｢繝ｳ繝・ID 繧剃ｽ懈・縺励※縺上□縺輔＞:
echo    1. https://console.cloud.google.com/apis/credentials
echo    2. 縲瑚ｪ崎ｨｼ諠・ｱ繧剃ｽ懈・縲坂・縲薫Auth 2.0 繧ｯ繝ｩ繧､繧｢繝ｳ繝・ID縲・
echo    3. 繧｢繝励Μ繧ｱ繝ｼ繧ｷ繝ｧ繝ｳ縺ｮ遞ｮ鬘・ 縲後え繧ｧ繝・繧｢繝励Μ繧ｱ繝ｼ繧ｷ繝ｧ繝ｳ縲・
echo    4. 謇ｿ隱肴ｸ医∩繝ｪ繝繧､繝ｬ繧ｯ繝・URI: http://localhost:3001/oauth/callback
echo.

:: PowerShell繝｢繝ｼ繝画凾縺ｯ閾ｪ蜍募ｮ溯｡悟●豁｢縺ｧ繝ｦ繝ｼ繧ｶ繝ｼ謫堺ｽ懊ｒ菫・☆
if "%POWERSHELL_MODE%"=="true" (
    echo 尅 驥崎ｦ・ OAuth險ｭ螳壹・謇句虚謫堺ｽ懊′蠢・ｦ√〒縺・
    echo    PowerShell閾ｪ蜍輔Δ繝ｼ繝峨〒繧ゅ＾Auth險ｭ螳壹・謇句虚縺ｧ陦後▲縺ｦ縺上□縺輔＞
    echo.
    echo 搭 谺｡縺ｮ謇矩・〒險ｭ螳壹＠縺ｦ縺上□縺輔＞:
    echo    1. 荳願ｨ倥・Google Cloud Console險ｭ螳壹ｒ螳御ｺ・
    echo    2. 蛻･縺ｮ繧ｿ繝ｼ繝溘リ繝ｫ縺ｧ: npm run oauth-setup
    echo    3. OAuth險ｭ螳壼ｮ御ｺ・ｾ後√％縺ｮ繝励Ο繧ｻ繧ｹ繧貞・螳溯｡・
    echo.
    echo 笶・OAuth險ｭ螳壽悴螳御ｺ・・縺溘ａ縲√う繝ｳ繧ｹ繝医・繝ｫ繧剃ｸｭ譁ｭ縺励∪縺・
    echo [%DATE% %TIME%] OAuth險ｭ螳壽悴螳御ｺ・〒荳ｭ譁ｭ・・owerShell繝｢繝ｼ繝会ｼ・>> %LOG_FILE%
    echo.
    echo 庁 OAuth險ｭ螳壼ｮ御ｺ・ｾ後↓蜀榊ｮ溯｡後＠縺ｦ縺上□縺輔＞: .\install-auto.bat
    pause
    exit /b 1
)

:: 蟇ｾ隧ｱ蝙九Δ繝ｼ繝峨〒縺ｮOAuth險ｭ螳・
echo 泊 OAuth險ｭ螳壹ｒ莉翫☆縺仙ｮ溯｡後＠縺ｾ縺吶°・・(Y/N)
echo    Y: 莉翫☆縺唇Auth險ｭ螳壹ｒ髢句ｧ・
echo    N: 繧ｹ繧ｭ繝・・・亥ｾ後〒謇句虚險ｭ螳夲ｼ・
set /p OAUTH_CHOICE="驕ｸ謚・(Y/N): "
if /i "!OAUTH_CHOICE!"=="Y" (
    echo.
    echo 噫 OAuth險ｭ螳壹ｒ髢句ｧ九＠縺ｾ縺・..
    echo 搭 豕ｨ諢・ 繝悶Λ繧ｦ繧ｶ縺碁幕縺阪∪縺吶・oogle隱崎ｨｼ繧貞ｮ御ｺ・＠縺ｦ縺上□縺輔＞
    call npm run oauth-setup
    if !ERRORLEVEL! EQU 0 (
        echo 笨・OAuth險ｭ螳壹′螳御ｺ・＠縺ｾ縺励◆
        set OAUTH_READY=true
    ) else (
        echo 笶・OAuth險ｭ螳壹〒繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆
        echo 庁 謇句虚縺ｧ蜀榊ｮ溯｡後＠縺ｦ縺上□縺輔＞: npm run oauth-setup
        set OAUTH_READY=false
        echo [%DATE% %TIME%] OAuth險ｭ螳壹お繝ｩ繝ｼ >> %LOG_FILE%
    )
) else (
    echo 笞・・ OAuth險ｭ螳壹ｒ繧ｹ繧ｭ繝・・縺励∪縺励◆
    echo 庁 縺薙・險ｭ螳壹↑縺励〒縺ｯ繝・・繝ｫ縺ｯ菴ｿ逕ｨ縺ｧ縺阪∪縺帙ｓ
    echo 搭 蠕後〒謇句虚螳溯｡後＠縺ｦ縺上□縺輔＞: npm run oauth-setup
    set OAUTH_READY=false
    echo [%DATE% %TIME%] OAuth險ｭ螳壹せ繧ｭ繝・・ >> %LOG_FILE%
)

:OAuthComplete

:: OAuth險ｭ螳壹′譛ｪ螳御ｺ・・蝣ｴ蜷医・縲，laude Desktop險ｭ螳壹ｒ繧ｹ繧ｭ繝・・
if "%OAUTH_READY%"=="false" (
    echo.
    echo 笞・・ OAuth險ｭ螳壹′譛ｪ螳御ｺ・・縺溘ａ縲，laude Desktop險ｭ螳壹ｒ繧ｹ繧ｭ繝・・縺励∪縺・
    echo 庁 OAuth險ｭ螳壼ｮ御ｺ・ｾ後↓蜀榊ｮ溯｡後＠縺ｦ縺上□縺輔＞
    goto :SkipClaudeConfig
)

:: 繧ｹ繝・ャ繝・: Claude Desktop險ｭ螳夲ｼ・Auth螳御ｺ・凾縺ｮ縺ｿ・・
echo [3/4] Claude Desktop險ｭ螳壹ｒ遒ｺ隱堺ｸｭ...
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"
if exist "!CLAUDE_CONFIG!" (
    findstr /C:"claude-appsscript-pro" "!CLAUDE_CONFIG!" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        echo 笨・Claude Desktop險ｭ螳壽ｸ医∩
        goto :ConfigComplete
    )
)

:: PowerShell繝｢繝ｼ繝画凾縺ｯ閾ｪ蜍募ｮ溯｡・
if "%POWERSHELL_MODE%"=="true" (
    echo ､・PowerShell閾ｪ蜍輔Δ繝ｼ繝・ Claude Desktop險ｭ螳壹ｒ閾ｪ蜍墓峩譁ｰ縺励∪縺・
    call :AutoClaudeConfig
    goto :ConfigComplete
)

:: 蟇ｾ隧ｱ蝙九Δ繝ｼ繝峨〒縺ｯ蠕捺擂騾壹ｊ繝ｦ繝ｼ繧ｶ繝ｼ遒ｺ隱・
echo 肌 Claude Desktop險ｭ螳壹ヵ繧｡繧､繝ｫ繧呈峩譁ｰ縺励∪縺吶°・・(Y/N)
echo    譌｢蟄倥・險ｭ螳壹ヵ繧｡繧､繝ｫ縺後≠繧句ｴ蜷医・荳頑嶌縺阪＆繧後∪縺・
set /p CONFIG_CHOICE="驕ｸ謚・(Y/N): "
if /i "!CONFIG_CHOICE!"=="Y" (
    call :AutoClaudeConfig
) else (
    echo 邃ｹ・・ Claude Desktop險ｭ螳壹ｒ繧ｹ繧ｭ繝・・縺励∪縺励◆
    echo 庁 謇句虚險ｭ螳壹′蠢・ｦ√〒縺呻ｼ亥ｾ後〒險ｭ螳壼庄閭ｽ・・
)

:ConfigComplete
goto :FinalCheck

:SkipClaudeConfig
echo [3/4] Claude Desktop險ｭ螳壹ｒ繧ｹ繧ｭ繝・・縺励∪縺励◆・・Auth譛ｪ險ｭ螳夲ｼ・

:FinalCheck
:: 繧ｹ繝・ャ繝・: 蜍穂ｽ懃｢ｺ隱・
echo [4/4] 蜍穂ｽ懃｢ｺ隱堺ｸｭ...
echo ｧｪ 繧ｵ繝ｼ繝舌・襍ｷ蜍輔ユ繧ｹ繝亥ｮ溯｡御ｸｭ...
timeout /t 2 >nul
node --check server.js >> %LOG_FILE% 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 笨・繧ｵ繝ｼ繝舌・讒区枚繝√ぉ繝・け謌仙粥
) else (
    echo 笶・繧ｵ繝ｼ繝舌・讒区枚繝√ぉ繝・け縺ｧ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆
    echo 塘 隧ｳ邏ｰ縺ｪ繧ｨ繝ｩ繝ｼ蜀・ｮｹ:
    echo.
    node --check server.js
    echo.
    echo [%DATE% %TIME%] 繧ｵ繝ｼ繝舌・讒区枚繝√ぉ繝・け繧ｨ繝ｩ繝ｼ >> %LOG_FILE%
)

:: 螳御ｺ・Γ繝・そ繝ｼ繧ｸ
echo.
echo 笊披武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶風
echo 笊・                                                             笊・
echo 笊・                  脂 繧､繝ｳ繧ｹ繝医・繝ｫ螳御ｺ・ｼ・                    笊・
echo 笊・                                                             笊・
echo 笊壺武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶武笊絶幅
echo.
echo 笨・Claude-AppsScript-Pro v3.0.1 繧､繝ｳ繧ｹ繝医・繝ｫ螳御ｺ・
echo 竢ｱ・・ 螳御ｺ・凾蛻ｻ: %TIME%
echo 塘 繝ｭ繧ｰ繝輔ぃ繧､繝ｫ: %LOG_FILE%
echo.

:: 譛邨ら憾豕∫｢ｺ隱・
echo 剥 譛邨りｨｭ螳夂憾豕・
echo    - 蝓ｺ譛ｬ繧､繝ｳ繧ｹ繝医・繝ｫ: 螳御ｺ・
if "%OAUTH_READY%"=="true" (
    echo    - OAuth險ｭ螳・ 笨・螳御ｺ・
    echo    - Claude Desktop險ｭ螳・ 笨・螳御ｺ・
    echo.
    echo 噫 縺吶∋縺ｦ螳御ｺ・ｼ∵ｬ｡縺ｮ謇矩・
    echo    1. Claude Desktop 繧呈焔蜍輔〒蜀崎ｵｷ蜍輔＠縺ｦ縺上□縺輔＞
    echo    2. claude-appsscript-pro 繝・・繝ｫ縺悟茜逕ｨ蜿ｯ閭ｽ縺ｫ縺ｪ繧翫∪縺・
    echo    3. 蜍穂ｽ懃｢ｺ隱・ claude-appsscript-pro:test_connection
) else (
    echo    - OAuth險ｭ螳・ 笶・譛ｪ螳御ｺ・
    echo    - Claude Desktop險ｭ螳・ 竢ｭ・・繧ｹ繧ｭ繝・・
    echo.
    echo 搭 谺｡縺ｮ謇矩・
    echo    1. OAuth險ｭ螳壹ｒ螳御ｺ・ npm run oauth-setup
    echo    2. 縺薙・繧､繝ｳ繧ｹ繝医・繝ｩ繝ｼ繧貞・螳溯｡・ .\install-auto.bat
    echo    3. Claude Desktop 繧呈焔蜍輔〒蜀崎ｵｷ蜍・
)

echo.

echo.
echo 倹 **Web迚・Auth險ｭ螳夲ｼ域耳螂ｨ・・*
echo    1. Google Cloud Console 縺ｧ OAuth2.0 繧ｯ繝ｩ繧､繧｢繝ｳ繝茨ｼ・eb application・峨ｒ菴懈・
echo    2. JSON隱崎ｨｼ繝輔ぃ繧､繝ｫ繧偵ム繧ｦ繝ｳ繝ｭ繝ｼ繝荏necho    3. 縺薙・繧ｳ繝槭Φ繝峨・繝ｭ繝ｳ繝励ヨ縺ｫJSON繝輔ぃ繧､繝ｫ繧偵ラ繝ｩ繝・げ&繝峨Ο繝・・
echo    4. 閾ｪ蜍慕噪縺ｫ .env 繝輔ぃ繧､繝ｫ縺瑚ｨｭ螳壹＆繧後∪縺兪necho.
echo 搭 **繧ｿ繝ｼ繝溘リ繝ｫ迚・Auth險ｭ螳・*
echo    - 繧医ｊ謚陦鍋噪縺ｪ繝ｦ繝ｼ繧ｶ繝ｼ蜷代￠
echo    - 繧ｳ繝槭Φ繝・ npm run oauth-setup
echo.echo 庁 驥崎ｦ・ Claude Desktop 縺ｮ蜀崎ｵｷ蜍輔・謇句虚縺ｧ陦後▲縺ｦ縺上□縺輔＞
echo    閾ｪ蜍戊ｵｷ蜍輔・陦後＞縺ｾ縺帙ｓ

echo [%DATE% %TIME%] 繧､繝ｳ繧ｹ繝医・繝ｫ螳御ｺ・>> %LOG_FILE%
echo.
echo 至 繧ｻ繝・ヨ繧｢繝・・縺悟ｮ御ｺ・＠縺ｾ縺励◆・・

:: PowerShell螳溯｡梧凾縺ｮpause蝗樣∩
if "%AUTOMATED_MODE%"=="true" (
    echo 笨・閾ｪ蜍輔Δ繝ｼ繝・ pause繧偵せ繧ｭ繝・・
    exit /b 0
) else (
    pause
)

:: === 髢｢謨ｰ繧ｻ繧ｯ繧ｷ繝ｧ繝ｳ ===

:: Claude Desktop險ｭ螳夊・蜍募喧髢｢謨ｰ・井ｿｮ豁｣迚・v2025.08.16-3・・
:AutoClaudeConfig
echo 箕・・Claude Desktop險ｭ螳壹ｒ閾ｪ蜍墓峩譁ｰ荳ｭ・域ｧ区枚繧ｨ繝ｩ繝ｼ菫ｮ豁｣迚・v3・・..
set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

:: Node.js繝代せ讀懷・
for /f "delims=" %%i in ('where node 2^>nul') do set "NODE_PATH=%%i"
if "%NODE_PATH%"=="" (
    echo 笶・Node.js繝代せ縺瑚ｦ九▽縺九ｊ縺ｾ縺帙ｓ
    echo 庁 謇句虚險ｭ螳壹′蠢・ｦ√〒縺・
    goto :eof
)

:: 迴ｾ蝨ｨ縺ｮ繝・ぅ繝ｬ繧ｯ繝医Μ繧貞叙蠕・
set "CURRENT_DIR=%CD%"

:: 菫ｮ豁｣縺輔ｌ縺蘖owerShell繧ｹ繧ｯ繝ｪ繝励ヨ
echo 肌 PowerShell螳溯｡御ｸｭ...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
"try { ^
    Write-Host '肌 PowerShell null螳牙・諤ｧ蠑ｷ蛹也沿v3 髢句ｧ・..'; ^
    $configPath = '%CLAUDE_CONFIG%'; ^
    $nodeExe = '%NODE_PATH%'; ^
    $projectDir = '%CURRENT_DIR%'; ^
    $serverPath = Join-Path $projectDir 'server.js'; ^
    $configDir = Split-Path $configPath -Parent; ^
    if (!(Test-Path $configDir)) { ^
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null; ^
        Write-Host '笨・險ｭ螳壹ョ繧｣繝ｬ繧ｯ繝医Μ菴懈・螳御ｺ・ ^
    }; ^
    if (Test-Path $configPath) { ^
        try { ^
            $configContent = Get-Content $configPath -Raw; ^
            if ($configContent -and $configContent.Trim()) { ^
                $config = $configContent | ConvertFrom-Json; ^
                Write-Host '笨・譌｢蟄倩ｨｭ螳壹ヵ繧｡繧､繝ｫ隱ｭ縺ｿ霎ｼ縺ｿ螳御ｺ・ ^
            } else { ^
                $config = New-Object PSObject; ^
                Write-Host '笞・・遨ｺ縺ｮ險ｭ螳壹ヵ繧｡繧､繝ｫ - 譁ｰ隕丈ｽ懈・' ^
            } ^
        } catch { ^
            $config = New-Object PSObject; ^
            Write-Host '笞・・險ｭ螳壹ヵ繧｡繧､繝ｫ隱ｭ縺ｿ霎ｼ縺ｿ繧ｨ繝ｩ繝ｼ - 譁ｰ隕丈ｽ懈・' ^
        } ^
    } else { ^
        $config = New-Object PSObject; ^
        Write-Host '庁 險ｭ螳壹ヵ繧｡繧､繝ｫ譛ｪ蟄伜惠 - 譁ｰ隕丈ｽ懈・' ^
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
    Write-Host '笨・Claude Desktop險ｭ螳壹ヵ繧｡繧､繝ｫ繧呈峩譁ｰ縺励∪縺励◆・・3・・ ^
} catch { ^
    Write-Host '笶・PowerShell螳溯｡後お繝ｩ繝ｼ:' $_.Exception.Message; ^
    Write-Host '剥 隧ｳ邏ｰ:' $_.ScriptStackTrace ^
}"

if %ERRORLEVEL% EQU 0 (
    echo 笨・Claude Desktop險ｭ螳壹ヵ繧｡繧､繝ｫ譖ｴ譁ｰ螳御ｺ・ｼ域ｧ区枚繧ｨ繝ｩ繝ｼ菫ｮ豁｣迚・v3・・
    echo 桃 險ｭ螳壹ヵ繧｡繧､繝ｫ: %CLAUDE_CONFIG%
    echo 肌 Node.js 繝代せ: %NODE_PATH%
    echo [%DATE% %TIME%] Claude Desktop險ｭ螳壼ｮ御ｺ・ｼ・3菫ｮ豁｣迚茨ｼ・>> %LOG_FILE%
) else (
    echo 笶・Claude Desktop險ｭ螳壽峩譁ｰ縺ｧ繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆
    echo 庁 謇句虚險ｭ螳壹′蠢・ｦ√↑蝣ｴ蜷医′縺ゅｊ縺ｾ縺・
    echo [%DATE% %TIME%] Claude Desktop險ｭ螳壹お繝ｩ繝ｼ・・3菫ｮ豁｣迚茨ｼ・>> %LOG_FILE%
)
goto :eof

