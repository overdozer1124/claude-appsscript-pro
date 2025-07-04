/**
 * 🎯 Template Tools Handler - Template Creation System
 * Claude-AppsScript-Pro のテンプレートシステム
 * 
 * 機能:
 * - handleCreateFromTemplate: テンプレートからシステム生成（スプレッドシート+Apps Script）
 * - createDefaultAppsScriptManifest: デフォルトマニフェスト生成
 * - convertFileType: ファイルタイプ変換
 */

import { TEMPLATES } from '../templates/app-templates.js';

export class TemplateToolsHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
  }

  /**
   * このハンドラーが処理できるツール名のリストを返す
   */
  getToolDefinitions() {
    return [
      {
        name: 'create_from_template',
        description: 'Create complete Apps Script system from predefined templates',
        inputSchema: {
          type: 'object',
          properties: {
            template: {
              type: 'string',
              enum: Object.keys(TEMPLATES),
              description: `Template to use: ${Object.keys(TEMPLATES).join(', ')}`
            },
            system_name: {
              type: 'string',
              description: 'Name for the system (auto-generated if not provided)'
            },
            customization: {
              type: 'object',
              properties: {
                menu_title: { 
                  type: 'string',
                  description: 'Custom menu title (default: template-specific)'
                }
              },
              additionalProperties: true,
              description: 'Template customization options'
            }
          },
          required: ['template']
        }
      }
    ];
  }

  /**
   * ツール名に基づいて処理可能かチェック
   */
  canHandle(toolName) {
    return ['create_from_template'].includes(toolName);
  }

  /**
   * ツール実行のメインルーター
   */
  async handle(toolName, args) {
    switch (toolName) {
      case 'create_from_template':
        return await this.handleCreateFromTemplate(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // Alias method for compatibility with server.js
  async handleToolCall(tool, args) {
    return await this.handle(tool, args);
  }

  /**
   * テンプレートからApps Scriptシステムを作成
   * 革命的テンプレートシステム - ワンコマンドで完全システム構築
   */
  async handleCreateFromTemplate(args) {
    try {
      const { template, system_name, customization = {} } = args;
      
      // テンプレート存在チェック
      if (!TEMPLATES[template]) {
        throw new Error(`Template '${template}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`);
      }
      
      const selectedTemplate = TEMPLATES[template];
      
      // システム名自動生成（未指定時）
      const finalSystemName = system_name || `${template.charAt(0).toUpperCase() + template.slice(1)} Project ${Date.now()}`;
      
      // カスタマイゼーション適用
      let templateFiles = [...selectedTemplate.files];
      
      // メニュータイトルカスタマイゼーション
      if (customization.menu_title) {
        templateFiles = templateFiles.map(file => ({
          ...file,
          content: file.content.replace(/createMenu\(['"`].*?['"`]\)/, `createMenu('${customization.menu_title}')`)
        }));
      }
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // appsscript.json自動追加
      const finalFiles = [this.createDefaultAppsScriptManifest(), ...templateFiles];

      // Step 1: スプレッドシート作成
      const spreadsheetTitle = `${finalSystemName} - Data`;
      const spreadsheetResponse = await this.googleManager.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: spreadsheetTitle
          }
        }
      });
      
      const spreadsheetId = spreadsheetResponse.data.spreadsheetId;

      // Step 2: Apps Script プロジェクト作成
      const scriptResponse = await this.googleManager.script.projects.create({
        requestBody: {
          title: `${finalSystemName} - Script`,
          parentId: spreadsheetId
        }
      });
      
      const scriptId = scriptResponse.data.scriptId;

      // Step 3: テンプレートファイル作成
      const files = finalFiles.map(file => ({
        name: file.name,
        source: file.content,
        type: this.convertFileType(file.type || 'server_js')
      }));

      // Step 4: プロジェクト更新（ファイル追加）
      await this.googleManager.script.projects.updateContent({
        scriptId: scriptId,
        requestBody: { files: files }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **${template.toUpperCase()} Template System Created Successfully!**\\n\\n` +
                `🎯 **Template Details:**\\n` +
                `• Template: ${template} - ${selectedTemplate.description}\\n` +
                `• System Name: ${finalSystemName}\\n` +
                `• Files Created: ${finalFiles.length}\\n\\n` +
                `📊 **System Components:**\\n` +
                `• Spreadsheet: ${spreadsheetTitle}\\n` +
                `• Script Project: ${finalSystemName} - Script\\n\\n` +
                `🆔 **Access Information:**\\n` +
                `• Spreadsheet ID: ${spreadsheetId}\\n` +
                `• Script ID: ${scriptId}\\n\\n` +
                `📁 **Template Files:**\\n` +
                finalFiles.map(f => `• ${f.name} (${f.type || 'server_js'})`).join('\\n') +
                `\\n\\n🔗 **Quick Access:**\\n` +
                `• [Open Spreadsheet](https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit)\\n` +
                `• [Open Script Editor](https://script.google.com/d/${scriptId}/edit)\\n\\n` +
                `🚀 **Ready-to-Use Features:**\\n` +
                selectedTemplate.files.map(f => `• ${f.name} with complete functionality`).join('\\n') +
                `\\n\\n💡 **Next Steps:**\\n` +
                `1. Open the spreadsheet and check the "${customization.menu_title || '🚀 My App'}" menu\\n` +
                `2. Customize the template code in the Script Editor\\n` +
                `3. Use Claude-AppsScript-Pro for incremental development\\n\\n` +
                `🎉 **Template System Achievement:**\\n` +
                `From template selection to working system in one command!\\n` +
                `Perfect for rapid prototyping and learning!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Template creation failed:** ${error.message}\\n\\n` +
                `📚 **Available Templates:**\\n` +
                Object.entries(TEMPLATES).map(([name, tmpl]) => 
                  `• **${name}**: ${tmpl.description}`
                ).join('\\n') +
                `\\n\\n🚀 **Try Again With:**\\n` +
                `\`\`\`javascript\\n` +
                `claude-appsscript-pro:create_from_template({\\n` +
                `  template: "basic",\\n` +
                `  system_name: "My App"\\n` +
                `})\\n\`\`\`\\n\\n` +
                `💡 **Template Benefits:**\\n` +
                `• Pre-built functionality\\n` +
                `• Best practices included\\n` +
                `• Ready for customization\\n` +
                `• Perfect for learning Apps Script`
        }]
      };
    }
  }

  /**
   * デフォルトのApps Scriptマニフェストファイル作成
   */
  createDefaultAppsScriptManifest() {
    return {
      name: "appsscript",
      type: "json",
      content: JSON.stringify({
        "timeZone": "Asia/Tokyo",
        "dependencies": {},
        "exceptionLogging": "STACKDRIVER",
        "runtimeVersion": "V8"
      }, null, 2)
    };
  }

  /**
   * ファイルタイプをApps Script形式に変換
   */
  convertFileType(type) {
    const typeMap = {
      'server_js': 'SERVER_JS',
      'html': 'HTML',
      'json': 'JSON'
    };
    
    return typeMap[type.toLowerCase()] || 'SERVER_JS';
  }
}
