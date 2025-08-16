#!/usr/bin/env node
/**
 * Claude-AppsScript-Pro クロスプラットフォーム OAuth設定スクリプト v1.0.0
 * Windows版革新機能の完全移植版 - 全OS対応
 * 
 * 革新機能:
 * ✅ WebアプリOAuth設定（JSONアップロード）
 * ✅ OAuth重複実行防止アルゴリズム
 * ✅ OS別ブラウザ自動起動
 * ✅ .env自動更新・検証
 * ✅ エラー自動復旧機能
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL, URLSearchParams } = require('url');
const crypto = require('crypto');
const { exec } = require('child_process');
const readline = require('readline');
const os = require('os');

// 定数
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

// 🌐 クロスプラットフォーム対応
const PLATFORM = os.platform();
const isWindows = PLATFORM === 'win32';
const isMacOS = PLATFORM === 'darwin';
const isLinux = PLATFORM !== 'win32' && PLATFORM !== 'darwin';

// 🚀 革命的機能: Web版/ターミナル版の自動判定
const isWebMode = process.argv.includes('--web') || process.argv.includes('-w');

// Webサーバー用グローバル変数
let webServer = null;
let uploadedOAuthConfig = null;

// ログ機能
function log(level, message, ...args) {
  const timestamp = new Date().toISOString();
  const levelEmoji = {
    info: '📄',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    web: '🌐'
  };
  console.log(`[${timestamp}] ${levelEmoji[level] || '📄'} ${message}`, ...args);
}

// OS別初期化メッセージ
function showPlatformWelcome() {
  const platformEmoji = {
    win32: '🪟',
    darwin: '🍎', 
    linux: '🐧'
  };
  
  console.log('');
  console.log('🚀 Claude-AppsScript-Pro クロスプラットフォーム OAuth設定');
  console.log('============================================================');
  console.log(`${platformEmoji[PLATFORM] || '💻'} プラットフォーム: ${getOSName()}`);
  console.log(`${isWebMode ? '🌐 Webモード' : '💻 ターミナルモード'}: ${isWebMode ? 'JSONアップロード対応' : '対話式設定'}`);
  console.log('✨ Windows版革新機能の完全移植版');
  console.log('');
}

function getOSName() {
  switch (PLATFORM) {
    case 'win32': return 'Windows';
    case 'darwin': return 'macOS';
    case 'linux': return 'Linux';
    default: return `${PLATFORM} (Unix-like)`;
  }
}

// 共通のreadlineインターフェース
let rl = null;

function createReadlineInterface() {
  if (!rl) {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  return rl;
}

// OAuth重複実行防止アルゴリズム（革新機能移植）
function checkExistingOAuthConfig() {
  log('info', '🔍 OAuth重複実行防止チェック開始...');
  
  const { envVars } = readEnvFile();
  
  const hasClientId = envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID && 
                     envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID.trim() !== '';
  const hasClientSecret = envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET && 
                         envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET.trim() !== '';
  const hasRefreshToken = envVars.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN && 
                         envVars.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN.trim() !== '';
  
  if (hasClientId && hasClientSecret && hasRefreshToken) {
    log('success', '✅ 既存のOAuth設定が完了済みです');
    log('info', '📋 設定内容:');
    log('info', `   Client ID: ${envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID.substring(0, 20)}...`);
    log('info', `   Client Secret: ${'*'.repeat(20)}`);
    log('info', `   Refresh Token: ${envVars.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN.substring(0, 20)}...`);
    
    return true;
  }
  
  if (hasClientId || hasClientSecret) {
    log('warning', '⚠️ OAuth設定が部分的に存在します - 続行して完成させます');
  }
  
  return false;
}

// クライアントID/シークレット検証
function validateClientId(clientId) {
  return clientId && clientId.includes('.googleusercontent.com');
}

function validateClientSecret(secret) {
  return secret && secret.length >= 20;
}

// .envファイルの処理（クロスプラットフォーム対応）
function readEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    log('info', '📄 .envファイルを新規作成します...');
    fs.writeFileSync(envPath, `# Claude-AppsScript-Pro 環境変数設定
# Google Apps Script API 設定
GOOGLE_APP_SCRIPT_API_CLIENT_ID=
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=
GOOGLE_APP_SCRIPT_API_REDIRECT_URI=http://localhost:3001/oauth/callback
GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=

# オプション設定
LOG_LEVEL=info
SCRIPT_API_TIMEOUT_MS=30000
MAX_CONCURRENT_REQUESTS=5
DEBUG_MODE=false
VERBOSE_LOGGING=false
`);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // 手動で環境変数をパース
  const envVars = {};
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return { envPath, envContent, envVars };
}

function updateEnvFile(envPath, envContent, updates) {
  let newContent = envContent;
  
  Object.entries(updates).forEach(([key, value]) => {
    const regex = new RegExp(`${key}=.*$`, 'm');
    if (newContent.match(regex)) {
      newContent = newContent.replace(regex, `${key}=${value}`);
    } else {
      newContent += `\n${key}=${value}`;
    }
  });
  
  fs.writeFileSync(envPath, newContent, 'utf8');
  log('success', '✅ .envファイルを更新しました');
}

// OS別ブラウザ起動（革新機能移植）
function openBrowser(url) {
  log('info', `🌐 ブラウザを起動します: ${url}`);
  
  let command;
  switch (PLATFORM) {
    case 'win32':
      command = `start ${url}`;
      break;
    case 'darwin':
      command = `open "${url}"`;
      break;
    default: // Linux and others
      command = `xdg-open "${url}" || x-www-browser "${url}" || firefox "${url}" || google-chrome "${url}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      log('warning', `⚠️ ブラウザ自動起動に失敗: ${error.message}`);
      log('info', `📋 手動でブラウザを開いてアクセスしてください: ${url}`);
    } else {
      log('success', '✅ ブラウザを起動しました');
    }
  });
}

// JSONアップロード対応Webサーバー（革新機能移植）
function createOAuthWebServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:3001`);
      
      if (req.method === 'GET' && url.pathname === '/') {
        // JSONアップロード画面
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>Claude-AppsScript-Pro OAuth設定 - ${getOSName()}</title>
    <meta charset="utf-8">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto, sans-serif;
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { 
            background: rgba(255,255,255,0.1); 
            padding: 30px; 
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .upload-area { 
            border: 2px dashed rgba(255,255,255,0.5); 
            padding: 40px; 
            text-align: center; 
            border-radius: 10px;
            margin: 20px 0;
            background: rgba(255,255,255,0.05);
            transition: all 0.3s ease;
        }
        .upload-area:hover {
            border-color: rgba(255,255,255,0.8);
            background: rgba(255,255,255,0.1);
        }
        .success { color: #4ade80; font-weight: bold; }
        .error { color: #f87171; font-weight: bold; }
        .platform-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 20px;
        }
        input[type="file"] {
            margin: 10px 0;
            padding: 10px;
            border: none;
            border-radius: 5px;
            background: rgba(255,255,255,0.2);
            color: white;
            width: 100%;
        }
        input[type="file"]::file-selector-button {
            background: rgba(255,255,255,0.3);
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            color: white;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="platform-badge">${getOSName()} 🚀 クロスプラットフォーム版</div>
        <h1>🚀 Claude-AppsScript-Pro OAuth設定</h1>
        <p>Google Cloud Consoleから取得したOAuth認証情報で設定を行います</p>
        
        <div class="upload-area">
            <h3>📁 方法1: OAuthクライアント設定JSONアップロード（推奨）</h3>
            <input type="file" id="oauth-file" accept=".json" />
            <p>Google Cloud Consoleからダウンロードした認証情報JSONファイルを選択</p>
            <div id="upload-result"></div>
        </div>
        
        <div class="upload-area">
            <h3>⌨️ 方法2: 手動入力</h3>
            <p>Client ID:</p>
            <input type="text" id="client-id" placeholder="xxxxxxxxx.googleusercontent.com" 
                   style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; width: 100%; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <p>Client Secret:</p>
            <input type="text" id="client-secret" placeholder="GOCSPX-xxxxxxxxx" 
                   style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; width: 100%; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <button onclick="submitManual()" 
                    style="background: #4ade80; border: none; padding: 12px 24px; border-radius: 5px; color: white; font-weight: bold; cursor: pointer; width: 100%;">
                手動設定で続行
            </button>
            <div id="manual-result"></div>
        </div>
    </div>
    
    <script>
        document.getElementById('oauth-file').addEventListener('change', uploadOAuthFile);
        
        function uploadOAuthFile(event) {
            const file = event.target.files[0];
            const resultDiv = document.getElementById('upload-result');
            
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const oauthData = JSON.parse(e.target.result);
                    
                    let clientId, clientSecret;
                    
                    // 複数の形式に対応
                    if (oauthData.web) {
                        clientId = oauthData.web.client_id;
                        clientSecret = oauthData.web.client_secret;
                    } else if (oauthData.installed) {
                        clientId = oauthData.installed.client_id;
                        clientSecret = oauthData.installed.client_secret;
                    } else {
                        clientId = oauthData.client_id;
                        clientSecret = oauthData.client_secret;
                    }
                    
                    if (!clientId || !clientSecret) {
                        throw new Error('JSONファイルにclient_idまたはclient_secretが見つかりません');
                    }
                    
                    // サーバーに送信
                    fetch('/upload-oauth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            resultDiv.innerHTML = '<div class="success">✅ JSONアップロード成功！OAuth認証を開始します...</div>';
                            setTimeout(() => {
                                window.location.href = data.auth_url;
                            }, 2000);
                        } else {
                            resultDiv.innerHTML = '<div class="error">❌ アップロード失敗: ' + data.error + '</div>';
                        }
                    })
                    .catch(error => {
                        resultDiv.innerHTML = '<div class="error">❌ 通信エラー: ' + error.message + '</div>';
                    });
                } catch (error) {
                    resultDiv.innerHTML = '<div class="error">❌ JSONファイル解析エラー: ' + error.message + '</div>';
                }
            };
            reader.readAsText(file);
        }
        
        function submitManual() {
            const clientId = document.getElementById('client-id').value.trim();
            const clientSecret = document.getElementById('client-secret').value.trim();
            const resultDiv = document.getElementById('manual-result');
            
            if (!clientId || !clientSecret) {
                resultDiv.innerHTML = '<div class="error">❌ Client IDとClient Secretの両方を入力してください</div>';
                return;
            }
            
            if (!clientId.includes('.googleusercontent.com')) {
                resultDiv.innerHTML = '<div class="error">❌ Client IDの形式が正しくありません</div>';
                return;
            }
            
            fetch('/upload-oauth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ client_id: clientId, client_secret: clientSecret })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    resultDiv.innerHTML = '<div class="success">✅ 手動設定成功！OAuth認証を開始します...</div>';
                    setTimeout(() => {
                        window.location.href = data.auth_url;
                    }, 2000);
                } else {
                    resultDiv.innerHTML = '<div class="error">❌ 設定失敗: ' + data.error + '</div>';
                }
            })
            .catch(error => {
                resultDiv.innerHTML = '<div class="error">❌ 通信エラー: ' + error.message + '</div>';
            });
        }
    </script>
</body>
</html>
        `);
      } else if (req.method === 'POST' && url.pathname === '/upload-oauth') {
        // JSONアップロード処理
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { client_id, client_secret } = JSON.parse(body);
            
            if (!validateClientId(client_id)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Client IDの形式が正しくありません' }));
              return;
            }
            
            if (!validateClientSecret(client_secret)) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Client Secretの形式が正しくありません' }));
              return;
            }
            
            // アップロード成功 - グローバル変数に保存
            uploadedOAuthConfig = { client_id, client_secret };
            
            // OAuth認証URL生成
            const authUrl = generateAuthUrl(client_id);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, auth_url: authUrl }));
            
            log('success', '✅ OAuth設定アップロード成功');
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
          }
        });
      } else if (req.method === 'GET' && url.pathname === '/oauth/callback') {
        // OAuth認証コールバック処理
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(\`
            <h2>❌ OAuth認証エラー</h2>
            <p>エラー: \${error}</p>
            <p>ブラウザを閉じて、ターミナルで再試行してください。</p>
          \`);
          return;
        }
        
        if (!code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h2>❌ 認証コードが取得できませんでした</h2>');
          return;
        }
        
        // 認証コードでトークン取得
        exchangeCodeForToken(code, uploadedOAuthConfig)
          .then(refreshToken => {
            log('success', '✅ Refresh Token取得成功！');
            
            // .envファイル更新
            const { envPath, envContent } = readEnvFile();
            updateEnvFile(envPath, envContent, {
              'GOOGLE_APP_SCRIPT_API_CLIENT_ID': uploadedOAuthConfig.client_id,
              'GOOGLE_APP_SCRIPT_API_CLIENT_SECRET': uploadedOAuthConfig.client_secret,
              'GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN': refreshToken
            });
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(\`
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', roboto; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 15px;">
                <h2>🎊 OAuth設定完了！</h2>
                <p>✅ Refresh Tokenの取得に成功しました</p>
                <p>🚀 Claude-AppsScript-Pro v3.0.1 がご利用いただけます</p>
                <p>💡 このブラウザを閉じて、Claude Desktopを再起動してください</p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>プラットフォーム:</strong> \${getOSName()}</p>
                  <p><strong>設定状況:</strong> 完了</p>
                  <p><strong>次のステップ:</strong> Claude Desktop再起動</p>
                </div>
              </div>
            \`);
            
            // サーバー終了
            setTimeout(() => {
              webServer.close();
              webServer = null;
              resolve(refreshToken);
            }, 3000);
          })
          .catch(error => {
            log('error', '❌ Token取得エラー:', error.message);
            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(\`<h2>❌ Token取得エラー</h2><p>\${error.message}</p>\`);
          });
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
    
    server.listen(3001, () => {
      log('success', '✅ OAuthサーバーが起動しました: http://localhost:3001');
      webServer = server;
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        log('error', '❌ ポート3001が使用中です。他のプロセスを終了してから再試行してください。');
      }
      reject(error);
    });
  });
}

// OAuth認証URL生成
function generateAuthUrl(clientId) {
  const state = crypto.randomBytes(16).toString('hex');
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', 'http://localhost:3001/oauth/callback');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', SCOPES.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);
  
  return authUrl.toString();
}

// 認証コードをトークンに交換
function exchangeCodeForToken(code, oauthConfig) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      code: code,
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret,
      redirect_uri: 'http://localhost:3001/oauth/callback',
      grant_type: 'authorization_code'
    });
    
    const options = {
      hostname: 'oauth2.googleapis.com',
      port: 443,
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData.toString())
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.refresh_token) {
            resolve(response.refresh_token);
          } else if (response.error) {
            reject(new Error(`OAuth Error: ${response.error_description || response.error}`));
          } else {
            reject(new Error('Refresh tokenが取得できませんでした'));
          }
        } catch (error) {
          reject(new Error(`レスポンス解析エラー: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`HTTPリクエストエラー: ${error.message}`));
    });
    
    req.write(postData.toString());
    req.end();
  });
}

// ターミナル版OAuth設定（対話式）
async function terminalOAuthSetup() {
  const rl = createReadlineInterface();
  
  try {
    log('info', '💻 ターミナル版OAuth設定を開始します');
    
    // Client ID入力
    const clientId = await new Promise((resolve) => {
      rl.question('🔑 Google OAuth Client ID を入力してください: ', resolve);
    });
    
    if (!validateClientId(clientId)) {
      log('error', '❌ Client IDの形式が正しくありません (.googleusercontent.com が含まれていません)');
      return false;
    }
    
    // Client Secret入力
    const clientSecret = await new Promise((resolve) => {
      rl.question('🔒 Google OAuth Client Secret を入力してください: ', resolve);
    });
    
    if (!validateClientSecret(clientSecret)) {
      log('error', '❌ Client Secretの形式が正しくありません (20文字未満です)');
      return false;
    }
    
    log('success', '✅ OAuth認証情報を確認しました');
    
    // .envファイル更新
    const { envPath, envContent } = readEnvFile();
    updateEnvFile(envPath, envContent, {
      'GOOGLE_APP_SCRIPT_API_CLIENT_ID': clientId,
      'GOOGLE_APP_SCRIPT_API_CLIENT_SECRET': clientSecret
    });
    
    // 認証URL生成・表示
    const authUrl = generateAuthUrl(clientId);
    
    console.log('');
    log('info', '🌐 以下のURLをブラウザで開いて認証を完了してください:');
    console.log('');
    console.log(authUrl);
    console.log('');
    
    // OS別ブラウザ起動
    openBrowser(authUrl);
    
    // 認証コード入力
    const authCode = await new Promise((resolve) => {
      rl.question('📝 認証完了後に表示される認証コードを入力してください: ', resolve);
    });
    
    if (!authCode || authCode.trim() === '') {
      log('error', '❌ 認証コードが入力されていません');
      return false;
    }
    
    // トークン取得
    log('info', '🔄 Refresh Token を取得中...');
    const refreshToken = await exchangeCodeForToken(authCode.trim(), { client_id: clientId, client_secret: clientSecret });
    
    // .envファイル更新
    updateEnvFile(envPath, envContent, {
      'GOOGLE_APP_SCRIPT_API_CLIENT_ID': clientId,
      'GOOGLE_APP_SCRIPT_API_CLIENT_SECRET': clientSecret,
      'GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN': refreshToken
    });
    
    log('success', '🎊 OAuth設定が完了しました！');
    return true;
    
  } catch (error) {
    log('error', '❌ OAuth設定中にエラーが発生しました:', error.message);
    return false;
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

// メイン実行関数
async function main() {
  try {
    showPlatformWelcome();
    
    // OAuth重複実行防止チェック
    if (checkExistingOAuthConfig()) {
      const rl = createReadlineInterface();
      
      const answer = await new Promise((resolve) => {
        rl.question('🤔 OAuth設定は既に完了しています。再設定しますか？ (y/N): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log('info', '✅ OAuth設定をスキップしました');
        return;
      }
      
      log('info', '🔄 OAuth設定を再実行します...');
    }
    
    let success = false;
    
    if (isWebMode) {
      // Web版OAuth設定
      log('web', '🌐 Webモード: JSONアップロード対応OAuth設定を開始します');
      log('info', '📋 ブラウザでOAuth設定ページが開きます...');
      
      try {
        await createOAuthWebServer();
        openBrowser('http://localhost:3001');
        success = true;
      } catch (error) {
        log('error', '❌ Webサーバー起動エラー:', error.message);
        log('info', '💻 ターミナルモードにフォールバックします...');
        success = await terminalOAuthSetup();
      }
    } else {
      // ターミナル版OAuth設定
      success = await terminalOAuthSetup();
    }
    
    if (success) {
      console.log('');
      log('success', '🎊 Claude-AppsScript-Pro OAuth設定完了！');
      console.log('');
      log('info', '📋 次のステップ:');
      log('info', '   1. Claude Desktop を再起動してください');
      log('info', '   2. Claude内で claude-appsscript-pro:test_connection を実行');
      log('info', '   3. 接続確認後、AI自律開発をお楽しみください！');
      console.log('');
    } else {
      log('error', '❌ OAuth設定に失敗しました');
      process.exit(1);
    }
    
  } catch (error) {
    log('error', '❌ 予期しないエラーが発生しました:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkExistingOAuthConfig,
  createOAuthWebServer,
  terminalOAuthSetup,
  openBrowser,
  getOSName
};
