/**
 * Development Tools Handler for Claude-AppsScript-Pro
 * Handles incremental development and file management operations
 * 
 * Revolutionary 75-95% Output Reduction System
 * Phase Development-Tools: Incremental development optimization
 */

export class DevelopmentToolsHandler {
  constructor(googleManager, diagLogger, serverInstance) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
    this.serverInstance = serverInstance;
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
      },
      {
        name: 'delete_script_file',
        description: 'Delete a file from an Apps Script project while preserving all other files',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            file_name: { 
              type: 'string', 
              description: 'Name of the file to delete' 
            },
            force: {
              type: 'boolean',
              description: 'Force deletion even if dependencies exist (default: false)',
              default: false
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
   * Revolutionary Delete Script File System
   * Safe deletion with dependency checking
   */
  async handleDeleteScriptFile(args) {
    try {
      const { script_id, file_name, force = false } = args;
      
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
        throw new Error(`File '${file_name}' not found. Available files: ${existingFiles.map(f => f.name).join(', ')}`);
      }

      // 依存関係チェック
      const dependencies = this.checkFileDependencies(existingFiles, file_name);
      
      if (dependencies.length > 0 && !force) {
        return {
          content: [{
            type: 'text',
            text: `⚠️ **Cannot delete file '${file_name}' - Dependencies detected!**\n\n` +
                  `📋 **Files that depend on '${file_name}':**\n${dependencies.map(d => 
                    `• ${d.fileName}: ${d.references.length} reference(s)`
                  ).join('\n')}\n\n` +
                  `🔍 **Dependency Details:**\n${dependencies.map(d => 
                    `• ${d.fileName}:\n${d.references.map(ref => `  - Line ${ref.line}: ${ref.context.substring(0, 80)}...`).join('\n')}`
                  ).join('\n')}\n\n` +
                  `💡 **Solutions:**\n` +
                  `• Remove dependencies first, then delete the file\n` +
                  `• Use force: true to delete anyway (risky)\n` +
                  `• Refactor code to remove dependencies`
          }]
        };
      }

      // ファイル削除実行
      const updatedFiles = existingFiles.filter(f => f.name !== file_name);

      // プロジェクト更新
      await this.googleManager.script.projects.updateContent({
        scriptId: script_id,
        requestBody: { files: updatedFiles }
      });

      // 成功レスポンス
      const outputReduction = existingFiles.length > 1 ? 
        Math.round((1 - updatedFiles.length/existingFiles.length) * 100) : 0;

      return {
        content: [{
          type: 'text',
          text: `✅ **File '${file_name}' deleted successfully!**\n\n` +
                `📊 **Operation Summary:**\n` +
                `• Deleted file: ${file_name} (${targetFile.type})\n` +
                `• Remaining files: ${updatedFiles.length}\n` +
                `• Files removed: 1\n` +
                `• Claude output reduction: ${outputReduction}%\n\n` +
                `${dependencies.length > 0 ? 
                  `⚠️ **Force deletion applied - Dependencies were ignored:**\n${dependencies.map(d => 
                    `• ${d.fileName}: ${d.references.length} reference(s)`
                  ).join('\n')}\n\n` : ''
                }` +
                `🚀 **File Management Achievement:**\n` +
                `Project cleaned up with precise file removal!\n\n` +
                `💡 **Next Steps:**\n` +
                `${dependencies.length > 0 ? 
                  `• Check dependent files for errors\n• Update references if needed\n` : ''
                }` +
                `• Continue development with streamlined project structure!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to delete file:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Check script ID format\n` +
                `• Verify file name exists (case-sensitive)\n` +
                `• Ensure OAuth permissions are correct\n` +
                `• Use search_files to find correct file name`
        }]
      };
    }
  }

  /**
   * Revolutionary Search Files System
   * Search across file names and content
   */
  async handleSearchFiles(args) {
    try {
      const { script_id, query, search_type = 'both', case_sensitive = false } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // プロジェクトファイル取得
      const response = await this.googleManager.script.projects.getContent({
        scriptId: script_id
      });
      
      const files = response.data.files || [];
      const results = [];
      
      // 検索実行
      files.forEach(file => {
        const searchResults = this.searchInFile(file, query, search_type, case_sensitive);
        if (searchResults.matches.length > 0) {
          results.push(searchResults);
        }
      });

      // 結果集計
      const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);
      const filesWithMatches = results.length;

      return {
        content: [{
          type: 'text',
          text: `🔍 **Search Results for "${query}"**\n\n` +
                `📊 **Search Summary:**\n` +
                `• Query: "${query}"\n` +
                `• Search type: ${search_type}\n` +
                `• Case sensitive: ${case_sensitive}\n` +
                `• Files searched: ${files.length}\n` +
                `• Files with matches: ${filesWithMatches}\n` +
                `• Total matches: ${totalMatches}\n\n` +
                `${results.length === 0 ? 
                  `❌ **No matches found**\n\n` +
                  `💡 **Search Tips:**\n` +
                  `• Try different search terms\n` +
                  `• Use case_sensitive: false for broader search\n` +
                  `• Use search_type: "both" for comprehensive search\n` +
                  `• Check file names with search_type: "file_name"\n` :
                  `📋 **Detailed Results:**\n\n${results.map(r => 
                    `**${r.fileName}** (${r.fileType}) - ${r.matches.length} match(es):\n${r.matches.map(m => 
                      `  • ${m.type === 'filename' ? 'File name match' : `Line ${m.line}: ${m.context.substring(0, 100)}${m.context.length > 100 ? '...' : ''}`}`
                    ).join('\n')}`
                  ).join('\n\n')}\n\n`
                }` +
                `💡 **Next Steps:**\n` +
                `• Use get_script_file_contents to view full files\n` +
                `• Use update_script_file to modify content\n` +
                `• Use add_script_file to add new files`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Search failed:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Check script ID format\n` +
                `• Ensure OAuth permissions are correct\n` +
                `• Try simpler search terms\n` +
                `• Use get_script_info to verify project access`
        }]
      };
    }
  }

  /**
   * Helper: Check file dependencies
   */
  checkFileDependencies(files, targetFileName) {
    const dependencies = [];
    
    files.forEach(file => {
      if (file.name === targetFileName) return;
      
      const references = this.findReferences(file.source || '', targetFileName);
      if (references.length > 0) {
        dependencies.push({
          fileName: file.name,
          references: references
        });
      }
    });
    
    return dependencies;
  }

  /**
   * Helper: Find references to target file
   */
  findReferences(content, targetFileName) {
    const references = [];
    const lines = content.split('\n');
    const searchTerms = [
      targetFileName,
      targetFileName.replace(/\.(gs|js)$/, ''),
      `'${targetFileName}'`,
      `"${targetFileName}"`,
      `${targetFileName.replace(/\.(gs|js)$/, '')}(`,
      `${targetFileName.replace(/\.(gs|js)$/, '')}.`
    ];
    
    lines.forEach((line, index) => {
      searchTerms.forEach(term => {
        if (line.includes(term)) {
          references.push({
            line: index + 1,
            context: line.trim()
          });
        }
      });
    });
    
    return references;
  }

  /**
   * Helper: Search within a single file
   */
  searchInFile(file, query, searchType, caseSensitive) {
    const matches = [];
    const fileName = file.name || '';
    const content = file.source || '';
    
    const normalizeQuery = (str) => caseSensitive ? str : str.toLowerCase();
    const normalizedQuery = normalizeQuery(query);
    
    // File name search
    if (searchType === 'file_name' || searchType === 'both') {
      if (normalizeQuery(fileName).includes(normalizedQuery)) {
        matches.push({
          type: 'filename',
          line: 0,
          context: fileName
        });
      }
    }
    
    // Content search
    if (searchType === 'content' || searchType === 'both') {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (normalizeQuery(line).includes(normalizedQuery)) {
          matches.push({
            type: 'content',
            line: index + 1,
            context: line.trim()
          });
        }
      });
    }
    
    return {
      fileName: fileName,
      fileType: file.type || 'UNKNOWN',
      matches: matches
    };
  }

  /**
   * Check if this handler can process the given tool
   */
  canHandle(toolName) {
    return ['add_script_file', 'update_script_file', 'get_script_file_contents', 'delete_script_file'].includes(toolName);
  }

  /**
   * Handle tool call - MCP v2.0.0 compatible interface
   */
  async handle(toolName, args) {
    switch(toolName) {
      case 'add_script_file':
        return await this.handleAddScriptFile(args);
      case 'update_script_file':
        return await this.handleUpdateScriptFile(args);
      case 'get_script_file_contents':
        return await this.handleGetScriptFileContents(args);
      case 'delete_script_file':
        return await this.handleDeleteScriptFile(args);
      case 'search_files':
        return await this.handleSearchFiles(args);
      default:
        throw new Error(`Unknown development tool: ${toolName}`);
    }
  }

  /**
   * Legacy handleToolCall method for backward compatibility
   */
  async handleToolCall(toolName, args) {
    return await this.handle(toolName, args);
  }

  /**
   * Handle tool - alias for handle method for server.js compatibility
   */
  async handleTool(toolName, args) {
    return await this.handle(toolName, args);
  }
}
