#!/usr/bin/env node

/**
 * Claude-AppsScript-Pro インテリジェントインストーラー
 * バージョン: 1.0.0
 * 
 * このスクリプトは、Claude-AppsScript-Pro MCPサーバーを
 * 完全自動でセットアップします。
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

// カラーコード
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// ロゴ表示
function showLogo() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     Claude-AppsScript-Pro インテリジェントインストーラー    ║
║                      Version 1.0.0                          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);
}

// ログ関数
function log(message, type = 'info') {
  const prefix = {
    info: `${colors.blue}[INFO]${colors.reset}`,
    success: `${colors.green}[SUCCESS]${colors.reset}`,
    warning: `${colors.yellow}[WARNING]${colors.reset}`,
    error: `${colors.red}[ERROR]${colors.reset}`
  };
  console.log(`${prefix[type]} ${message}`);
}

// プログレスバー表示
function showProgress(current, total, message) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 40;
  const filled = Math.round((barLength * current) / total);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  process.stdout.write(`\r${message}: [${bar}] ${percentage}%`);
  if (current === total) {
    console.log('');
  }
}

// OS検出
function detectOS() {
  const platform = os.platform();
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') return 'linux';
  return 'unknown';
}

// Node.jsパス自動検出
async function detectNodePath() {
  const osType = detectOS();
  let nodePath = 'node';
  let npmPath = 'npm';

  if (osType === 'windows') {
    // Windows用パス検出
    const possiblePaths = [
      'C:\\Program Files\\nodejs\\node.exe',
      'C:\\Program Files (x86)\\nodejs\\node.exe',
      process.env.ProgramFiles + '\\nodejs\\node.exe',
      process.env['ProgramFiles(x86)'] + '\\nodejs\\node.exe'
    ];

    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        nodePath = path;
        npmPath = path.replace('node.exe', 'npm.cmd');
        break;
      }
    }

    // whereコマンドで検出
    if (nodePath === 'node') {
      try {
        const { stdout } = await execAsync('where node');
        const paths = stdout.trim().split('\n');
        if (paths[0]) {
          nodePath = paths[0].trim();
          npmPath = nodePath.replace('node.exe', 'npm.cmd');
        }
      } catch (error) {
        // whereコマンドが失敗した場合は無視
      }
    }
  } else {
    // Unix系OS用パス検出
    try {
      const { stdout } = await execAsync('which node');
      nodePath = stdout.trim();
      const { stdout: npmStdout } = await execAsync('which npm');
      npmPath = npmStdout.trim();
    } catch (error) {
      // whichコマンドが失敗した場合は無視
    }
  }

  return { nodePath, npmPath };
}

// Node.jsバージョンチェック
async function checkNodeVersion(nodePath) {
  try {
    const { stdout } = await execAsync(`"${nodePath}" --version`);
    const version = stdout.trim();
    const majorVersion = parseInt(version.split('.')[0].replace('v', ''));
    
    if (majorVersion < 18) {
      log(`Node.js ${version} が検出されました。v18.0.0以上が必要です。`, 'error');
      return false;
    }
    
    log(`Node.js ${version} が検出されました ✓`, 'success');
    return true;
  } catch (error) {
    log('Node.jsが見つかりません。Node.js v18.0.0以上をインストールしてください。', 'error');
    return false;
  }
}

// 正規表現エラーの自動修正
async function fixRegexErrors() {
  const filePath = path.join(__dirname, 'lib', 'handlers', 'execution-tools.js');
  
  if (fs.existsSync(filePath)) {
    log('正規表現エラーをチェック中...', 'info');
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // ダブルエスケープの修正
    const doubleEscapePattern = /\\\\\//g;
    if (content.includes('\\\\')) {
      content = content.replace(
        /const functionPattern = \/\(.*?\)\/g;/,
        'const functionPattern = /(?:\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?function\\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\\s*\\(([^)]*)\\)\\s*\\{/g;'
      );
      
      // 実際にはシングルエスケープに修正
      content = content.replace(
        /\\\\\//g,
        '\\/'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      log('正規表現エラーを自動修正しました ✓', 'success');
    } else {
      log('正規表現エラーは検出されませんでした ✓', 'success');
    }
  }
}

// 依存関係のインストール
async function installDependencies(npmPath) {
  return new Promise((resolve, reject) => {
    log('依存関係をインストール中...', 'info');
    
    const npmInstall = spawn(npmPath, ['install', '--no-optional', '--no-fund'], {
      cwd: __dirname,
      shell: true,
      stdio: 'pipe'
    });

    let lastOutput = '';
    npmInstall.stdout.on('data', (data) => {
      lastOutput = data.toString();
      // npm installの進捗表示を簡略化
      if (lastOutput.includes('added')) {
        process.stdout.write('.');
      }
    });

    npmInstall.stderr.on('data', (data) => {
      const message = data.toString();
      if (!message.includes('npm WARN')) {
        console.error(`\n${colors.yellow}${message}${colors.reset}`);
      }
    });

    npmInstall.on('close', (code) => {
      console.log(''); // 改行
      if (code === 0) {
        log('依存関係のインストールが完了しました ✓', 'success');
        resolve();
      } else {
        log('依存関係のインストールに失敗しました', 'error');
        reject(new Error(`npm install failed with code ${code}`));
      }
    });
  });
}

// .envファイルの作成または更新
async function setupEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log('.envファイルを作成しました', 'success');
    } else {
      // .env.exampleがない場合は新規作成
      const envContent = `# Google Apps Script API認証情報
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
      fs.writeFileSync(envPath, envContent);
      log('.envファイルを作成しました', 'success');
    }
  } else {
    log('.envファイルが既に存在します', 'info');
  }
}

// Claude Desktop設定の自動更新
async function updateClaudeDesktopConfig(nodePath) {
  const osType = detectOS();
  let configPath;

  if (osType === 'windows') {
    configPath = path.join(process.env.APPDATA, 'Claude', 'claude_desktop_config.json');
  } else if (osType === 'macos') {
    configPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else {
    configPath = path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }

  log(`Claude Desktop設定ファイルを更新中: ${configPath}`, 'info');

  let config = {};
  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      log('既存の設定ファイルの読み込みに失敗しました。新規作成します。', 'warning');
    }
  } else {
    // ディレクトリが存在しない場合は作成
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  // MCP設定を追加/更新
  config.mcpServers = config.mcpServers || {};
  config.mcpServers['claude-appsscript-pro'] = {
    command: nodePath,
    args: [path.join(__dirname, 'server.js')],
    cwd: __dirname
  };

  // 設定を保存
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log('Claude Desktop設定を更新しました ✓', 'success');
  
  return configPath;
}

// package.jsonのスクリプト更新
async function updatePackageJsonScripts(nodePath, npmPath) {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Node.jsパスでスクリプトを更新
  const osType = detectOS();
  if (osType === 'windows') {
    // Windows用スクリプトの更新
    packageJson.scripts['start-win'] = `"${nodePath}" server.js`;
    packageJson.scripts['dev-win'] = `"${nodePath}" server.js`;
    packageJson.scripts['check-win'] = `"${nodePath}" --check server.js`;
    packageJson.scripts['oauth-setup-win'] = `"${nodePath}" scripts/oauth-setup.cjs`;
    packageJson.scripts['auth-win'] = `"${nodePath}" scripts/oauth-setup.cjs`;
    packageJson.scripts['install-deps-win'] = `"${npmPath}" install --no-optional --no-fund`;
    packageJson.scripts['setup-win'] = `"${npmPath}" install && echo Setup complete!`;
  }
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4));
  log('package.jsonのスクリプトを更新しました ✓', 'success');
}

// OAuth設定ガイド
async function showOAuthGuide() {
  console.log(`
${colors.cyan}${colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
${colors.yellow}📋 OAuth認証設定ガイド${colors.reset}

以下の手順でGoogle Cloud ConsoleでOAuth認証を設定してください：

${colors.bright}1. Google Cloud Consoleにアクセス${colors.reset}
   ${colors.blue}https://console.cloud.google.com${colors.reset}

${colors.bright}2. 新しいプロジェクトを作成または既存のプロジェクトを選択${colors.reset}

${colors.bright}3. 以下のAPIを有効化${colors.reset}
   ✅ Google Apps Script API
   ✅ Google Drive API
   ✅ Google Sheets API

${colors.bright}4. OAuth 2.0 クライアントIDを作成${colors.reset}
   - 「APIとサービス」→「認証情報」→「認証情報を作成」
   - タイプ: ${colors.yellow}「Webアプリケーション」${colors.reset}（重要！）
   - リダイレクトURI: ${colors.green}http://localhost:3001/oauth/callback${colors.reset}

${colors.bright}5. クライアントIDとシークレットを.envファイルに設定${colors.reset}

${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}
`);
}

// インタラクティブなOAuth設定
async function interactiveOAuthSetup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => rl.question(query, resolve));

  console.log(`\n${colors.yellow}OAuth認証設定を開始します${colors.reset}`);
  
  const clientId = await question(`${colors.cyan}Google OAuth クライアントID: ${colors.reset}`);
  const clientSecret = await question(`${colors.cyan}Google OAuth クライアントシークレット: ${colors.reset}`);
  
  rl.close();

  if (clientId && clientSecret) {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent = envContent.replace(
      /GOOGLE_APP_SCRIPT_API_CLIENT_ID=.*/,
      `GOOGLE_APP_SCRIPT_API_CLIENT_ID=${clientId}`
    );
    envContent = envContent.replace(
      /GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=.*/,
      `GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=${clientSecret}`
    );
    
    fs.writeFileSync(envPath, envContent);
    log('OAuth認証情報を保存しました ✓', 'success');
    return true;
  }
  
  return false;
}

