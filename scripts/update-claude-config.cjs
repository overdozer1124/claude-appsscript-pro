const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Claude Desktop設定ファイル安全更新スクリプト
 * 既存のMCPサーバー設定を保持して claude-appsscript-pro のみを追加・更新
 */

function updateClaudeDesktopConfig() {
    try {
        // 設定ファイルパス
        const configDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude');
        const configPath = path.join(configDir, 'claude_desktop_config.json');
        
        // ディレクトリ作成
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
            console.log('📁 Claude設定ディレクトリを作成しました');
        }
        
        // Node.jsパス取得（堅牢版）
        const { execSync } = require('child_process');
        let nodePath;
        
        try {
            // まずPATHからnode.exeを検索
            nodePath = execSync('where node', { encoding: 'utf8' }).trim().split('\n')[0];
            console.log('✅ Node.js found in PATH:', nodePath);
        } catch (error) {
            console.log('🔍 Searching for Node.js in common locations...');
            
            // 一般的なインストール場所を順次確認
            const commonPaths = [
                'C:\\Program Files\\nodejs\\node.exe',
                'C:\\Program Files (x86)\\nodejs\\node.exe',
                path.join(process.env.LOCALAPPDATA, 'Programs', 'nodejs', 'node.exe')
            ];
            
            // nvm-windowsの場合の特別処理
            if (fs.existsSync(path.join(process.env.APPDATA, 'nvm'))) {
                const nvmDir = path.join(process.env.APPDATA, 'nvm');
                try {
                    const versions = fs.readdirSync(nvmDir).filter(dir => dir.startsWith('v'));
                    if (versions.length > 0) {
                        // 最新バージョンを使用
                        const latestVersion = versions.sort().pop();
                        commonPaths.push(path.join(nvmDir, latestVersion, 'node.exe'));
                    }
                } catch (nvmError) {
                    // nvm-windowsディレクトリが読み取れない場合は無視
                }
            }
            
            // 各パスを確認
            nodePath = null;
            for (const testPath of commonPaths) {
                if (fs.existsSync(testPath)) {
                    nodePath = testPath;
                    console.log('✅ Node.js found at:', testPath);
                    break;
                }
            }
            
            if (!nodePath) {
                // 最後の手段として標準パスを設定
                nodePath = 'C:\\Program Files\\nodejs\\node.exe';
                console.log('⚠️  Using default path (may not exist):', nodePath);
            }
        }
        
        // 現在のディレクトリ
        const currentDir = process.cwd();
        
        // 既存設定ファイル読み込み
        let config = {};
        if (fs.existsSync(configPath)) {
            try {
                const existingContent = fs.readFileSync(configPath, 'utf8');
                config = JSON.parse(existingContent);
                console.log('📄 既存の設定ファイルを読み込みました');
                
                // 既存のMCPサーバー数を表示
                if (config.mcpServers && Object.keys(config.mcpServers).length > 0) {
                    console.log('🔍 既存のMCPサーバー設定:');
                    Object.keys(config.mcpServers).forEach(serverName => {
                        console.log(`   - ${serverName}`);
                    });
                }
            } catch (parseError) {
                console.log('⚠️  既存設定ファイルの解析に失敗 - 新規作成します');
                console.log('   エラー:', parseError.message);
            }
        } else {
            console.log('📄 新規設定ファイルを作成します');
        }
        
        // mcpServers セクションを初期化（存在しない場合のみ）
        if (!config.mcpServers) {
            config.mcpServers = {};
        }
        
        // claude-appsscript-pro 設定を追加・更新
        config.mcpServers['claude-appsscript-pro'] = {
            command: nodePath,
            args: [path.join(currentDir, 'server.js')],
            cwd: currentDir
        };
        
        // 設定ファイルに書き込み
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        
        console.log('✅ Claude Desktop設定ファイルを安全に更新しました');
        console.log('📄 設定ファイル場所:', configPath);
        
        // 最終的なMCPサーバー一覧表示
        console.log('🔍 設定済みMCPサーバー:');
        Object.keys(config.mcpServers).forEach(serverName => {
            console.log(`   - ${serverName}`);
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Claude Desktop設定の更新に失敗しました:', error.message);
        return false;
    }
}

// スクリプト実行
if (require.main === module) {
    const success = updateClaudeDesktopConfig();
    process.exit(success ? 0 : 1);
}

module.exports = { updateClaudeDesktopConfig };
