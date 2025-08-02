#!/usr/bin/env node

/**
 * 🚀 Claude-AppsScript-Pro OAuth Setup Script
 * 
 * このスクリプトはGoogle OAuth 2.0認証のセットアップを自動化します。
 * リフレッシュトークンの取得プロセスを案内します。
 */

import readline from 'readline';
import { createServer } from 'http';
import { URL } from 'url';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OAuthSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.envPath = join(__dirname, '..', '.env');
    this.config = this.loadEnvConfig();
  }

  loadEnvConfig() {
    if (!existsSync(this.envPath)) {
      console.error('❌ .env file not found. Please copy .env.example to .env first.');
      process.exit(1);
    }

    const envContent = readFileSync(this.envPath, 'utf8');
    const config = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        config[match[1]] = match[2];
      }
    });

    return config;
  }

  async question(prompt) {
    return new Promise(resolve => {
      this.rl.question(prompt, resolve);
    });
  }

  generateAuthUrl(clientId, redirectUri) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: [
        'https://www.googleapis.com/auth/script.projects',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCodeForTokens(code, clientId, clientSecret, redirectUri) {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return await response.json();
  }

  updateEnvFile(refreshToken) {
    let envContent = readFileSync(this.envPath, 'utf8');
    
    // Update the refresh token line
    envContent = envContent.replace(
      /^GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=.*$/m,
      `GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${refreshToken}`
    );

    writeFileSync(this.envPath, envContent);
  }

  async startOAuthFlow() {
    console.log('\n🚀 Claude-AppsScript-Pro OAuth Setup');
    console.log('=====================================\n');

    // Check if required config is present
    const clientId = this.config.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
    const clientSecret = this.config.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
    const redirectUri = this.config.GOOGLE_APP_SCRIPT_API_REDIRECT_URI || 'http://localhost:3001/oauth/callback';

    if (!clientId || clientId === 'your_client_id_here') {
      console.error('❌ Please set GOOGLE_APP_SCRIPT_API_CLIENT_ID in .env file');
      process.exit(1);
    }

    if (!clientSecret || clientSecret === 'your_client_secret_here') {
      console.error('❌ Please set GOOGLE_APP_SCRIPT_API_CLIENT_SECRET in .env file');
      process.exit(1);
    }

    console.log('✅ OAuth credentials found in .env');
    console.log(`📋 Redirect URI: ${redirectUri}\n`);

    const authUrl = this.generateAuthUrl(clientId, redirectUri);
    
    console.log('📖 OAuth Setup Steps:');
    console.log('1. A browser will open with the Google OAuth consent screen');
    console.log('2. Sign in with your Google account');
    console.log('3. Grant permissions for Apps Script, Drive, and Sheets');
    console.log('4. You will be redirected to a callback URL');
    console.log('5. Copy the authorization code from the callback\n');

    const proceed = await this.question('Ready to start OAuth flow? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('❌ OAuth setup cancelled');
      process.exit(0);
    }

    // Start a simple HTTP server to capture the callback
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://${req.headers.host}`);
      
      if (url.pathname === '/oauth/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<h1>OAuth Error</h1><p>${error}</p>`);
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <h1>✅ Authorization Successful!</h1>
            <p>Authorization code received. You can close this window.</p>
            <p>Returning to terminal...</p>
          `);
          
          // Process the authorization code
          this.processAuthorizationCode(code, clientId, clientSecret, redirectUri)
            .then(() => {
              server.close();
            })
            .catch(err => {
              console.error('❌ Error processing authorization code:', err.message);
              server.close();
              process.exit(1);
            });
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    });

    server.listen(3001, () => {
      console.log('🔗 OAuth callback server started on http://localhost:3001');
      console.log('\n🌐 Opening browser for OAuth consent...');
      console.log(`\nIf browser doesn't open automatically, visit this URL:\n${authUrl}\n`);
      
      // Try to open browser (works on most systems)
      import('open').then(open => {
        open.default(authUrl);
      }).catch(() => {
        console.log('⚠️  Could not auto-open browser. Please visit the URL above manually.');
      });
    });

    // Handle server shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 OAuth setup interrupted');
      server.close();
      process.exit(0);
    });
  }

  async processAuthorizationCode(code, clientId, clientSecret, redirectUri) {
    try {
      console.log('\n⏳ Exchanging authorization code for tokens...');
      
      const tokens = await this.exchangeCodeForTokens(code, clientId, clientSecret, redirectUri);
      
      if (!tokens.refresh_token) {
        throw new Error('No refresh token received. Please ensure you\'re granting consent for the first time.');
      }

      console.log('✅ Tokens received successfully!');
      console.log('📝 Updating .env file...');
      
      this.updateEnvFile(tokens.refresh_token);
      
      console.log('\n🎉 OAuth setup completed successfully!');
      console.log('📋 Summary:');
      console.log(`   ✅ Refresh token saved to .env`);
      console.log(`   ✅ Access token: ${tokens.access_token ? 'Received' : 'Not received'}`);
      console.log(`   ✅ Token type: ${tokens.token_type || 'Bearer'}`);
      console.log(`   ✅ Expires in: ${tokens.expires_in ? tokens.expires_in + ' seconds' : 'Unknown'}`);
      
      console.log('\n🚀 You can now start the MCP server with: node server.js');
      
    } catch (error) {
      console.error('❌ Error during token exchange:', error.message);
      throw error;
    } finally {
      this.rl.close();
    }
  }
}

// Main execution
async function main() {
  try {
    const oauthSetup = new OAuthSetup();
    await oauthSetup.startOAuthFlow();
  } catch (error) {
    console.error('❌ OAuth setup failed:', error.message);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default OAuthSetup;