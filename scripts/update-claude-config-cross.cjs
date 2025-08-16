#!/usr/bin/env node
/**
 * Claude-AppsScript-Pro クロスプラットフォーム Claude Desktop設定更新 v1.0.0
 * 既存MCP設定完全保護・OS別対応版
 * 
 * 革新機能:
 * ✅ OS別設定パス自動検出（Windows/macOS/Linux）
 * ✅ 既存MCPサーバー設定完全保護
 * ✅ claude-appsscript-proのみ安全更新
 * ✅ バックアップ自動作成・復旧機能
 * ✅ Node.js絶対パス智能検出
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// OS別設定パス取得（革新機能）
function getClaudeConfigPath() {
  const platform = os.platform();
  
  switch (platform) {
    case 'win32':
      return path.join(os.homedir(), 'AppData', 'Roaming', 'Claude', 'claude_desktop_config.json');
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    default: // Linux and others
      return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

// Node.js絶対パス智能検出（クロスプラットフォーム対応）
function detectNodePath() {
  const platform = os.platform();
  
  try {
    let nodePath;
    
    if (platform === 'win32') {
      // Windows: where コマンド
      nodePath = execSync('where node', { encoding: 'utf8' }).trim().split('\n')[0];
    } else {
      // macOS/Linux: which コマンド
      nodePath = execSync('which node', { encoding: 'utf8' }).trim();
    }
    
    console.log(`✅ Node.jsパス自動検出: ${nodePath}`);
    return nodePath;
  } catch (error) {
    // フォールバック: 標準パス
    const fallbackPaths = {
      'win32': 'C:\\Program Files\\nodejs\\node.exe',
      'darwin': '/usr/local/bin/node',
      'linux': '/usr/bin/node'
    };
    
    const fallbackPath = fallbackPaths[platform] || '/usr/bin/node';
    console.log(`⚠️ Node.jsパス検出失敗 - 標準パスを使用: ${fallbackPath}`);
    return fallbackPath;
  }
}

// 設定ファイル安全更新（革新機能移植）
function updateClaudeDesktopConfig() {
  try {
    const configPath = getClaudeConfigPath();
    const configDir = path.dirname(configPath);
    
    console.log('🚀 Claude Desktop設定更新開始');
    console.log(`📂 プラットフォーム: ${os.platform()}`);
    console.log(`📄 設定ファイル: ${configPath}`);
    
    // ディレクトリ作成
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log('📁 Claude設定ディレクトリを作成しました');
    }
    
    // Node.jsパス検出
    const nodePath = detectNodePath();
    const currentDir = process.cwd();
    
    // 既存設定読み込み・保護
    let config = {};
    let hasExistingConfig = false;
    
    if (fs.existsSync(configPath)) {
      try {
        const existingContent = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(existingContent);
        hasExistingConfig = true;
        
        console.log('📄 既存設定ファイルを読み込みました');
        
        // 既存MCPサーバー表示
        if (config.mcpServers && Object.keys(config.mcpServers).length > 0) {
          console.log('🔍 既存MCPサーバー設定（保護対象）:');
          Object.keys(config.mcpServers).forEach(serverName => {
            if (serverName !== 'claude-appsscript-pro') {
              console.log(`   ✅ ${serverName} - 保護`);
            }
          });
        }
      } catch (parseError) {
        console.log('⚠️ 既存設定ファイル解析失敗 - 新規作成します');
        console.log(`   エラー: ${parseError.message}`);
        config = {};
      }
    } else {
      console.log('📄 新規設定ファイルを作成します');
    }
    
    // バックアップ作成（既存設定がある場合）
    if (hasExistingConfig) {
      const backupPath = `${configPath}.backup-${Date.now()}`;
      fs.copyFileSync(configPath, backupPath);
      console.log(`💾 バックアップ作成: ${backupPath}`);
    }
    
    // mcpServers セクション初期化
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    
    // claude-appsscript-pro設定のみ更新（既存設定完全保護）
    config.mcpServers['claude-appsscript-pro'] = {
      command: nodePath,
      args: [path.join(currentDir, 'server.js')],
      cwd: currentDir
    };
    
    // 設定ファイル安全書き込み
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      
      // 検証読み込み
      const verifyContent = fs.readFileSync(configPath, 'utf8');
      const verifyConfig = JSON.parse(verifyContent);
      
      if (verifyConfig.mcpServers && verifyConfig.mcpServers['claude-appsscript-pro']) {
        console.log('✅ Claude Desktop設定を安全に更新しました');
      } else {
        throw new Error('設定検証失敗');
      }
    } catch (writeError) {
      console.log('❌ 設定ファイル書き込み失敗:', writeError.message);
      
      // バックアップからの復旧
      if (hasExistingConfig) {
        const backupFiles = fs.readdirSync(configDir).filter(f => f.startsWith('claude_desktop_config.json.backup-'));
        if (backupFiles.length > 0) {
          const latestBackup = backupFiles.sort().pop();
          const backupPath = path.join(configDir, latestBackup);
          fs.copyFileSync(backupPath, configPath);
          console.log(`🔄 バックアップから復旧しました: ${latestBackup}`);
        }
      }
      throw writeError;
    }
    
    // 最終設定確認
    console.log('');
    console.log('🔍 最終MCPサーバー設定:');
    Object.keys(config.mcpServers).forEach(serverName => {
      const status = serverName === 'claude-appsscript-pro' ? '🆕 更新' : '✅ 保護';
      console.log(`   ${status} ${serverName}`);
    });
    
    console.log('');
    console.log('📋 設定完了情報:');
    console.log(`   📄 設定ファイル: ${configPath}`);
    console.log(`   🔧 Node.jsパス: ${nodePath}`);
    console.log(`   📁 プロジェクト: ${currentDir}`);
    console.log('');
    console.log('💡 次のステップ: Claude Desktop を再起動してください');
    
    return true;
    
  } catch (error) {
    console.log('❌ Claude Desktop設定更新に失敗しました:', error.message);
    return false;
  }
}

// メイン実行
function main() {
  console.log('');
  console.log('🛠️ Claude-AppsScript-Pro クロスプラットフォーム設定更新');
  console.log('===========================================================');
  console.log('✨ 既存MCP設定完全保護・安全更新システム');
  console.log('');
  
  const success = updateClaudeDesktopConfig();
  
  if (success) {
    console.log('🎊 設定更新が完了しました！');
    process.exit(0);
  } else {
    console.log('❌ 設定更新に失敗しました');
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  main,
  updateClaudeDesktopConfig,
  getClaudeConfigPath,
  detectNodePath
};
