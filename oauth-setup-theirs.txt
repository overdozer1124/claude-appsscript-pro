#!/usr/bin/env node
/**
 * Google OAuth セットアップスクリプト - 対話的設定版
 * ターミナルでクライアントID/シークレットを入力可能
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

// 定数
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const SCOPES = [
  'https://www.googleapis.com/auth/script.projects',
  'https://www.googleapis.com/auth/script.deployments',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

console.log('🚀 Claude-AppsScript-Pro OAuth設定 (対話版)');
console.log('==========================================');
console.log('');

// 対話的入力のためのreadlineインターフェース
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// パスワード入力用（非表示）
function inputSecret(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
    
    // カーソルを非表示にして入力を隠す
    rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (stringToWrite.charCodeAt(0) === 13) { // carriage return
        rl.output.write('\n');
      }
    };
  });
}

// 通常の入力
function inputText(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// クライアントID/シークレットの検証
function validateClientId(clientId) {
  return clientId && clientId.includes('.apps.googleusercontent.com');
}

function validateClientSecret(secret) {
  return secret && secret.length >= 20;
}

// .envファイルの処理
function readEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    // .envファイルが存在しない場合は作成
    console.log('📄 .envファイルを新規作成します...');
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
      newContent += `\n${key}=${value}\n`;
    }
  });
  
  fs.writeFileSync(envPath, newContent);
}

// ブラウザを開く関数
function openUrl(url) {
  const command = process.platform === 'win32' ? 'start ""' :
                 process.platform === 'darwin' ? 'open' : 'xdg-open';
  
  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.log('\n手動でブラウザを開いて以下のURLにアクセスしてください:');
      console.log(url);
    } else {
      console.log('🌐 ブラウザを起動しました');
    }
  });
}

// メイン処理
async function main() {
  try {
    // .envファイル読み込み
    const { envPath, envContent, envVars } = readEnvFile();
    console.log(`📄 .envファイル: ${envPath}\n`);
    
    let CLIENT_ID = envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
    let CLIENT_SECRET = envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
    const REDIRECT_URI = envVars.GOOGLE_APP_SCRIPT_API_REDIRECT_URI || 'http://localhost:3001/oauth/callback';
    
    // 既存の認証情報確認
    console.log('🔑 現在の認証情報:');
    console.log(`   Client ID: ${CLIENT_ID || '未設定'}`);
    console.log(`   Client Secret: ${CLIENT_SECRET ? '設定済み' : '未設定'}`);
    console.log(`   Redirect URI: ${REDIRECT_URI}\n`);
    
    // クライアントIDの入力・確認
    if (!CLIENT_ID || !validateClientId(CLIENT_ID)) {
      console.log('📋 Google Cloud Console で OAuth クライアント ID を作成してください:');
      console.log('   1. https://console.cloud.google.com/apis/credentials');
      console.log('   2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」');
      console.log('   3. アプリケーションの種類: 「ウェブ アプリケーション」');
      console.log('   4. 承認済みリダイレクト URI: http://localhost:3001/oauth/callback');
      console.log('');
      
      while (true) {
        CLIENT_ID = await inputText('🔑 クライアント ID を入力してください: ');
        if (validateClientId(CLIENT_ID)) {
          console.log('✅ クライアント ID 形式確認');
          break;
        } else {
          console.log('❌ 無効なクライアント ID です。.apps.googleusercontent.com で終わる形式を入力してください。');
        }
      }
    }
    
    // クライアントシークレットの入力・確認
    if (!CLIENT_SECRET || !validateClientSecret(CLIENT_SECRET)) {
      while (true) {
        console.log('🔒 クライアント シークレット を入力してください（入力は非表示になります）:');
        CLIENT_SECRET = await inputSecret('');
        console.log(''); // 改行
        
        if (validateClientSecret(CLIENT_SECRET)) {
          console.log('✅ クライアント シークレット 形式確認');
          break;
        } else {
          console.log('❌ 無効なクライアント シークレットです。20文字以上の文字列を入力してください。');
        }
      }
    }
    
    // .envファイルに保存
    updateEnvFile(envPath, envContent, {
      'GOOGLE_APP_SCRIPT_API_CLIENT_ID': CLIENT_ID,
      'GOOGLE_APP_SCRIPT_API_CLIENT_SECRET': CLIENT_SECRET,
      'GOOGLE_APP_SCRIPT_API_REDIRECT_URI': REDIRECT_URI
    });
    
    console.log('✅ 認証情報を .env ファイルに保存しました\n');
    
    // readlineインターフェースを閉じる
    rl.close();
    
    // 認証URL生成
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('scope', SCOPES.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    console.log('🔗 OAuth認証を開始します...');
    console.log('=====================================');
    console.log(authUrl.toString());
    console.log('=====================================\n');

    // HTTPサーバー起動
    const redirectURL = new URL(REDIRECT_URI);
    const PORT = parseInt(redirectURL.port) || 3001;

    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      
      if (url.pathname !== redirectURL.pathname) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      const error = url.searchParams.get('error');
      if (error) {
        console.error(`❌ 認証エラー: ${error}`);
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>認証に失敗しました</h3>');
        server.close();
        process.exit(1);
      }

      const returnedState = url.searchParams.get('state');
      if (returnedState !== state) {
        console.error('❌ State不一致エラー');
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>セキュリティエラー</h3>');
        server.close();
        process.exit(1);
      }

      const code = url.searchParams.get('code');
      if (!code) {
        console.error('❌ 認証コードが見つかりません');
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>認証コードエラー</h3>');
        server.close();
        process.exit(1);
      }

      console.log('✅ 認証コード取得成功');
      console.log('🔄 トークン交換中...');

      // トークン交換
      try {
        const postData = new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        });

        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData.toString()),
          },
        };

        const tokenResponse = await new Promise((resolve, reject) => {
          const req = https.request(TOKEN_ENDPOINT, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
          });
          req.on('error', reject);
          req.write(postData.toString());
          req.end();
        });

        if (tokenResponse.status !== 200) {
          throw new Error(`HTTP ${tokenResponse.status}: ${tokenResponse.data}`);
        }

        const tokens = JSON.parse(tokenResponse.data);
        
        if (tokens.error) {
          throw new Error(`Token Error: ${tokens.error_description || tokens.error}`);
        }

        console.log('\n✅ トークン取得成功!');
        console.log('=====================================');
        console.log(`Access Token: ${tokens.access_token.slice(0, 20)}...`);
        console.log(`Refresh Token: ${tokens.refresh_token ? tokens.refresh_token.slice(0, 20) + '...' : 'なし'}`);
        console.log(`Expires In: ${tokens.expires_in} seconds`);
        console.log('=====================================\n');

        if (tokens.refresh_token) {
          // .envファイルを自動更新
          const { envContent: currentEnvContent } = readEnvFile();
          updateEnvFile(envPath, currentEnvContent, {
            'GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN': tokens.refresh_token
          });
          
          console.log('✅ .env ファイルにリフレッシュトークンを保存しました');
          console.log(`📝 リフレッシュトークン: ${tokens.refresh_token.slice(0, 20)}...`);
        } else {
          console.log('⚠️ リフレッシュトークンが取得できませんでした（再認証が必要な場合があります）');
        }

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>✅ 認証成功！このウィンドウを閉じてください。</h3>');

        setTimeout(() => {
          console.log('\n🎉 OAuth設定が完了しました！');
          console.log('Claude-AppsScript-Proが使用可能になりました。');
          server.close();
          process.exit(0);
        }, 1000);

      } catch (error) {
        console.error(`❌ トークン交換エラー: ${error.message}`);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h3>トークン交換エラー</h3>');
        server.close();
        process.exit(1);
      }
    });

    server.listen(PORT, () => {
      console.log(`📡 コールバックサーバー起動: http://localhost:${PORT}`);
      console.log('🔗 ブラウザを起動中...\n');
      
      // 少し待ってからブラウザを開く
      setTimeout(() => {
        openUrl(authUrl.toString());
      }, 1000);
    });

    // エラーハンドリング
    server.on('error', (error) => {
      console.error(`❌ サーバーエラー: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        console.error(`ポート ${PORT} が使用中です。他のプロセスを終了してください。`);
      }
      process.exit(1);
    });

    process.on('SIGINT', () => {
      console.log('\n👋 プロセス終了中...');
      server.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error(`❌ 設定エラー: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

// プロセス実行
main().catch(error => {
  console.error(`❌ 予期しないエラー: ${error.message}`);
  process.exit(1);
});