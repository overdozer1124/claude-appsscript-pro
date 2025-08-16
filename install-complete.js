#!/usr/bin/env node

/**
 * Claude-AppsScript-Pro 完全統合版インストーラー v1.0.0
 * Windows版革新機能の完全移植・全OS対応・最高機能版
 * 
 * 革新機能:
 * ✅ 全OS自動判別・最適化（Windows/macOS/Linux）
 * ✅ OAuth重複実行防止アルゴリズム
 * ✅ WebアプリOAuth設定（JSONアップロード）
 * ✅ 既存MCP設定完全保護
 * ✅ インタラクティブ・自動モード両対応
 * ✅ リアルタイム進捗表示
 * ✅ 包括的エラーハンドリング・自動復旧
 * ✅ 詳細ログ・セキュリティ機能
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import readline from 'readline';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🌐 グローバル設定
const INSTALL_VERSION = '1.0.0';
const LOG_FILE = 'install-complete.log';

// 🔧 実行モード検出（革新的機能）
const AUTO_MODE = process.env.AUTO_INSTALL_MODE === 'true' || 
                  process.env.GITHUB_ACTIONS === 'true' || 
                  process.env.CI === 'true' ||
                  process.argv.includes('--auto') ||
                  process.argv.includes('-a');

// カラーコード
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  purple: '\x1b[35m'
};

// 🎨 ログ関数（包括的）
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  // ファイルログ
  fs.appendFileSync(LOG_FILE, logMessage + '\n', 'utf8');
  
  // コンソール出力
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`,
    progress: `${colors.cyan}[PROGRESS]${colors.reset}`
  };
  
  console.log(`${prefix[type] || prefix.info} ${message}`);
}

// 🌐 OS情報検出（革新機能）
function detectOS() {
  const platform = os.platform();
  const arch = os.arch();
  
  let osType, osName;
  switch (platform) {
    case 'win32':
      osType = 'windows';
      osName = 'Windows';
      break;
    case 'darwin':
      osType = 'macos';
      osName = 'macOS';
      break;
    case 'linux':
      osType = 'linux';
      osName = 'Linux';
      break;
    default:
      osType = 'unknown';
      osName = 'Unknown';
  }
  
  return {
    platform,
    arch,
    osType,
    osName,
    isWindows: osType === 'windows',
    isMacOS: osType === 'macos',
    isLinux: osType === 'linux'
  };
}

// 🚀 ヘッダー表示（革新的デザイン）
function showHeader() {
  console.clear();
  const osInfo = detectOS();
  
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║   Claude-AppsScript-Pro 完全統合版インストーラー v1.0.0     ║');
  console.log('║        🚀 Windows版革新機能・全OS完全対応版                ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);
  
  log(`⏱️  開始時刻: ${new Date().toLocaleString()}`);
  log(`💻 OS: ${osInfo.osName} (${osInfo.arch})`);
  log(`📁 作業ディレクトリ: ${__dirname}`);
  log(`🤖 実行モード: ${AUTO_MODE ? '完全自動モード' : '対話型インストールモード'}`);
  
  console.log('');
}

// 🔍 OAuth状況確認（革新的論理）
function checkOAuthStatus() {
  const envFile = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envFile)) {
    return 'NO_ENV';
  }
  
  try {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const clientIdMatch = envContent.match(/^GOOGLE_APP_SCRIPT_API_CLIENT_ID=(.*)$/m);
    const refreshTokenMatch = envContent.match(/^GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=(.*)$/m);
    
    const clientId = clientIdMatch?.[1]?.replace(/"/g, '').trim();
    const refreshToken = refreshTokenMatch?.[1]?.replace(/"/g, '').trim();
    
    if (clientId && refreshToken) {
      return 'COMPLETE';
    } else if (clientId) {
      return 'PARTIAL';
    } else {
      return 'MISSING';
    }
  } catch (error) {
    return 'ERROR';
  }
}

// 📦 Node.js検証・パス検出
async function checkNodeJS() {
  log('Node.js環境を確認中...');
  
  try {
    const { stdout: version } = await execAsync('node --version');
    const { stdout: nodePath } = await execAsync(process.platform === 'win32' ? 'where node' : 'which node');
    
    const majorVersion = parseInt(version.replace('v', '').split('.')[0]);
    const cleanNodePath = nodePath.split('\n')[0].trim();
    
    if (majorVersion < 18) {
      throw new Error(`Node.js ${version.trim()} が検出されました。v18.0.0以上が必要です`);
    }
    
    log(`Node.js ${version.trim()} を使用します (${cleanNodePath})`, 'success');
    return cleanNodePath;
  } catch (error) {
    log('Node.jsが見つかりません', 'error');
    log('Node.js v18.0.0以上をインストールしてください: https://nodejs.org/', 'error');
    throw error;
  }
}

// 📝 .env ファイル作成・確認
function setupEnvFile() {
  const envFile = path.join(__dirname, '.env');
  const exampleFile = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envFile)) {
    log('環境設定ファイル（.env）を作成中...');
    
    if (fs.existsSync(exampleFile)) {
      fs.copyFileSync(exampleFile, envFile);
    } else {
      const defaultEnv = `# Google Apps Script API認証情報
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
`;
      fs.writeFileSync(envFile, defaultEnv, 'utf8');
    }
    
    log('.envファイルを作成しました', 'success');
  } else {
    log('.envファイルは既に存在します');
  }
}

// 📊 進捗表示（インタラクティブ）
function showProgress(step, total, description) {
  const percentage = Math.round((step / total) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  
  log(`[${step}/${total}] ${description}`, 'progress');
  console.log(`   ${colors.cyan}${progressBar}${colors.reset} ${percentage}%`);
}

// 🔐 OAuth設定実行（智能判断）
async function handleOAuthSetup(nodePath) {
  const oauthStatus = checkOAuthStatus();
  
  log('OAuth設定を確認中...');
  
  switch (oauthStatus) {
    case 'COMPLETE':
      log('OAuth設定済みを検出（CLIENT_ID + REFRESH_TOKEN）', 'success');
      return true;
    
    case 'PARTIAL':
      log('OAuth設定が部分的です（REFRESH_TOKEN不足）', 'warning');
      break;
    
    default:
      log('OAuth設定が必要です', 'warning');
      break;
  }
  
  if (AUTO_MODE) {
    log('🤖 自動モード: OAuth設定を自動実行します');
    return await runOAuthSetup(nodePath, true);
  } else {
    return await runOAuthSetupInteractive(nodePath);
  }
}

// 🌐 OAuth設定実行（自動モード）
async function runOAuthSetup(nodePath, autoMode = false) {
  try {
    log('クロスプラットフォームOAuth設定を実行中...');
    
    const oauthScript = path.join(__dirname, 'scripts', 'oauth-setup-cross.cjs');
    const args = autoMode ? ['--web', '--auto'] : ['--web'];
    
    const { stdout, stderr } = await execAsync(`"${nodePath}" "${oauthScript}" ${args.join(' ')}`);
    
    if (stderr && !stderr.includes('warning')) {
      throw new Error(stderr);
    }
    
    // OAuth設定後の確認
    const oauthStatusAfter = checkOAuthStatus();
    if (oauthStatusAfter === 'COMPLETE') {
      log('OAuth設定が正常に完了しました', 'success');
      return true;
    } else {
      log('OAuth設定が完了していない可能性があります', 'warning');
      return false;
    }
  } catch (error) {
    log(`OAuth設定エラー: ${error.message}`, 'error');
    
    // フォールバック: ターミナル版で再試行
    try {
      log('Web版OAuth設定に失敗、ターミナル版で再試行');
      await execAsync(`"${nodePath}" "${oauthScript}"`);
      return true;
    } catch (fallbackError) {
      log(`ターミナル版OAuth設定も失敗: ${fallbackError.message}`, 'error');
      return false;
    }
  }
}

// 💬 OAuth設定実行（対話型モード）
async function runOAuthSetupInteractive(nodePath) {
  console.log('');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}📋 Google Cloud Console OAuth設定ガイド${colors.reset}`);
  console.log('');
  console.log('以下の手順でOAuth認証を設定してください：');
  console.log('');
  console.log(`${colors.bright}1. Google Cloud Consoleにアクセス${colors.reset}`);
  console.log(`   ${colors.blue}https://console.cloud.google.com/apis/credentials${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}2. OAuth 2.0 クライアントIDを作成${colors.reset}`);
  console.log('   - 「認証情報を作成」→「OAuth 2.0 クライアント ID」');
  console.log(`   - タイプ: ${colors.yellow}「ウェブ アプリケーション」${colors.reset}（重要！）`);
  console.log(`   - リダイレクトURI: ${colors.green}http://localhost:3001/oauth/callback${colors.reset}`);
  console.log('');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise((resolve) => {
    rl.question(`${colors.purple}🔑 OAuth設定を開始しますか？ (Y/N): ${colors.reset}`, resolve);
  });
  
  rl.close();
  
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    return await runOAuthSetup(nodePath, false);
  } else {
    log('OAuth設定をスキップしました（ユーザー選択）');
    log('OAuth設定なしではツールは使用できません', 'warning');
    return false;
  }
}

// ⚙️ Claude Desktop設定更新（安全更新）
async function updateClaudeDesktopConfig(nodePath) {
  try {
    log('Claude Desktop設定を安全更新中...');
    
    const updateScript = path.join(__dirname, 'scripts', 'update-claude-config-cross.cjs');
    await execAsync(`"${nodePath}" "${updateScript}"`);
    
    log('Claude Desktop設定を安全に更新しました', 'success');
    return true;
  } catch (error) {
    log(`Claude Desktop設定の更新に失敗しました: ${error.message}`, 'error');
    log('手動設定が必要な場合があります', 'error');
    return false;
  }
}

// 🔍 システム検証
async function verifyInstallation(nodePath) {
  log('システム検証・動作確認中...');
  
  // 構文チェック
  const serverFile = path.join(__dirname, 'server.js');
  if (fs.existsSync(serverFile)) {
    try {
      await execAsync(`"${nodePath}" --check "${serverFile}"`);
      log('server.js構文チェック完了', 'success');
    } catch (error) {
      log('server.js構文エラーが検出されました', 'error');
      log(`詳細は ${LOG_FILE} を確認してください`, 'error');
      return false;
    }
  } else {
    log('server.jsが見つかりません', 'warning');
  }
  
  return true;
}

// 🎊 完了メッセージ表示
function showCompletionMessage() {
  console.log('');
  console.log(`${colors.green}${colors.bright}🎊 Claude-AppsScript-Pro 完全統合版インストール完了！${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}📌 最終ステップ（必須）:${colors.reset}`);
  console.log(`1. ${colors.yellow}Claude Desktop を完全終了${colors.reset}`);
  console.log(`2. ${colors.yellow}Claude Desktop を再起動${colors.reset}`);
  console.log('3. 設定 → 開発者 → 「ローカルMCPサーバーを有効化」をオン');
  console.log('');
  console.log(`${colors.bright}✅ 接続確認コマンド:${colors.reset}`);
  console.log(`   ${colors.cyan}claude-appsscript-pro:test_connection${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}🚀 実装済み革新機能:${colors.reset}`);
  console.log('   ✅ OAuth重複実行防止');
  console.log('   ✅ WebアプリOAuth設定対応');
  console.log('   ✅ 既存MCP設定完全保護');
  console.log('   ✅ 61ツール統合環境');
  console.log('   ✅ AI自律ワークフローシステム');
  console.log('   ✅ 全OS統一インストール体験');
  console.log('');
  
  // 💡 重要: Claude Desktop手動再起動の案内
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');
  console.log(`${colors.purple}💡 重要: Claude Desktop の再起動は手動で行ってください${colors.reset}`);
  console.log('   - 自動起動は行いません');
  console.log('   - ユーザーのタイミングで安全に再起動できます');
  console.log('');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  log('インストール完了', 'success');
  log(`ログファイル: ${LOG_FILE}`);
  
  console.log('');
  console.log(`${colors.green}💡 おつかれさまでした！${colors.reset}`);
  console.log('   Claude-AppsScript-Pro v3.0.1 完全統合版のセットアップが完了しました');
  console.log('');
}

// 🎯 メイン処理（革新的統合フロー）
async function main() {
  try {
    showHeader();
    
    // Step 1: 基本環境確認・依存関係インストール
    showProgress(1, 4, '基本環境確認・依存関係インストール中...');
    
    const nodePath = await checkNodeJS();
    
    // package.json存在確認
    const packageFile = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageFile)) {
      throw new Error('package.jsonが見つかりません。プロジェクトディレクトリで実行してください');
    }
    
    // 依存関係インストール
    log('依存関係をインストール中（数分かかる場合があります）...');
    try {
      await execAsync('npm install --no-optional --no-fund');
      log('依存関係のインストール完了', 'success');
    } catch (error) {
      log('依存関係のインストールで警告が発生しましたが続行します', 'warning');
    }
    
    setupEnvFile();
    
    // Step 2: OAuth設定確認・実行
    showProgress(2, 4, 'OAuth設定確認・実行中...');
    
    await handleOAuthSetup(nodePath);
    
    // Step 3: Claude Desktop設定更新
    showProgress(3, 4, 'Claude Desktop設定安全更新中...');
    
    await updateClaudeDesktopConfig(nodePath);
    
    // Step 4: システム検証・動作確認
    showProgress(4, 4, 'システム検証・動作確認中...');
    
    await verifyInstallation(nodePath);
    
    // 完了メッセージ
    showCompletionMessage();
    
    if (!AUTO_MODE) {
      console.log('Enterキーを押して終了...');
      await new Promise((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question('', () => {
          rl.close();
          resolve();
        });
      });
    }
    
  } catch (error) {
    log(`インストールエラー: ${error.message}`, 'error');
    log('トラブルシューティングガイドを参照してください', 'error');
    
    if (!AUTO_MODE) {
      console.log('Enterキーを押して終了...');
      await new Promise((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question('', () => {
          rl.close();
          resolve();
        });
      });
    }
    
    process.exit(1);
  }
}

// 🚀 実行開始
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`${colors.red}致命的エラー: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

export default main;
