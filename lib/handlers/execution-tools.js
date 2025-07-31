/**
 * 🚀 Apps Script Execution Tools Handler
 * Claude-AppsScript-Pro v3.0.0 All-in-One Suite
 * 
 * Apps Script関数の直接実行機能を提供
 * Google Apps Script API script.run エンドポイント使用
 */

export class ExecutionToolsHandler {
  constructor(googleManager, logger) {
    this.googleManager = googleManager;
    this.logger = logger;
  }

  /**
   * 提供するツール定義
   */
  getToolDefinitions() {
    return [
      {
        name: 'execute_script_function',
        description: '🎯 Apps Script関数の直接実行（革新的機能）',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: {
              type: 'string',
              description: 'Apps Script プロジェクトID'
            },
            function_name: {
              type: 'string', 
              description: '実行する関数名'
            },
            parameters: {
              type: 'array',
              description: '関数パラメータ配列（オプション）',
              items: {
                type: 'string'
              }
            },
            dev_mode: {
              type: 'boolean',
              description: '開発モードで実行（デフォルト: true）',
              default: true
            }
          },
          required: ['script_id', 'function_name']
        }
      },
      {
        name: 'list_executable_functions',
        description: '📋 実行可能なApps Script関数一覧取得',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: {
              type: 'string',
              description: 'Apps Script プロジェクトID'
            }
          },
          required: ['script_id']
        }
      },
      {
        name: 'get_execution_transcript',
        description: '📊 最新の実行ログ・デバッグ情報取得',
        inputSchema: {
          type: 'object', 
          properties: {
            script_id: {
              type: 'string',
              description: 'Apps Script プロジェクトID'
            }
          },
          required: ['script_id']
        }
      }
    ];
  }

  canHandle(toolName) {
    return ['execute_script_function', 'list_executable_functions', 'get_execution_transcript'].includes(toolName);
  }

  async handleTool(toolName, args) {
    try {
      switch (toolName) {
        case 'execute_script_function':
          return await this.handleExecuteScriptFunction(args);
        case 'list_executable_functions':
          return await this.handleListExecutableFunctions(args);
        case 'get_execution_transcript':
          return await this.handleGetExecutionTranscript(args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      this.logger.error(`ExecutionTools error (${toolName}):`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Apps Script関数直接実行
   */
  async handleExecuteScriptFunction(args) {
    const { script_id, function_name, parameters = [], dev_mode = true } = args;

    try {
      // 実行リクエスト構築
      const request = {
        'function': function_name,
        'parameters': parameters,
        'devMode': dev_mode
      };

      this.logger.info(`Executing function: ${function_name} in script: ${script_id}`);
      
      // Apps Script API で関数実行
      const response = await this.googleManager.script.scripts.run({
        scriptId: script_id,
        resource: request
      });

      const result = response.data;

      // 実行結果の詳細分析
      let executionResult = {
        success: true,
        function_name: function_name,
        script_id: script_id,
        timestamp: new Date().toISOString()
      };

      if (result.error) {
        // エラー情報詳細化
        executionResult.success = false;
        executionResult.error = {
          type: result.error.type,
          message: result.error.message,
          details: result.error.details || [],
          script_stack_trace: result.error.scriptStackTraceElements || []
        };
      } else {
        // 成功時の結果
        executionResult.response = result.response;
        executionResult.result = result.response?.result;
        
        // 結果のタイプ分析
        if (result.response?.result !== undefined) {
          executionResult.result_type = typeof result.response.result;
          executionResult.result_summary = this.summarizeResult(result.response.result);
        }
      }

      // 実行統計
      if (result.response) {
        executionResult.execution_time = result.response.executionTime;
      }

      return this.formatExecutionResponse(executionResult);

    } catch (error) {
      this.logger.error('Function execution failed:', error);
      
      return {
        success: false,
        function_name: function_name,
        script_id: script_id,
        error: {
          type: 'API_ERROR',
          message: error.message,
          details: error.details || []
        },
        timestamp: new Date().toISOString(),
        troubleshooting: [
          '• スクリプトIDが正しいか確認してください',
          '• 関数名のスペルを確認してください', 
          '• スクリプトがデプロイされているか確認してください',
          '• OAuth権限にApps Script APIが含まれているか確認してください'
        ]
      };
    }
  }

  /**
   * 実行可能関数一覧取得
   */
  async handleListExecutableFunctions(args) {
    const { script_id } = args;

    try {
      // プロジェクト情報取得
      const project = await this.googleManager.script.projects.get({
        scriptId: script_id
      });

      const functions = [];
      
      // ファイルから関数を抽出
      if (project.data.files) {
        for (const file of project.data.files) {
          if (file.type === 'SERVER_JS' && file.source) {
            const fileFunctions = this.extractFunctionsFromCode(file.source, file.name);
            functions.push(...fileFunctions);
          }
        }
      }

      return {
        success: true,
        script_id: script_id,
        project_title: project.data.title,
        functions: functions,
        total_functions: functions.length,
        timestamp: new Date().toISOString(),
        usage_note: "これらの関数は execute_script_function ツールで直接実行できます"
      };

    } catch (error) {
      this.logger.error('Failed to list functions:', error);
      return {
        success: false,
        script_id: script_id,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 最新実行ログ取得
   */
  async handleGetExecutionTranscript(args) {
    const { script_id } = args;

    try {
      // Note: Google Apps Script API には直接的な実行ログAPIがないため、
      // プロジェクト情報と最新の状態を返す
      const project = await this.googleManager.script.projects.get({
        scriptId: script_id
      });

      return {
        success: true,
        script_id: script_id,
        project_title: project.data.title,
        last_modified: project.data.updateTime,
        note: "実行ログの詳細確認は Google Apps Script Editor > 実行数 タブで確認できます",
        google_script_url: `https://script.google.com/d/${script_id}/edit`,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        script_id: script_id,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * コードから関数を抽出
   */
  extractFunctionsFromCode(code, filename) {
    const functions = [];
    
    // 関数定義のパターンマッチング
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      
      // 基本的な関数情報を抽出
      functions.push({
        name: functionName,
        file: filename,
        executable: true,
        type: 'user_function'
      });
    }

    return functions;
  }

  /**
   * 実行結果の要約
   */
  summarizeResult(result) {
    if (result === null) return 'null';
    if (result === undefined) return 'undefined';
    
    const type = typeof result;
    
    if (type === 'string') {
      return result.length > 100 ? `文字列 (${result.length}文字): ${result.substring(0, 100)}...` : `文字列: ${result}`;
    } else if (type === 'object') {
      if (Array.isArray(result)) {
        return `配列 (${result.length}要素)`;
      } else {
        const keys = Object.keys(result);
        return `オブジェクト (${keys.length}プロパティ): ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
      }
    } else {
      return `${type}: ${result}`;
    }
  }

  /**
   * 実行結果フォーマット
   */
  formatExecutionResponse(result) {
    let output = `🎯 **Apps Script関数実行結果**\n\n`;
    
    if (result.success) {
      output += `✅ **実行成功**\n`;
      output += `• 関数名: ${result.function_name}\n`;
      output += `• スクリプトID: ${result.script_id}\n`;
      output += `• 実行時刻: ${result.timestamp}\n`;
      
      if (result.execution_time) {
        output += `• 実行時間: ${result.execution_time}\n`;
      }
      
      if (result.result !== undefined) {
        output += `\n📊 **実行結果**:\n`;
        output += `• タイプ: ${result.result_type}\n`;
        output += `• 値: ${JSON.stringify(result.result, null, 2)}\n`;
        output += `• 要約: ${result.result_summary}\n`;
      }
      
    } else {
      output += `❌ **実行失敗**\n`;
      output += `• 関数名: ${result.function_name}\n`;
      output += `• スクリプトID: ${result.script_id}\n`;
      output += `• エラータイプ: ${result.error.type}\n`;
      output += `• エラーメッセージ: ${result.error.message}\n`;
      
      if (result.error.script_stack_trace && result.error.script_stack_trace.length > 0) {
        output += `\n🐛 **スタックトレース**:\n`;
        result.error.script_stack_trace.forEach((trace, index) => {
          output += `${index + 1}. ${trace.function} (行 ${trace.lineNumber})\n`;
        });
      }
      
      if (result.troubleshooting) {
        output += `\n🔧 **トラブルシューティング**:\n`;
        result.troubleshooting.forEach(tip => output += `${tip}\n`);
      }
    }
    
    return output;
  }
}
