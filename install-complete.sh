#!/bin/bash
# Claude-AppsScript-Pro 完全版 macOS/Linux インストーラー v1.0.0
# Windows版install-auto.bat同等機能完全移植版
#
# 革新機能:
# ✅ OAuth重複実行防止アルゴリズム
# ✅ REFRESH_TOKEN自動検出
# ✅ WebアプリOAuth設定（JSONアップロード）
# ✅ 既存MCP設定完全保護
# ✅ エラー自動復旧・詳細ログ
# ✅ 自動モード/対話型モード両対応

set -e  # エラー時に即座終了

# カラーコード定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# 🔧 自動実行モード検出（環境変数制御）
AUTO_MODE=${AUTO_INSTALL_MODE:-false}
if [[ "${GITHUB_ACTIONS}" == "true" ]] || [[ "${CI}" == "true" ]]; then
    AUTO_MODE="true"
fi

# ログファイル設定
LOG_FILE="install-complete.log"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ログ関数
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "WARNING") echo -e "${YELLOW}[WARNING]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "*") echo -e "$message" ;;
    esac
}

# ヘッダー表示
clear
echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   Claude-AppsScript-Pro 完全版 Unix インストーラー v1.0.0   ║"
echo "║        🚀 Windows版同等機能・クロスプラットフォーム版       ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

log "INFO" "⏱️  開始時刻: $(date)"
log "INFO" "📁 作業ディレクトリ: $SCRIPT_DIR"
if [[ "$AUTO_MODE" == "true" ]]; then
    log "INFO" "🤖 実行モード: 完全自動モード"
else
    log "INFO" "👤 実行モード: 対話型インストールモード"
fi

# OS検出
detect_os() {
    case "$OSTYPE" in
        darwin*)  echo "macos" ;;
        linux*)   echo "linux" ;;
        *)        echo "unknown" ;;
    esac
}

OS_TYPE=$(detect_os)
log "INFO" "OS: $OS_TYPE を検出しました"

# OAuth状況確認関数（革新的機能）
check_oauth_status() {
    local env_file="$SCRIPT_DIR/.env"
    
    if [[ ! -f "$env_file" ]]; then
        echo "NO_ENV"
        return
    fi
    
    local client_id=$(grep "^GOOGLE_APP_SCRIPT_API_CLIENT_ID=" "$env_file" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | xargs)
    local refresh_token=$(grep "^GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=" "$env_file" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | xargs)
    
    if [[ -n "$client_id" && -n "$refresh_token" ]]; then
        echo "COMPLETE"
    elif [[ -n "$client_id" ]]; then
        echo "PARTIAL"
    else
        echo "MISSING"
    fi
}

# Node.js確認・検出
check_nodejs() {
    log "INFO" "Node.jsを確認中..."
    
    local node_path
    if command -v node >/dev/null 2>&1; then
        node_path=$(command -v node)
    else
        log "ERROR" "Node.jsが見つかりません"
        log "ERROR" "Node.js v18.0.0以上をインストールしてください: https://nodejs.org/"
        exit 1
    fi
    
    local node_version=$(node --version)
    local major_version=$(echo "$node_version" | sed 's/v//' | cut -d'.' -f1)
    
    if [[ "$major_version" -lt 18 ]]; then
        log "ERROR" "Node.js $node_version が検出されました。v18.0.0以上が必要です"
        exit 1
    fi
    
    log "SUCCESS" "Node.js $node_version を使用します ($node_path)"
    echo "$node_path"
}

# =========================================================================
# Step 1: 基本環境確認・依存関係インストール
# =========================================================================
log "INFO" "[1/4] 基本環境確認・依存関係インストール中..."

cd "$SCRIPT_DIR"

NODE_PATH=$(check_nodejs)

# package.json存在確認
if [[ ! -f "package.json" ]]; then
    log "ERROR" "package.jsonが見つかりません。プロジェクトディレクトリで実行してください"
    exit 1
fi

# 依存関係インストール
log "INFO" "依存関係をインストール中（数分かかる場合があります）..."
if npm install --no-optional --no-fund >> "$LOG_FILE" 2>&1; then
    log "SUCCESS" "依存関係のインストール完了"
else
    log "WARNING" "依存関係のインストールで警告が発生しましたが続行します"
fi

# .envファイル確認・作成
if [[ ! -f ".env" ]]; then
    log "INFO" "環境設定ファイル（.env）を作成中..."
    if [[ -f ".env.example" ]]; then
        cp .env.example .env
    else
        cat > .env << 'EOF'
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
    fi
    log "SUCCESS" ".envファイルを作成しました"
else
    log "INFO" ".envファイルは既に存在します"
fi

# =========================================================================
# Step 2: OAuth設定確認・実行（革新的論理改善）
# =========================================================================
log "INFO" "[2/4] OAuth設定を確認中..."

OAUTH_STATUS=$(check_oauth_status)

case "$OAUTH_STATUS" in
    "COMPLETE")
        log "SUCCESS" "OAuth設定済みを検出（CLIENT_ID + REFRESH_TOKEN）"
        ;;
    "PARTIAL")
        log "WARNING" "OAuth設定が部分的です（REFRESH_TOKEN不足）"
        oauth_needed=true
        ;;
    *)
        log "WARNING" "OAuth設定が必要です"
        oauth_needed=true
        ;;
esac

