/**
 * OAuth認証コードをリフレッシュトークンに交換
 */

import https from 'https';
import querystring from 'querystring';
import dotenv from 'dotenv';

// 環境変数読み込み
dotenv.config();

// 環境変数から認証情報を取得（セキュリティ強化）
const CLIENT_ID = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
const AUTHORIZATION_CODE = process.env.GOOGLE_AUTHORIZATION_CODE || process.argv[2];
const REDIRECT_URI = process.env.GOOGLE_APP_SCRIPT_API_REDIRECT_URI || 'http://localhost:3001/oauth/callback';

// 必須環境変数のチェック
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ 必須環境変数が設定されていません:');
  console.error('GOOGLE_APP_SCRIPT_API_CLIENT_ID');
  console.error('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET');
  console.error('');
  console.error('📋 .env ファイルを確認するか、以下のように実行してください:');
  console.error('node token-exchange.js [AUTHORIZATION_CODE]');
  process.exit(1);
}

if (!AUTHORIZATION_CODE) {
  console.error('❌ 認証コードが指定されていません');
  console.error('使用方法: node token-exchange.js [AUTHORIZATION_CODE]');
  console.error('または GOOGLE_AUTHORIZATION_CODE 環境変数を設定してください');
  process.exit(1);
}

// リクエストデータ
const postData = querystring.stringify({
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
  code: AUTHORIZATION_CODE,
  grant_type: 'authorization_code',
  redirect_uri: REDIRECT_URI
});

// HTTPSリクエスト設定
const options = {
  hostname: 'oauth2.googleapis.com',
  port: 443,
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔄 認証コードをリフレッシュトークンに交換中...');

// HTTPSリクエスト実行
const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.error) {
        console.error('❌ エラー:', response.error);
        console.error('詳細:', response.error_description);
      } else {
        console.log('✅ トークン交換成功！');
        console.log('');
        console.log('🔑 リフレッシュトークン:');
        console.log(response.refresh_token);
        console.log('');
        console.log('⏰ アクセストークン（一時的）:');
        console.log(response.access_token);
        console.log('');
        console.log('📋 付与されたスコープ:');
        console.log(response.scope);
        console.log('');
        console.log('🔧 .env ファイルを以下で更新してください:');
        console.log(`GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${response.refresh_token}`);
      }
    } catch (error) {
      console.error('❌ レスポンス解析エラー:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ リクエストエラー:', error.message);
});

// リクエスト送信
req.write(postData);
req.end();
