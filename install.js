#!/usr/bin/env node

/**
 * Claude-AppsScript-Pro Smart Installer
 * Cross-platform installation script with automatic error recovery
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SmartInstaller {
    constructor() {
        this.platform = os.platform();
        this.homeDir = os.homedir();
        this.projectDir = __dirname;
        this.errors = [];
        this.warnings = [];
    }

    log(message, type = 'info') {
        const prefix = {
            info: '✅',
            warn: '⚠️',
            error: '❌',
            success: '🎉'
        }[type] || 'ℹ️';
        console.log(`${prefix} ${message}`);
    }

    // Node.jsパス検出
    findNodePath() {
        const possiblePaths = [
            'C:\\Program Files\\nodejs\\node.exe',
            'C:\\Program Files (x86)\\nodejs\\node.exe',
            '/usr/local/bin/node',
            '/usr/bin/node',
            '/opt/homebrew/bin/node'
        ];

        // コマンドから検出
        try {
            const nodePath = execSync('where node', { encoding: 'utf8' }).trim().split('\n')[0];
            if (fs.existsSync(nodePath)) return nodePath;
        } catch {}

        try {
            const nodePath = execSync('which node', { encoding: 'utf8' }).trim();
            if (fs.existsSync(nodePath)) return nodePath;
        } catch {}

        // 既知のパスを確認
        for (const p of possiblePaths) {
            if (fs.existsSync(p)) return p;
        }

        return 'node'; // フォールバック
    }

    // Claude Desktop設定ファイルのパス取得
    getClaudeConfigPath() {
        const paths = {
            win32: path.join(this.homeDir, 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json'),
            darwin: path.join(this.homeDir, 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json'),
            linux: path.join(this.homeDir, '.config', 'Claude', 'claude_desktop_config.json')
        };
        return paths[this.platform] || paths.linux;
    }

    // 既知のエラー修正
    fixKnownIssues() {
        this.log('既知の問題を修正中...');

        // 1. 正規表現エスケープ問題の修正
        const executionToolsPath = path.join(this.projectDir, 'lib', 'handlers', 'execution-tools.js');
        if (fs.existsSync(executionToolsPath)) {
            try {
                let content = fs.readFileSync(executionToolsPath, 'utf8');
                // ダブルエスケープを修正
                content = content.replace(
                    /\/\*\*\[\\s\\S\]\*\?\*\\\/\\s\*\)\?function/g,
                    '(?:\\/\\*\\*[\\s\\S]*?\\*\\/\\s*)?function'
                );
                fs.writeFileSync(executionToolsPath, content);
                this.log('正規表現エスケープ問題を修正', 'success');
            } catch (error) {
                this.warnings.push(`正規表現修正スキップ: ${error.message}`);
            }
        }

        // 2. .envファイルの作成
        const envPath = path.join(this.projectDir, '.env');
        if (!fs.existsSync(envPath)) {
            const envExample = path.join(this.projectDir, '.env.example');
            if (fs.existsSync(envExample)) {
                fs.copyFileSync(envExample, envPath);
                this.log('.envファイルを作成', 'success');
            }
        }
    }

    // Claude Desktop設定を更新
    updateClaudeConfig() {
        this.log('Claude Desktop設定を更新中...');

        const configPath = this.getClaudeConfigPath();
        const configDir = path.dirname(configPath);

        // ディレクトリ作成
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        // 設定読み込み/作成
        let config = {};
        if (fs.existsSync(configPath)) {
            try {
                config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } catch {
                config = {};
            }
        }

        // MCP設定追加
        const nodePath = this.findNodePath();
        const serverPath = path.join(this.projectDir, 'server.js');

        config.mcpServers = config.mcpServers || {};
        config.mcpServers['claude-appsscript-pro'] = {
            command: nodePath,
            args: [serverPath],
            cwd: this.projectDir
        };

        // 保存
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        this.log('Claude Desktop設定を更新完了', 'success');
        this.log(`設定ファイル: ${configPath}`);
    }

    // OAuth設定ガイド表示
    showOAuthGuide() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 OAuth設定ガイド');
        console.log('='.repeat(60));
        console.log('\n1. Google Cloud Console にアクセス:');
        console.log('   https://console.cloud.google.com\n');
        console.log('2. 新規プロジェクトを作成\n');
        console.log('3. 以下のAPIを有効化:');
        console.log('   - Google Apps Script API');
        console.log('   - Google Drive API');
        console.log('   - Google Sheets API\n');
        console.log('4. OAuth 2.0 クライアントIDを作成:');
        console.log('   - タイプ: Webアプリケーション（重要！）');
        console.log('   - リダイレクトURI: http://localhost:3001/oauth/callback\n');
        console.log('5. CLIENT_IDとCLIENT_SECRETを.envファイルに設定\n');
        console.log('6. 以下のコマンドで認証を完了:');
        console.log('   npm run oauth-setup\n');
        console.log('='.repeat(60) + '\n');
    }

    // メイン実行
    async run() {
        console.log('\n🚀 Claude-AppsScript-Pro Smart Installer v3.0.1\n');

        // 1. Node.jsバージョン確認
        try {
            const version = process.version;
            this.log(`Node.js ${version} を検出`);
            const major = parseInt(version.slice(1).split('.')[0]);
            if (major < 18) {
                this.errors.push('Node.js 18.0.0以上が必要です');
            }
        } catch (error) {
            this.errors.push(`Node.jsバージョン確認失敗: ${error.message}`);
        }

        // 2. 既知の問題を修正
        this.fixKnownIssues();

        // 3. Claude Desktop設定更新
        try {
            this.updateClaudeConfig();
        } catch (error) {
            this.warnings.push(`Claude Desktop設定更新失敗: ${error.message}`);
            this.warnings.push('手動で設定ファイルを編集してください');
        }

        // 4. 構文チェック
        this.log('サーバー構文チェック中...');
        try {
            execSync(`"${this.findNodePath()}" --check server.js`, { 
                cwd: this.projectDir,
                stdio: 'pipe'
            });
            this.log('構文チェック完了', 'success');
        } catch (error) {
            this.warnings.push('構文チェックで警告がありますが、続行します');
        }

        // 5. OAuth設定ガイド表示
        this.showOAuthGuide();

        // 6. 結果表示
        if (this.errors.length > 0) {
            console.log('\n❌ エラー:');
            this.errors.forEach(e => console.log(`  - ${e}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  警告:');
            this.warnings.forEach(w => console.log(`  - ${w}`));
        }

        if (this.errors.length === 0) {
            console.log('\n' + '='.repeat(60));
            console.log('🎉 インストール成功！');
            console.log('='.repeat(60));
            console.log('\n次のステップ:');
            console.log('1. Claude Desktop を再起動');
            console.log('2. .envファイルにOAuth認証情報を設定');
            console.log('3. npm run oauth-setup でトークンを取得');
            console.log('4. Claude で "claude-appsscript-pro:test_connection" を実行\n');
        } else {
            console.log('\n⚠️  インストールは完了しましたが、エラーがあります。');
            console.log('上記のエラーを解決してから続行してください。\n');
        }
    }
}

// 実行
const installer = new SmartInstaller();
installer.run().catch(error => {
    console.error('❌ インストーラーエラー:', error);
    process.exit(1);
});
