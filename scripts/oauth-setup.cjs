const http = require('http');
const { URL } = require('url');
const { spawn } = require('child_process');
require('dotenv').config();

const PORT = 3001;
const CLIENT_ID = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;

// Check environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ .envファイルにCLIENT_IDとCLIENT_SECRETを設定してください');
    console.log('\n設定例:');
    console.log('GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here');
    console.log('GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here');
    process.exit(1);
}

console.log('✅ 環境変数確認完了');
console.log('CLIENT_ID:', CLIENT_ID.substring(0, 20) + '...');

// OAuth URL construction
const scopes = [
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/script.deployments', 
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
];

const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' +
    'response_type=code&' +
    'client_id=' + encodeURIComponent(CLIENT_ID) + '&' +
    'redirect_uri=' + encodeURIComponent('http://localhost:3001/oauth/callback') + '&' +
    'scope=' + encodeURIComponent(scopes.join(' ')) + '&' +
    'access_type=offline&' +
    'prompt=consent';

console.log('\n🚀 OAuth認証サーバー起動中...');
console.log('\n以下のURLをブラウザで開いてください:');
console.log('=====================================');
console.log(authUrl);
console.log('=====================================\n');

// Create HTTP server for OAuth callback
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost:' + PORT);
    
    if (url.pathname === '/oauth/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
            console.error('❌ OAuth認証エラー:', error);
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>認証エラー</h1><p>認証が拒否されました。</p>');
            return;
        }
        
        if (code) {
            console.log('✅ 認証コード取得成功!');
            
            // Use https module for Node.js compatibility
            try {
                const https = require('https');
                const querystring = require('querystring');
                
                const postData = querystring.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: 'http://localhost:3001/oauth/callback'
                });
                
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
                
                const tokenReq = https.request(options, (tokenRes) => {
                    let data = '';
                    
                    tokenRes.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    tokenRes.on('end', () => {
                        try {
                            const tokens = JSON.parse(data);
                            
                            if (tokens.error) {
                                throw new Error('Token exchange error: ' + (tokens.error_description || tokens.error));
                            }
                            
                            if (tokens.refresh_token) {
                                console.log('\n========================================');
                                console.log('✅ REFRESH TOKEN取得成功!');
                                console.log('========================================');
                                console.log('\n🔧 .envファイルを自動更新中...');
                                
                                // .envファイルの自動更新
                                try {
                                    const fs = require('fs');
                                    const path = require('path');
                                    
                                    const envPath = path.join(__dirname, '..', '.env');
                                    const refreshTokenLine = 'GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=' + tokens.refresh_token;
                                    
                                    // .envファイルを読み込み
                                    let envContent = '';
                                    if (fs.existsSync(envPath)) {
                                        envContent = fs.readFileSync(envPath, 'utf8');
                                        console.log('📄 既存の.envファイルを発見');
                                    } else {
                                        console.log('📄 新規.envファイルを作成');
                                    }
                                    
                                    // REFRESH_TOKENの行を更新または追加
                                    const lines = envContent.split('\n');
                                    let tokenLineExists = false;
                                    
                                    for (let i = 0; i < lines.length; i++) {
                                        if (lines[i].startsWith('GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=')) {
                                            lines[i] = refreshTokenLine;
                                            tokenLineExists = true;
                                            console.log('🔄 既存のREFRESH_TOKEN行を更新');
                                            break;
                                        }
                                    }
                                    
                                    if (!tokenLineExists) {
                                        lines.push(refreshTokenLine);
                                        console.log('➕ REFRESH_TOKEN行を追加');
                                    }
                                    
                                    // .envファイルに書き戻し
                                    fs.writeFileSync(envPath, lines.join('\n'));
                                    console.log('✅ .envファイルの更新完了!');
                                    console.log('📍 ファイルパス:', envPath);
                                    
                                } catch (fileError) {
                                    console.log('⚠️ .envファイルの自動更新に失敗しました:', fileError.message);
                                    console.log('📋 手動で以下の行を.envファイルに追加してください:');
                                    console.log('GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=' + tokens.refresh_token);
                                }
                                
                                console.log('\n========================================');
                                console.log('🎉 OAuth設定が完全に完了しました!');
                                console.log('========================================\n');
                                
                                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                                res.end('<html><head><title>認証成功</title></head><body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;"><h1 style="color: green;">✅ 認証成功!</h1><p>ターミナルでREFRESH_TOKENを確認してください。</p><p>このウィンドウは閉じて大丈夫です。</p></body></html>');
                                
                                setTimeout(() => {
                                    console.log('OAuth認証サーバーを終了します...');
                                    process.exit(0);
                                }, 5000);
                            } else {
                                throw new Error('Refresh token not received in response');
                            }
                        } catch (parseError) {
                            console.error('❌ レスポンス解析エラー:', parseError.message);
                            res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                            res.end('<h1>レスポンス解析エラー</h1><p>' + parseError.message + '</p>');
                        }
                    });
                });
                
                tokenReq.on('error', (error) => {
                    console.error('❌ トークン交換エラー:', error.message);
                    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end('<h1>トークン交換エラー</h1><p>' + error.message + '</p>');
                });
                
                tokenReq.write(postData);
                tokenReq.end();
                
            } catch (error) {
                console.error('❌ 処理エラー:', error.message);
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>処理エラー</h1><p>' + error.message + '</p>');
            }
        } else {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>エラー</h1><p>認証コードが見つかりません。</p>');
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Start server
server.listen(PORT, () => {
    console.log('📡 コールバックサーバー起動: http://localhost:' + PORT);
    console.log('\n上記のURLをブラウザで開いてGoogleアカウントでログインしてください。');
    
    // Windows-optimized browser launching
    console.log('🌐 ブラウザを自動起動中...');
    
    if (process.platform === 'win32') {
        try {
            const { exec } = require('child_process');
            exec(`powershell -command "Start-Process '${authUrl}'"`, (error) => {
                if (error) {
                    console.log('❌ PowerShellでの起動に失敗しました。上記のURLを手動でコピーしてください。');
                    console.log('エラー詳細:', error.message);
                } else {
                    console.log('✅ ブラウザが正常に起動しました（PowerShell経由）');
                }
            });
        } catch (error) {
            console.log('❌ ブラウザの自動起動に失敗しました。上記のURLを手動でコピーしてください。');
            console.log('エラー詳細:', error.message);
        }
    } else {
        // Non-Windows platforms
        try {
            const { spawn } = require('child_process');
            if (process.platform === 'darwin') {
                spawn('open', [authUrl], { stdio: 'ignore' });
                console.log('✅ ブラウザが正常に起動しました（macOS）');
            } else {
                spawn('xdg-open', [authUrl], { stdio: 'ignore' });
                console.log('✅ ブラウザが正常に起動しました（Linux）');
            }
        } catch (error) {
            console.log('❌ ブラウザの自動起動に失敗しました。上記のURLを手動でコピーしてください。');
        }
    }
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error('❌ ポート' + PORT + 'は既に使用されています。他のプロセスを終了してから再試行してください。');
    } else {
        console.error('❌ サーバーエラー:', error.message);
    }
    process.exit(1);
});