// サーバー起動テスト
async function testServerStartup(nodePath) {
  return new Promise((resolve) => {
    log('サーバー起動テスト中...', 'info');
    
    const serverProcess = spawn(nodePath, [path.join(__dirname, 'server.js')], {
      cwd: __dirname,
      shell: true,
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';
    const timeout = setTimeout(() => {
      serverProcess.kill();
      if (output.includes('Claude-AppsScript-Pro Server')) {
        log('サーバー起動テスト成功 ✓', 'success');
        resolve(true);
      } else {
        log('サーバー起動テスト失敗', 'error');
        if (errorOutput) {
          console.log(`${colors.red}エラー詳細:${colors.reset}\n${errorOutput}`);
        }
        resolve(false);
      }
    }, 5000);

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    serverProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      log(`サーバー起動エラー: ${error.message}`, 'error');
      resolve(false);
    });
  });
}

// メイン処理
async function main() {
  showLogo();
  
  const steps = [
    { name: 'OS検出', func: detectOS },
    { name: 'Node.jsパス検出', func: detectNodePath },
    { name: 'Node.jsバージョン確認', func: null },
    { name: '正規表現エラー修正', func: fixRegexErrors },
    { name: '依存関係インストール', func: null },
    { name: '.envファイル作成', func: setupEnvFile },
    { name: 'Claude Desktop設定更新', func: null },
    { name: 'package.json更新', func: null },
    { name: 'サーバー起動テスト', func: null }
  ];

  let currentStep = 0;
  const totalSteps = steps.length;

  try {
    // OS検出
    showProgress(++currentStep, totalSteps, 'システム環境を確認中');
    const osType = detectOS();
    log(`OS: ${osType} を検出しました`, 'success');

    // Node.jsパス検出
    showProgress(++currentStep, totalSteps, 'Node.jsを検出中');
    const { nodePath, npmPath } = await detectNodePath();
    log(`Node.js: ${nodePath}`, 'success');
    log(`npm: ${npmPath}`, 'success');

    // Node.jsバージョン確認
    showProgress(++currentStep, totalSteps, 'Node.jsバージョンを確認中');
    const isValidVersion = await checkNodeVersion(nodePath);
    if (!isValidVersion) {
      throw new Error('Node.js v18.0.0以上が必要です');
    }

    // 正規表現エラー修正
    showProgress(++currentStep, totalSteps, '既知のエラーを修正中');
    await fixRegexErrors();

    // 依存関係インストール
    showProgress(++currentStep, totalSteps, '依存関係をインストール中');
    await installDependencies(npmPath);

    // .envファイル作成
    showProgress(++currentStep, totalSteps, '環境設定ファイルを作成中');
    await setupEnvFile();

    // Claude Desktop設定更新
    showProgress(++currentStep, totalSteps, 'Claude Desktop設定を更新中');
    const configPath = await updateClaudeDesktopConfig(nodePath);

    // package.json更新
    showProgress(++currentStep, totalSteps, 'package.jsonを更新中');
    await updatePackageJsonScripts(nodePath, npmPath);

    // サーバー起動テスト
    showProgress(++currentStep, totalSteps, 'サーバー起動をテスト中');
    const serverTestResult = await testServerStartup(nodePath);

    // 完了メッセージ
    console.log(`\n${colors.green}${colors.bright}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              🎉 インストール完了！ 🎉                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

    // OAuth設定ガイド表示
    await showOAuthGuide();

    // インタラクティブOAuth設定の提案
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.yellow}今すぐOAuth認証を設定しますか？ (y/n): ${colors.reset}`, async (answer) => {
      if (answer.toLowerCase() === 'y') {
        const oauthResult = await interactiveOAuthSetup();
        if (oauthResult) {
          console.log(`\n${colors.green}OAuth認証設定が完了しました！${colors.reset}`);
          console.log(`\n次のコマンドでリフレッシュトークンを取得してください：`);
          if (osType === 'windows') {
            console.log(`${colors.cyan}npm run oauth-setup-win${colors.reset}`);
          } else {
            console.log(`${colors.cyan}npm run oauth-setup${colors.reset}`);
          }
        }
      }
      
      // 最終手順
      console.log(`\n${colors.bright}📌 最終ステップ:${colors.reset}`);
      console.log(`1. Claude Desktopを完全に終了`);
      console.log(`2. Claude Desktopを再起動`);
      console.log(`3. 設定 → 開発者 → 「ローカルMCPサーバーを有効化」をオン`);
      console.log(`4. Claude内で以下のコマンドを実行して接続確認:`);
      console.log(`   ${colors.cyan}claude-appsscript-pro:test_connection${colors.reset}`);
      
      console.log(`\n${colors.green}準備完了！Claude-AppsScript-Proをお楽しみください！${colors.reset}`);
      
      rl.close();
      process.exit(0);
    });

  } catch (error) {
    console.log('');
    log(`インストールエラー: ${error.message}`, 'error');
    console.log(`\n${colors.yellow}手動セットアップが必要です。README.mdを参照してください。${colors.reset}`);
    process.exit(1);
  }
}

// 実行
main().catch((error) => {
  console.error(`${colors.red}予期しないエラー: ${error.message}${colors.reset}`);
  process.exit(1);
});