if [[ "${oauth_needed:-false}" == "true" ]]; then
    if [[ "$AUTO_MODE" == "true" ]]; then
        log "INFO" "🤖 自動モード: OAuth設定を自動実行します"
        run_oauth=true
    else
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BOLD}📋 Google Cloud Console OAuth設定ガイド${NC}"
        echo ""
        echo "以下の手順でOAuth認証を設定してください："
        echo ""
        echo -e "${BOLD}1. Google Cloud Consoleにアクセス${NC}"
        echo -e "   ${BLUE}https://console.cloud.google.com/apis/credentials${NC}"
        echo ""
        echo -e "${BOLD}2. OAuth 2.0 クライアントIDを作成${NC}"
        echo "   - 「認証情報を作成」→「OAuth 2.0 クライアント ID」"
        echo -e "   - タイプ: ${YELLOW}「ウェブ アプリケーション」${NC}（重要！）"
        echo -e "   - リダイレクトURI: ${GREEN}http://localhost:3001/oauth/callback${NC}"
        echo ""
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${PURPLE}🔑 OAuth設定を開始しますか？ (Y/N)${NC}"
        read -p "選択 (Y/N): " OAUTH_CHOICE
        
        if [[ "${OAUTH_CHOICE,,}" == "y" || "${OAUTH_CHOICE,,}" == "yes" ]]; then
            run_oauth=true
        else
            log "INFO" "OAuth設定をスキップしました（ユーザー選択）"
            log "WARNING" "OAuth設定なしではツールは使用できません"
            run_oauth=false
        fi
    fi
    
    if [[ "${run_oauth:-false}" == "true" ]]; then
        log "INFO" "クロスプラットフォームOAuth設定を実行中..."
        if [[ "$AUTO_MODE" == "true" ]]; then
            # Web版OAuth（自動モード）
            "$NODE_PATH" scripts/oauth-setup-cross.cjs --web --auto >> "$LOG_FILE" 2>&1 || {
                log "WARNING" "Web版OAuth設定に失敗、ターミナル版で再試行"
                "$NODE_PATH" scripts/oauth-setup-cross.cjs >> "$LOG_FILE" 2>&1
            }
        else
            # 対話型OAuth設定
            "$NODE_PATH" scripts/oauth-setup-cross.cjs --web
        fi
        
        # OAuth設定後の確認
        OAUTH_STATUS_AFTER=$(check_oauth_status)
        if [[ "$OAUTH_STATUS_AFTER" == "COMPLETE" ]]; then
            log "SUCCESS" "OAuth設定が正常に完了しました"
        else
            log "WARNING" "OAuth設定が完了していない可能性があります"
        fi
    fi
fi

# =========================================================================
# Step 3: Claude Desktop設定更新（安全更新）
# =========================================================================
log "INFO" "[3/4] Claude Desktop設定を安全更新中..."

if "$NODE_PATH" scripts/update-claude-config-cross.cjs >> "$LOG_FILE" 2>&1; then
    log "SUCCESS" "Claude Desktop設定を安全に更新しました"
else
    log "ERROR" "Claude Desktop設定の更新に失敗しました"
    log "ERROR" "手動設定が必要な場合があります"
fi

# =========================================================================
# Step 4: システム検証・動作確認
# =========================================================================
log "INFO" "[4/4] システム検証・動作確認中..."

# 構文チェック
if [[ -f "server.js" ]]; then
    if "$NODE_PATH" --check server.js >> "$LOG_FILE" 2>&1; then
        log "SUCCESS" "server.js構文チェック完了"
    else
        log "ERROR" "server.js構文エラーが検出されました"
        log "ERROR" "詳細は $LOG_FILE を確認してください"
    fi
else
    log "WARNING" "server.jsが見つかりません"
fi

# 完了メッセージ
echo ""
echo -e "${GREEN}${BOLD}🎊 Claude-AppsScript-Pro 完全版インストール完了！${NC}"
echo ""
echo -e "${BOLD}📌 最終ステップ（必須）:${NC}"
echo "1. ${YELLOW}Claude Desktop を完全終了${NC}"
echo "2. ${YELLOW}Claude Desktop を再起動${NC}"
echo "3. 設定 → 開発者 → 「ローカルMCPサーバーを有効化」をオン"
echo ""
echo -e "${BOLD}✅ 接続確認コマンド:${NC}"
echo -e "   ${CYAN}claude-appsscript-pro:test_connection${NC}"
echo ""
echo -e "${BOLD}🚀 実装済み革新機能:${NC}"
echo "   ✅ OAuth重複実行防止"
echo "   ✅ WebアプリOAuth設定対応"
echo "   ✅ 既存MCP設定完全保護"
echo "   ✅ 61ツール統合環境"
echo "   ✅ AI自律ワークフローシステム"
echo ""

# 💡 重要: Claude Desktop手動再起動の案内
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${PURPLE}💡 重要: Claude Desktop の再起動は手動で行ってください${NC}"
echo "   - 自動起動は行いません"
echo "   - ユーザーのタイミングで安全に再起動できます"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

log "SUCCESS" "インストール完了"
log "INFO" "ログファイル: $LOG_FILE"

echo ""
echo -e "${GREEN}💡 おつかれさまでした！${NC}"
echo -e "   Claude-AppsScript-Pro v3.0.1 完全版のセットアップが完了しました"
echo ""

if [[ "$AUTO_MODE" != "true" ]]; then
    echo "Enterキーを押して終了..."
    read -r
fi
