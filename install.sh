#!/bin/bash

# Claude-AppsScript-Pro macOS/Linux簡単インストーラー
# バージョン: 1.0.0

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ロゴ表示
clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     Claude-AppsScript-Pro macOS/Linux インストーラー         ║"
echo "║                      Version 1.0.0                          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# OS検出
OS_TYPE="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
fi

echo -e "${BLUE}[INFO]${NC} OS: $OS_TYPE を検出しました"

# Node.jsパス検出
echo -e "${BLUE}[INFO]${NC} Node.jsを確認中..."

NODE_PATH=$(which node)
NPM_PATH=$(which npm)

if [ -z "$NODE_PATH" ]; then
    echo -e "${RED}[ERROR]${NC} Node.jsが見つかりません。"
    echo "Node.js v18.0.0以上をインストールしてください："
    echo "https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} Node.jsを検出しました: $NODE_PATH"

# Node.jsバージョン確認
NODE_VERSION=$($NODE_PATH --version)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

if [ "$MAJOR_VERSION" -lt 18 ]; then
    echo -e "${RED}[ERROR]${NC} Node.js $NODE_VERSION が検出されました。v18.0.0以上が必要です。"
    exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} Node.js $NODE_VERSION を使用します"

# 依存関係のインストール
echo -e "${BLUE}[INFO]${NC} 依存関係をインストール中..."
echo "これには数分かかる場合があります..."

$NPM_PATH install --no-optional --no-fund > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[SUCCESS]${NC} 依存関係のインストール完了"
else
    echo -e "${YELLOW}[WARNING]${NC} 依存関係のインストールで警告が発生しました"
    echo "続行します..."
fi

# .envファイルの作成
echo -e "${BLUE}[INFO]${NC} 環境設定ファイルを作成中..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}[SUCCESS]${NC} .envファイルを作成しました"
    else
        cat > .env << EOF
# Google Apps Script API認証情報
GOOGLE_APP_SCRIPT_API_CLIENT_ID=
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=
GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=
GOOGLE_APP_SCRIPT_API_REDIRECT_URI=http://localhost:3001/oauth/callback

# 推奨設定
LOG_LEVEL=info
SCRIPT_API_TIMEOUT_MS=30000
MAX_CONCURRENT_REQUESTS=5

# デバッグ設定（開発時のみ）
DEBUG_MODE=false
VERBOSE_LOGGING=false
EOF
        echo -e "${GREEN}[SUCCESS]${NC} .envファイルを作成しました"
    fi
else
    echo -e "${BLUE}[INFO]${NC} .envファイルは既に存在します"
fi

# Claude Desktop設定の更新
echo -e "${BLUE}[INFO]${NC} Claude Desktop設定を更新中..."

CONFIG_PATH=""
if [ "$OS_TYPE" == "macos" ]; then
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
else
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
fi

# ディレクトリが存在しない場合は作成
CONFIG_DIR=$(dirname "$CONFIG_PATH")
if [ ! -d "$CONFIG_DIR" ]; then
    mkdir -p "$CONFIG_DIR"
fi

# 設定ファイルが存在しない場合は新規作成
if [ ! -f "$CONFIG_PATH" ]; then
    echo '{}' > "$CONFIG_PATH"
fi

# Node.jsでJSON更新（jqがない環境でも動作）
$NODE_PATH -e "
const fs = require('fs');
const path = '$CONFIG_PATH';
const config = JSON.parse(fs.readFileSync(path, 'utf8') || '{}');
config.mcpServers = config.mcpServers || {};
config.mcpServers['claude-appsscript-pro'] = {
    command: '$NODE_PATH',
    args: ['$(pwd)/server.js'],
    cwd: '$(pwd)'
};
fs.writeFileSync(path, JSON.stringify(config, null, 2));
console.log('Claude Desktop設定を更新しました');
"

echo -e "${GREEN}[SUCCESS]${NC} Claude Desktop設定を更新しました"

# インテリジェントインストーラーの実行（存在する場合）
if [ -f install.js ]; then
    echo -e "${BLUE}[INFO]${NC} インテリジェントセットアップを実行中..."
    $NODE_PATH install.js
else
    # 手動設定ガイド表示
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📋 OAuth認証設定ガイド${NC}"
    echo ""
    echo "以下の手順でGoogle Cloud ConsoleでOAuth認証を設定してください："
    echo ""
    echo -e "${BOLD}1. Google Cloud Consoleにアクセス${NC}"
    echo -e "   ${BLUE}https://console.cloud.google.com${NC}"
    echo ""
    echo -e "${BOLD}2. 新しいプロジェクトを作成または既存のプロジェクトを選択${NC}"
    echo ""
    echo -e "${BOLD}3. 以下のAPIを有効化${NC}"
    echo "   ✅ Google Apps Script API"
    echo "   ✅ Google Drive API"
    echo "   ✅ Google Sheets API"
    echo ""
    echo -e "${BOLD}4. OAuth 2.0 クライアントIDを作成${NC}"
    echo "   - 「APIとサービス」→「認証情報」→「認証情報を作成」"
    echo -e "   - タイプ: ${YELLOW}「Webアプリケーション」${NC}（重要！）"
    echo -e "   - リダイレクトURI: ${GREEN}http://localhost:3001/oauth/callback${NC}"
    echo ""
    echo -e "${BOLD}5. クライアントIDとシークレットを.envファイルに設定${NC}"
    echo ""
    echo -e "${BOLD}6. リフレッシュトークンを取得${NC}"
    echo -e "   ${CYAN}npm run oauth-setup${NC}"
    echo ""
    echo -e "${BOLD}7. Claude Desktopを再起動${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
echo -e "${GREEN}${BOLD}✅ インストール処理が完了しました！${NC}"
echo ""
echo -e "${BOLD}📌 最終ステップ:${NC}"
echo "1. Claude Desktopを完全に終了"
echo "2. Claude Desktopを再起動"
echo "3. 設定 → 開発者 → 「ローカルMCPサーバーを有効化」をオン"
echo "4. Claude内で以下のコマンドを実行して接続確認:"
echo -e "   ${CYAN}claude-appsscript-pro:test_connection${NC}"
echo ""
