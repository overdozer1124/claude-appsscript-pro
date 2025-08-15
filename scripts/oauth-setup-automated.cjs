#!/usr/bin/env node
/**
 * 自動化版 OAuth セットアップスクリプト
 * 環境変数・設定ファイル・対話入力の3段階フォールバック方式
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

// 一般的なプリセット設定（よく使われる設定例）
const PRESET_CONFIGS = {
  'common': {
    description: '一般的な個人用設定',
    client_id_hint: '926988822269-*.apps.googleusercontent.com',
    note: 'Google Cloud Console で作成したクライアントIDを入力'
  },
  'enterprise': {
    description: '企業用設定',
    client_id_hint: 'xxxxxxxxx-*.apps.googleusercontent.com',
    note: '企業のGoogle Workspace管理者から提供されたクライアントID'
  }
};

console.log('🚀 Claude-AppsScript-Pro 自動化OAuth設定');
console.log('=======================================');
console.log('');

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

function closeReadlineInterface() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

// 設定の自動検出
async function detectConfiguration() {
  console.log('🔍 設定の自動検出中...');
  
  const configSources = [];
  
  // 1. 環境変数から検出
  const envClientId = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
  const envClientSecret = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
  
  if (envClientId && envClientSecret) {
    configSources.push({
      source: '環境変数',
      clientId: envClientId,
      clientSecret: envClientSecret,
      confidence: 'HIGH'
    });
  }
  
  // 2. 設定ファイルから検出
  const configPath = path.join(__dirname, '..', 'oauth-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.client_id && config.client_secret) {
        configSources.push({
          source: '設定ファイル',
          clientId: config.client_id,
          clientSecret: config.client_secret,
          confidence: 'MEDIUM'
        });
      }
    } catch (e) {
      console.log('⚠️  設定ファイルの読み込みエラー:', e.message);
    }
  }
  
  // 3. .envファイルから検出
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=');
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    if (envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID && envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET) {
      configSources.push({
        source: '.env ファイル',
        clientId: envVars.GOOGLE_APP_SCRIPT_API_CLIENT_ID,
        clientSecret: envVars.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET,
        confidence: 'MEDIUM'
      });
    }
  }
  
  return configSources;
}

// 設定ウィザード
async function setupWizard() {
  console.log('🎯 設定ウィザードを開始します');
  console.log('');
  
  // プリセット選択
  console.log('📋 設定のタイプを選択してください:');
  console.log('');
  Object.entries(PRESET_CONFIGS).forEach(([key, config], index) => {
    console.log(`  ${index + 1}. ${config.description}`);
    console.log(`     ヒント: ${config.client_id_hint}`);
    console.log(`     ${config.note}`);
    console.log('');
  });
  console.log('  0. カスタム設定（手動入力）');
  console.log('');
  
  const choice = await inputText('選択してください (0-2): ');
  const presetKeys = Object.keys(PRESET_CONFIGS);
  
  if (choice === '0') {
    return await manualSetup();
  } else if (choice >= '1' && choice <= presetKeys.length.toString()) {
    const selectedPreset = presetKeys[parseInt(choice) - 1];
    return await presetSetup(selectedPreset);
  } else {
    console.log('❌ 無効な選択です。カスタム設定で続行します。');
    return await manualSetup();
  }
}

// プリセット設定
async function presetSetup(presetKey) {
  const preset = PRESET_CONFIGS[presetKey];
  console.log(`\n📋 ${preset.description} を設定します`);
  console.log('');
  
  console.log('🔗 Google Cloud Console での設定手順:');
  console.log('1. https://console.cloud.google.com/apis/credentials にアクセス');
  console.log('2. 「認証情報を作成」→「OAuth 2.0 クライアント ID」');
  console.log('3. アプリケーションの種類: 「ウェブ アプリケーション」');
  console.log('4. 承認済みリダイレクト URI: http://localhost:3001/oauth/callback');
  console.log('');
  
  let clientId, clientSecret;
  
  // クライアントID入力
  while (true) {
    clientId = await inputText(`🔑 クライアント ID を入力してください (例: ${preset.client_id_hint}): `);
    if (validateClientId(clientId)) {
      console.log('✅ クライアント ID 形式確認');
      break;
    } else {
      console.log('❌ 無効なクライアント ID です。.apps.googleusercontent.com で終わる形式を入力してください。');
    }
  }
  
  // クライアントシークレット入力
  while (true) {
    clientSecret = await inputSecret('🔒 クライアント シークレット を入力してください（入力は非表示）: ');
    if (validateClientSecret(clientSecret)) {
      console.log('✅ クライアント シークレット 形式確認');
      break;
    } else {
      console.log('❌ 無効なクライアント シークレット です。20文字以上の英数字を入力してください。');
    }
  }
  
  return { clientId, clientSecret };
}

// 手動設定
async function manualSetup() {
  console.log('\n🔧 カスタム設定モード');
  console.log('');
  
  let clientId, clientSecret;
  
  while (true) {
    clientId = await inputText('🔑 クライアント ID を入力してください: ');
    if (validateClientId(clientId)) {
      console.log('✅ クライアント ID 形式確認');
      break;
    } else {
      console.log('❌ 無効なクライアント ID です。');
    }
  }
  
  while (true) {
    clientSecret = await inputSecret('🔒 クライアント シークレット を入力してください: ');
    if (validateClientSecret(clientSecret)) {
      console.log('✅ クライアント シークレット 形式確認');
      break;
    } else {
      console.log('❌ 無効なクライアント シークレット です。');
    }
  }
  
  return { clientId, clientSecret };
}

// パスワード入力（非表示）
function inputSecret(prompt) {
  return new Promise((resolve) => {
    const rlInterface = createReadlineInterface();
    
    const originalWrite = rlInterface._writeToOutput;
    rlInterface._writeToOutput = function _writeToOutput(stringToWrite) {
      if (stringToWrite.charCodeAt(0) === 13) {
        rlInterface.output.write('\n');
      }
    };
    
    rlInterface.question(prompt, (answer) => {
      rlInterface._writeToOutput = originalWrite;
      resolve(answer.trim());
    });
  });
}

// 通常入力
function inputText(prompt) {
  return new Promise((resolve) => {
    const rlInterface = createReadlineInterface();
    rlInterface.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 検証関数
function validateClientId(clientId) {
  return clientId && clientId.includes('.apps.googleusercontent.com');
}

function validateClientSecret(secret) {
  return secret && secret.length >= 20;
}

// OAuth認証フロー
async function performOAuthFlow(clientId, clientSecret) {
  console.log('\n🔗 OAuth認証を開始します...');
  
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = 'http://localhost:3001/oauth/callback';
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('scope', SCOPES.join(' '));
  authUrl.searchParams.append('access_type', 'offline');
  authUrl.searchParams.append('prompt', 'consent');
  authUrl.searchParams.append('state', state);
  
  console.log('=====================================');
  console.log(authUrl.toString());
  console.log('=====================================');
  console.log('');
  
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      if (url.pathname === '/oauth/callback') {
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        
        if (error) {
          res.end(`<h1>❌ 認証エラー</h1><p>エラー: ${error}</p>`);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }
        
        if (returnedState !== state) {
          res.end('<h1>❌ セキュリティエラー</h1><p>状態パラメータが一致しません</p>');
          server.close();
          reject(new Error('State parameter mismatch'));
          return;
        }
        
        if (code) {
          res.end('<h1>✅ 認証成功</h1><p>この画面を閉じて、ターミナルに戻ってください。</p>');
          server.close();
          console.log('✅ 認証コード取得成功');
          
          // トークン交換
          exchangeCodeForTokens(code, clientId, clientSecret, redirectUri)
            .then(resolve)
            .catch(reject);
        } else {
          res.end('<h1>❌ 認証失敗</h1><p>認証コードが取得できませんでした</p>');
          server.close();
          reject(new Error('No authorization code received'));
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
    
    server.listen(3001, () => {
      console.log('📡 コールバックサーバー起動: http://localhost:3001');
      console.log('🔗 ブラウザを起動中...');
      console.log('');
      
      // ブラウザを開く
      const command = process.platform === 'win32' ? 'start ""' :
                     process.platform === 'darwin' ? 'open' : 'xdg-open';
      
      exec(`${command} "${authUrl.toString()}"`, (error) => {
        if (error) {
          console.log('手動でブラウザを開いて上記URLにアクセスしてください');
        } else {
          console.log('🌐 ブラウザを起動しました');
        }
      });
    });
    
    server.on('error', (err) => {
      reject(new Error(`Server error: ${err.message}`));
    });
  });
}

// トークン交換
async function exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
  console.log('🔄 トークン交換中...');
  
  const tokenParams = new URLSearchParams({
    code: code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });
  
  const tokenData = tokenParams.toString();
  
  return new Promise((resolve, reject) => {
    const req = https.request(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(tokenData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (response.error) {
            reject(new Error(`Token exchange error: ${response.error_description || response.error}`));
            return;
          }
          
          console.log('\n✅ トークン取得成功!');
          console.log('=====================================');
          console.log(`Access Token: ${response.access_token.substring(0, 20)}...`);
          console.log(`Refresh Token: ${response.refresh_token.substring(0, 20)}...`);
          console.log(`Expires In: ${response.expires_in} seconds`);
          console.log('=====================================');
          
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse token response: ${e.message}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Token request failed: ${err.message}`));
    });
    
    req.write(tokenData);
    req.end();
  });
}

// .envファイル更新
function updateEnvFile(clientId, clientSecret, refreshToken) {
  const envPath = path.join(__dirname, '..', '.env');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  const updates = {
    'GOOGLE_APP_SCRIPT_API_CLIENT_ID': clientId,
    'GOOGLE_APP_SCRIPT_API_CLIENT_SECRET': clientSecret,
    'GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN': refreshToken,
    'GOOGLE_APP_SCRIPT_API_REDIRECT_URI': 'http://localhost:3001/oauth/callback'
  };
  
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
  console.log('✅ .env ファイルにリフレッシュトークンを保存しました');
  console.log(`📝 リフレッシュトークン: ${refreshToken.substring(0, 20)}...`);
}

// メイン処理
async function main() {
  try {
    // 設定の自動検出
    const configSources = await detectConfiguration();
    
    let clientId, clientSecret;
    
    if (configSources.length > 0) {
      console.log('✅ 既存の設定を検出しました:');
      configSources.forEach((source, index) => {
        console.log(`  ${index + 1}. ${source.source} (信頼度: ${source.confidence})`);
        console.log(`     Client ID: ${source.clientId.substring(0, 20)}...`);
      });
      console.log('');
      
      const useExisting = await inputText('既存の設定を使用しますか？ (y/n): ');
      
      if (useExisting.toLowerCase() === 'y' || useExisting.toLowerCase() === 'yes') {
        const bestConfig = configSources[0]; // 最高信頼度を使用
        clientId = bestConfig.clientId;
        clientSecret = bestConfig.clientSecret;
        console.log(`✅ ${bestConfig.source} の設定を使用します`);
      } else {
        const result = await setupWizard();
        clientId = result.clientId;
        clientSecret = result.clientSecret;
      }
    } else {
      console.log('ℹ️  既存の設定が見つかりません。新規設定を開始します。');
      const result = await setupWizard();
      clientId = result.clientId;
      clientSecret = result.clientSecret;
    }
    
    // OAuth認証実行
    const tokens = await performOAuthFlow(clientId, clientSecret);
    
    // .envファイル更新
    updateEnvFile(clientId, clientSecret, tokens.refresh_token);
    
    console.log('\n🎉 OAuth設定が完了しました！');
    console.log('Claude-AppsScript-Proが使用可能になりました。');
    
  } catch (error) {
    console.error('\n❌ セットアップエラー:', error.message);
    console.log('\n🔧 手動設定が必要な場合は、以下のコマンドを実行してください:');
    console.log('node scripts/oauth-setup.cjs');
  } finally {
    closeReadlineInterface();
    process.exit(0);
  }
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('\n💥 予期しないエラー:', error.message);
  closeReadlineInterface();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n💥 未処理のPromise拒否:', reason);
  closeReadlineInterface();
  process.exit(1);
});

// Ctrl+C 処理
process.on('SIGINT', () => {
  console.log('\n\n🛑 セットアップを中断しました');
  closeReadlineInterface();
  process.exit(0);
});

// メイン実行
if (require.main === module) {
  main();
}

module.exports = { main };
