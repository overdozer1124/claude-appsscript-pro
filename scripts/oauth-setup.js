#!/usr/bin/env node

/**
 * 🚀 Claude-AppsScript-Pro OAuth Setup Script
 * Automated Google OAuth 2.0 configuration for MCP server
 */

import fs from 'fs';
import path from 'path';
import { createServer } from 'http';
import { parse } from 'url';
import { spawn } from 'child_process';

const config = {
    redirectUri: 'http://localhost:3001/oauth/callback',
    scopes: [
        'https://www.googleapis.com/auth/script.projects',
        'https://www.googleapis.com/auth/script.deployments',
        'https://www.googleapis.com/auth/script.processes',
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets'
    ],
    port: 3001
};

console.log('🚀 Claude-AppsScript-Pro OAuth Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.resolve('.env');
let clientId = '';
let clientSecret = '';

if (fs.existsSync(envPath)) {
    console.log('✅ .env file found, reading existing configuration...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const clientIdMatch = envContent.match(/GOOGLE_APP_SCRIPT_API_CLIENT_ID=(.+)/);
    const clientSecretMatch = envContent.match(/GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=(.+)/);
    
    if (clientIdMatch) clientId = clientIdMatch[1].trim();
    if (clientSecretMatch) clientSecret = clientSecretMatch[1].trim();
    
    if (clientId && clientSecret) {
        console.log('✅ OAuth credentials found in .env file');
    } else {
        console.log('⚠️ OAuth credentials missing in .env file');
    }
} else {
    console.log('⚠️ .env file not found');
}

// If credentials are missing, prompt user
if (!clientId || !clientSecret) {
    console.log('\n📋 Please provide your Google OAuth credentials:');
    console.log('   1. Go to https://console.cloud.google.com/');
    console.log('   2. Create or select a project');
    console.log('   3. Enable APIs: Apps Script API, Drive API, Sheets API');
    console.log('   4. Create OAuth 2.0 credentials (Desktop Application)');
    console.log(`   5. Add redirect URI: ${config.redirectUri}`);
    console.log('\n❌ Setup cannot continue without OAuth credentials');
    console.log('   Please add them to your .env file and run this script again.\n');
    
    // Create sample .env file
    const sampleEnv = `# Claude-AppsScript-Pro Configuration
GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here
GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=will_be_generated_automatically
GOOGLE_APP_SCRIPT_API_REDIRECT_URI=${config.redirectUri}
LOG_LEVEL=error
`;
    
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, sampleEnv);
        console.log('✅ Sample .env file created. Please edit it with your credentials.');
    }
    
    process.exit(1);
}

console.log('\n🔐 Starting OAuth authorization flow...');

// Build authorization URL
const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
authUrl.searchParams.set('client_id', clientId);
authUrl.searchParams.set('redirect_uri', config.redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', config.scopes.join(' '));
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

console.log('🌐 Authorization URL generated');
console.log('   Opening browser automatically...\n');

// Create callback server
const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    
    if (parsedUrl.pathname === '/oauth/callback') {
        const { code, error } = parsedUrl.query;
        
        if (error) {
            console.log(`❌ OAuth error: ${error}`);
            res.writeHead(400);
            res.end(`OAuth Error: ${error}`);
            server.close();
            process.exit(1);
        }
        
        if (code) {
            console.log('✅ Authorization code received');
            console.log('🔄 Exchanging for refresh token...');
            
            try {
                // Exchange code for tokens
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: config.redirectUri,
                    }),
                });
                
                const tokens = await tokenResponse.json();
                
                if (tokens.error) {
                    throw new Error(`Token exchange failed: ${tokens.error_description || tokens.error}`);
                }
                
                console.log('✅ Tokens received successfully');
                
                // Update .env file
                let envContent = fs.readFileSync(envPath, 'utf8');
                
                if (envContent.includes('GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=')) {
                    envContent = envContent.replace(
                        /GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=.*/,
                        `GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${tokens.refresh_token}`
                    );
                } else {
                    envContent += `\nGOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=${tokens.refresh_token}`;
                }
                
                fs.writeFileSync(envPath, envContent);
                
                console.log('✅ .env file updated with refresh token');
                console.log('\n🎉 OAuth setup completed successfully!');
                console.log('\n📋 Next steps:');
                console.log('   1. Add to Claude Desktop configuration');
                console.log('   2. Restart Claude Desktop');
                console.log('   3. Test connection: claude-appsscript-pro:test_connection');
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>OAuth Setup Complete</title></head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1 style="color: green;">✅ OAuth Setup Complete!</h1>
                            <p>You can now close this browser window.</p>
                            <p>Return to your terminal to continue setup.</p>
                        </body>
                    </html>
                `);
                
                server.close();
                
            } catch (error) {
                console.log(`❌ Token exchange failed: ${error.message}`);
                res.writeHead(500);
                res.end(`Token exchange failed: ${error.message}`);
                server.close();
                process.exit(1);
            }
        }
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(config.port, () => {
    console.log(`📡 Callback server running on port ${config.port}`);
    
    // Try to open browser automatically
    const authUrlString = authUrl.toString();
    console.log(`🔗 If browser doesn't open automatically, visit:`);
    console.log(`   ${authUrlString}\n`);
    
    // Auto-open browser
    let cmd;
    switch (process.platform) {
        case 'darwin':
            cmd = 'open';
            break;
        case 'win32':
            cmd = 'start';
            break;
        default:
            cmd = 'xdg-open';
    }
    
    try {
        if (process.platform === 'win32') {
            spawn('cmd', ['/c', 'start', authUrlString], { detached: true, stdio: 'ignore' });
        } else {
            spawn(cmd, [authUrlString], { detached: true, stdio: 'ignore' });
        }
        console.log('🌐 Browser opened automatically');
    } catch (error) {
        console.log('⚠️ Could not open browser automatically');
        console.log('   Please copy and paste the URL above into your browser');
    }
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`❌ Port ${config.port} is already in use`);
        console.log('   Please close any running applications on this port and try again');
    } else {
        console.log(`❌ Server error: ${error.message}`);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n❌ OAuth setup cancelled by user');
    server.close();
    process.exit(0);
});

console.log('⏳ Waiting for OAuth authorization...');
console.log('   Complete the authorization in your browser');
