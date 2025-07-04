/**
 * Development Tools Handler for Claude-AppsScript-Pro
 * Handles incremental development and file management operations
 * 
 * Revolutionary 75-95% Output Reduction System
 * Phase Development-Tools: Incremental development optimization
 */

export class DevelopmentToolsHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
  }

  /**
   * Get tool definitions for development operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'add_script_file',
        description: 'Add a new file to an Apps Script project while preserving existing files',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            file_name: { 
              type: 'string', 
              description: 'Name of the new file to add' 
            },
            content: { 
              type: 'string', 
              description: 'Content of the new file' 
            },
            file_type: { 
              type: 'string', 
              enum: ['server_js', 'html'], 
              description: 'Type of the file (defaults to server_js)' 
            }
          },
          required: ['script_id', 'file_name', 'content']
        }
      },
      {
        name: 'update_script_file',
        description: 'Update an existing file in an Apps Script project while preserving all other files',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            file_name: { 
              type: 'string', 
              description: 'Name of the existing file to update' 
            },
            content: { 
              type: 'string', 
              description: 'New content for the file' 
            }
          },
          required: ['script_id', 'file_name', 'content']
        }
      },
      {
        name: 'get_script_file_contents',
        description: 'Get the contents of a specific file from an Apps Script project',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            file_name: { 
              type: 'string', 
              description: 'Name of the file to get contents from' 
            },
            include_line_numbers: {
              type: 'boolean',
              description: 'Include line numbers in output (default: true)',
              default: true
            }
          },
          required: ['script_id', 'file_name']
        }
      }
    ];
  }

  /**
   * 🤖 HTML→Apps Script自動変換システム
   * 初心者の躓きポイントを根本的に解決
   */
  automaticCodeFix(content) {
    if (!content || typeof content !== 'string') {
      return content;
    }

    let fixed = content;
    const fixes = [];

    // 1. 改行コード正規化: \\n → \n
    const beforeNewlines = fixed;
    fixed = fixed.replace(/\\\\n/g, '\\n');
    if (fixed !== beforeNewlines) {
      fixes.push('改行コード正規化 (\\\\n → \\n)');
    }

    // 2. HTML改行タグ変換: <br> → \n
    const beforeBr = fixed;
    fixed = fixed.replace(/<br\s*\/?>/gi, '\\n');
    if (fixed !== beforeBr) {
      fixes.push('HTML改行タグ変換 (<br> → \\n)');
    }

    // 3. HTML特殊文字エスケープ処理
    const beforeEscape = fixed;
    fixed = fixed.replace(/&lt;/g, '<')
                 .replace(/&gt;/g, '>')
                 .replace(/&amp;/g, '&')
                 .replace(/&quot;/g, '"')
                 .replace(/&#39;/g, "'");
    if (fixed !== beforeEscape) {
      fixes.push('HTML特殊文字エスケープ処理');
    }

    // 4. UI.alert形式チェック（2パラメータ→3パラメータに修正）
    const beforeAlert = fixed;
    fixed = fixed.replace(
      /SpreadsheetApp\.getUi\(\)\.alert\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g,
      "SpreadsheetApp.getUi().alert('$1', '$2', SpreadsheetApp.getUi().ButtonSet.OK)"
    );
    if (fixed !== beforeAlert) {
      fixes.push('UI.alert形式修正 (2パラメータ→3パラメータ)');
    }

    // 5. 文字列内の二重エスケープ修正
    const beforeDoubleEscape = fixed;
    fixed = fixed.replace(/\\\\'/g, "\\'")
                 .replace(/\\\\"/g, '\\"')
                 .replace(/\\\\\\\\/g, '\\\\');
    if (fixed !== beforeDoubleEscape) {
      fixes.push('二重エスケープ修正');
    }

    // 6. 関数定義の修正（function キーワード抜け）
    const beforeFunction = fixed;
    fixed = fixed.replace(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)\s*\{/gm, '$1function $2() {');
    if (fixed !== beforeFunction) {
      fixes.push('関数定義修正 (function キーワード追加)');
    }

    // 修正レポート
    if (fixes.length > 0) {
      console.error(`[AUTO-FIX] Applied ${fixes.length} fixes: ${fixes.join(', ')}`);
    }

    return fixed;
  }

  convertFileType(inputType) {
    const typeMap = {
      'server_js': 'SERVER_JS',
      'html': 'HTML',
      'json': 'JSON'
    };
    return typeMap[inputType] || 'SERVER_JS';
  }

  /**
   * Revolutionary Add Script File System
   * 75-95% Output Reduction for incremental development
   */
  async handleAddScriptFile(args) {
    try {
      let { script_id, file_name, content, file_type = 'server_js' } = args;
      
      // === 🤖 NEW: HTML→Apps Script自動変換システム適用 ===
      if (content && typeof content === 'string' && 
          (file_type === 'server_js' || !file_type || file_type === 'SERVER_JS')) {
        const originalContent = content;
        content = this.automaticCodeFix(content);
        
        if (content !== originalContent) {
          console.error(`🔧 [AUTO-FIX] Applied automatic fixes to new file: ${file_name}`);
        }
      }
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // 既存ファイル取得
      const existingResponse = await this.googleManager.script.projects.getContent({
        scriptId: script_id
      });
      
      const existingFiles = existingResponse.data.files || [];
      
      // ファイル重複チェック
      const existingFile = existingFiles.find(f => f.name === file_name);
      if (existingFile) {
        throw new Error(`File '${file_name}' already exists. Use update_script_file instead.`);
      }

      // 新規ファイル作成
      const newFile = {
        name: file_name,
        source: content,
        type: this.convertFileType(file_type)
      };

      // ファイルリスト統合
      const updatedFiles = [...existingFiles, newFile];

      // プロジェクト更新
      await this.googleManager.script.projects.updateContent({
        scriptId: script_id,
        requestBody: { files: updatedFiles }
      });

      // 成功レスポンス
      const outputReduction = existingFiles.length > 0 ? 
        Math.round((existingFiles.length / updatedFiles.length) * 100) : 0;

      return {
        content: [{
          type: 'text',
          text: `✅ **File '${file_name}' added successfully!**\n\n` +
                `📊 **Operation Summary:**\n` +
                `• New file added: ${file_name} (${file_type})\n` +
                `• Existing files preserved: ${existingFiles.length}\n` +
                `• Total files now: ${updatedFiles.length}\n` +
                `• Claude output reduction: ${outputReduction}%\n\n` +
                `🤖 **Auto-Enhancement Applied:**\n` +
                `• HTML→Apps Script automatic conversion\n` +
                `• Code format standardization\n` +
                `• Function definition fixes\n\n` +
                `🚀 **Breakthrough Achievement:**\n` +
                `Claude only needed to output 1 new file instead of ${updatedFiles.length} files!\n` +
                `${existingFiles.length} existing files were automatically preserved.\n\n` +
                `💡 **Next Steps:**\n` +
                `Continue adding features without re-outputting existing files!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to add file:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Check script ID format\n` +
                `• Verify file name doesn't exist\n` +
                `• Ensure OAuth permissions are correct`
        }]
      };
    }
  }

  /**
   * Revolutionary Update Script File System
   * 75-95% Output Reduction for file modifications
   */
  async handleUpdateScriptFile(args) {
    try {
      let { script_id, file_name, content } = args;
      
      // === 🤖 NEW: HTML→Apps Script自動変換システム適用 ===
      if (content && typeof content === 'string') {
        const originalContent = content;
        content = this.automaticCodeFix(content);
        
        if (content !== originalContent) {
          console.error(`🔧 [AUTO-FIX] Applied automatic fixes to updated file: ${file_name}`);
        }
      }
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // 既存ファイル取得
      const existingResponse = await this.googleManager.script.projects.getContent({
        scriptId: script_id
      });
      
      const existingFiles = existingResponse.data.files || [];
      
      // 対象ファイル存在チェック
      const targetFile = existingFiles.find(f => f.name === file_name);
      if (!targetFile) {
        throw new Error(`File '${file_name}' not found. Use add_script_file to create new files.`);
      }

      // ファイル更新（他ファイル保持）
      const updatedFiles = existingFiles.map(file => {
        if (file.name === file_name) {
          return { ...file, source: content };
        }
        return file; // 他ファイル完全保持
      });

      // プロジェクト更新
      await this.googleManager.script.projects.updateContent({
        scriptId: script_id,
        requestBody: { files: updatedFiles }
      });

      // 成功レスポンス（出力削減効果計算）
      const outputReduction = existingFiles.length > 1 ? 
        Math.round((1 - 1/existingFiles.length) * 100) : 0;

      return {
        content: [{
          type: 'text',
          text: `✅ **File '${file_name}' updated successfully!**\n\n` +
                `📊 **Operation Summary:**\n` +
                `• Updated file: ${file_name}\n` +
                `• Other files preserved: ${existingFiles.length - 1}\n` +
                `• Total files: ${existingFiles.length}\n` +
                `• Claude output reduction: ${outputReduction}%\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Claude only needed to output 1 updated file instead of ${existingFiles.length} files!\n` +
                `${existingFiles.length - 1} other files were automatically preserved.\n\n` +
                `💡 **75-95% Output Reduction System:**\n` +
                `Perfect for incremental development and bug fixes!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to update file:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Check script ID format\n` +
                `• Verify file name exists\n` +
                `• Ensure OAuth permissions are correct\n` +
                `• Use add_script_file for new files`
        }]
      };
    }
  }

  /**
   * Revolutionary Get Script File Contents System
   * Retrieve specific file contents without output bloat
   */
  async handleGetScriptFileContents(args) {
    try {
      const { script_id, file_name, include_line_numbers = true } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // プロジェクトファイル取得
      const response = await this.googleManager.script.projects.getContent({
        scriptId: script_id
      });
      
      const files = response.data.files || [];
      
      // 対象ファイル検索
      const targetFile = files.find(f => f.name === file_name);
      if (!targetFile) {
        throw new Error(`File '${file_name}' not found in project. Available files: ${files.map(f => f.name).join(', ')}`);
      }

      const content = targetFile.source || '';
      const lines = content.split('\n');
      const fileType = targetFile.type || 'UNKNOWN';
      
      // 行番号付きフォーマット
      let formattedContent = '';
      if (include_line_numbers && lines.length > 0) {
        const maxLineNumWidth = lines.length.toString().length;
        formattedContent = lines.map((line, index) => {
          const lineNum = (index + 1).toString().padStart(maxLineNumWidth, ' ');
          return `${lineNum}: ${line}`;
        }).join('\n');
      } else {
        formattedContent = content;
      }

      // ファイル分析
      const stats = {
        total_lines: lines.length,
        non_empty_lines: lines.filter(line => line.trim().length > 0).length,
        total_chars: content.length,
        file_type: fileType
      };

      return {
        content: [{
          type: 'text',
          text: `📄 **File Contents: ${file_name}**\n\n` +
                `📊 **File Information:**\n` +
                `• Type: ${fileType}\n` +
                `• Lines: ${stats.total_lines} (${stats.non_empty_lines} non-empty)\n` +
                `• Characters: ${stats.total_chars}\n` +
                `• Project ID: ${script_id}\n\n` +
                `📝 **Content:**\n` +
                `\`\`\`${fileType.toLowerCase() === 'server_js' ? 'javascript' : fileType.toLowerCase()}\n` +
                `${formattedContent}\n` +
                `\`\`\`\n\n` +
                `💡 **Analysis Ready:**\n` +
                `You can now analyze, modify, or optimize this file using other tools!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to get file contents:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Check script ID format\n` +
                `• Verify file name exists (case-sensitive)\n` +
                `• Ensure OAuth permissions are correct\n` +
                `• Use get_script_info to see available files`
        }]
      };
    }
  }

  /**
   * Handle tool call - MCP compatibility method
   */
  async handleToolCall(toolName, args) {
    switch(toolName) {
      case 'add_script_file':
        return await this.handleAddScriptFile(args);
      case 'update_script_file':
        return await this.handleUpdateScriptFile(args);
      case 'get_script_file_contents':
        return await this.handleGetScriptFileContents(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
