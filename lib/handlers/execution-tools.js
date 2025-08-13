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
              description: '開発モードで実行（デプロイ不要、デフォルト: false）',
              default: false
            },
            deployment_id: {
              type: 'string',
              description: 'デプロイメントID（WebApp/API実行時）'
            },
            version_number: {
              type: 'string',
              description: 'バージョン番号（デフォルト: @HEAD）',
              default: '@HEAD'
            },
            use_web_api: {
              type: 'boolean',
              description: 'WebAPI経由で実行（デフォルト: false）',
              default: false
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
    // DEBUG: Log method call
    console.error(`[DEBUG] ExecutionTools.handleTool called with: ${toolName}`, args);
    this.logger.info(`[DEBUG] ExecutionTools handling: ${toolName}`);
    
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
        content: [
          {
            type: 'text',
            text: `❌ **ExecutionTools エラー (${toolName})**\n\n` +
                  `• エラー: ${error.message}\n` +
                  `• タイムスタンプ: ${new Date().toISOString()}\n` +
                  `• 推奨: 入力パラメータとスクリプトIDを確認してください`
          }
        ]
      };
    }
  }

  /**
   * Apps Script関数直接実行
   */
  async handleExecuteScriptFunction(args) {
    const { 
      script_id, 
      function_name, 
      parameters = [], 
      dev_mode = false,
      deployment_id = null,
      version_number = '@HEAD',
      use_web_api = false
    } = args;

    try {
      // WebAPI経由での実行分岐
      if (use_web_api) {
        return await this.executeViaWebAPI(script_id, function_name, parameters, deployment_id);
      }

      // 従来のGoogle Apps Script API経由での実行
      // 実行リクエスト構築（ExecutionRequest）
      const request = {
        'function': function_name,
        'parameters': parameters
      };

      // devModeとversionNumberは**request body**（ExecutionRequest）のフィールド
      if (dev_mode) {
        request.devMode = true;  // オーナーのみ有効
        this.logger.info(`Using devMode: true for HEAD execution (owner only)`);
      } else if (version_number !== '@HEAD') {
        request.versionNumber = Number(version_number);  // API Executable の version
        this.logger.info(`Using versionNumber: ${version_number} for API Executable`);
      }

      // deployment_idが指定されている場合はそれを使用
      if (deployment_id) {
        // Note: Google Apps Script API v1 では deploymentId は使用できない
        // 代わりに versionNumber を使用する必要がある
        this.logger.info(`Deployment ID specified: ${deployment_id}, will use HEAD version`);
      }

      this.logger.info(`Executing function: ${function_name} in script: ${script_id}`);
      
      // Apps Script API で関数実行
      const runRequest = {
        scriptId: script_id,
        requestBody: request  // resourceではなくrequestBodyを使用（googleapis v150以降）
      };

      const response = await this.googleManager.script.scripts.run(runRequest);

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

      return {
        content: [
          {
            type: 'text',
            text: this.formatExecutionResponse(executionResult)
          }
        ]
      };

    } catch (error) {
      this.logger.error('Function execution failed:', error);
      
      const errorResponse = this.formatExecutionResponse({
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
          '• dev_mode: true を使用するか、API実行用デプロイメントを作成してください',
          '• OAuth権限にApps Script APIが含まれているか確認してください',
          '• 開発中はdev_mode: trueの使用を推奨します'
        ]
      });
      
      return {
        content: [
          {
            type: 'text',
            text: errorResponse
          }
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
      // DEBUG: Log the start of function listing
      console.error(`[DEBUG] Starting IMPROVED function listing for script: ${script_id}`);
      
      // プロジェクト基本情報取得
      const project = await this.googleManager.script.projects.get({
        scriptId: script_id
      });

      // ソースコード付きでプロジェクト内容を取得
      const contentResponse = await this.googleManager.script.projects.getContent({
        scriptId: script_id
      });

      console.error(`[DEBUG] Project: ${project.data.title}, Files: ${project.data.files?.length || 0}`);
      console.error(`[DEBUG] Content files: ${contentResponse.data.files?.length || 0}`);

      const functions = [];
      
      // SERVER_JSファイルからソースコードを取得して関数を抽出
      if (contentResponse.data.files) {
        for (const file of contentResponse.data.files) {
          console.error(`[DEBUG] Processing content file: ${file.name}, Type: ${file.type}, HasSource: ${!!file.source}`);
          
          if (file.type === 'SERVER_JS' && file.source) {
            console.error(`[DEBUG] Getting functions from ${file.name}, source length: ${file.source.length}`);
            const fileFunctions = this.extractFunctionsFromCodeImproved(file.source, file.name);
            functions.push(...fileFunctions);
          }
        }
      } else {
        console.error(`[DEBUG] No content files found in project data`);
      }

      const responseText = `📋 **実行可能関数一覧**\n\n` +
        `✅ **プロジェクト情報**:\n` +
        `• スクリプトID: ${script_id}\n` +
        `• プロジェクト名: ${project.data.title}\n` +
        `• 実行可能関数数: ${functions.length}\n` +
        `• 取得時刻: ${new Date().toISOString()}\n\n` +
        (functions.length > 0 ? 
          `🔧 **実行可能関数一覧**:\n` +
          functions.map((func, index) => 
            `${index + 1}. **${func.name}**\n   • ファイル: ${func.file}\n   • タイプ: ${func.type}\n`
          ).join('\n') + 
          `\n💡 **使用方法**: これらの関数は execute_script_function ツールで直接実行できます\n` +
          `例: claude-appsscript-pro:execute_script_function({"script_id": "${script_id}", "function_name": "${functions[0]?.name}"})`
          : `⚠️ 実行可能な関数が見つかりませんでした。\n• SERVER_JS ファイルに function 定義があることを確認してください`
        );

      return {
        content: [
          {
            type: 'text',
            text: responseText
          }
        ]
      };

    } catch (error) {
      this.logger.error('Failed to list functions:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ **関数一覧取得失敗**\n\n` +
                  `• スクリプトID: ${script_id}\n` +
                  `• エラー: ${error.message}\n` +
                  `• 時刻: ${new Date().toISOString()}\n\n` +
                  `🔧 **トラブルシューティング**:\n` +
                  `• スクリプトIDが正しいか確認してください\n` +
                  `• OAuth権限にApps Script APIが含まれているか確認してください\n` +
                  `• プロジェクトが存在し、アクセス可能か確認してください`
          }
        ]
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
        content: [
          {
            type: 'text',
            text: `📊 **実行ログ・デバッグ情報**\n\n` +
                  `✅ **プロジェクト情報**:\n` +
                  `• スクリプトID: ${script_id}\n` +
                  `• プロジェクト名: ${project.data.title}\n` +
                  `• 最終更新: ${project.data.updateTime}\n` +
                  `• 取得時刻: ${new Date().toISOString()}\n\n` +
                  `🔗 **Google Script URL**: ${`https://script.google.com/d/${script_id}/edit`}\n\n` +
                  `📝 **注意**: 実行ログの詳細確認は Google Apps Script Editor > 実行数 タブで確認できます`
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ **実行ログ取得失敗**\n\n` +
                  `• スクリプトID: ${script_id}\n` +
                  `• エラー: ${error.message}\n` +
                  `• タイムスタンプ: ${new Date().toISOString()}\n\n` +
                  `🔧 **トラブルシューティング**:\n` +
                  `• スクリプトIDが正しいか確認してください\n` +
                  `• OAuth権限にApps Script APIが含まれているか確認してください`
          }
        ]
      };
    }
  }

  /**
   * コードから関数を抽出
   */
  extractFunctionsFromCode(code, filename) {
    const functions = [];
    
    // DEBUG: Log the code being processed
    console.error(`[DEBUG] Extracting functions from file: ${filename}`);
    console.error(`[DEBUG] Code length: ${code ? code.length : 'undefined'}`);
    console.error(`[DEBUG] Code preview: ${code ? code.substring(0, 200) : 'no code'}`);
    
    if (!code) {
      console.error(`[DEBUG] No code provided for ${filename}`);
      return functions;
    }
    
    // 関数定義のパターンマッチング
    const functionRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const functionName = match[1];
      console.error(`[DEBUG] Found function: ${functionName}`);
      
      // 基本的な関数情報を抽出
      functions.push({
        name: functionName,
        file: filename,
        executable: true,
        type: 'user_function'
      });
    }

    console.error(`[DEBUG] Total functions found: ${functions.length}`);
    return functions;
  }

  /**
   * 改良版：コードから関数を抽出（パラメータと説明付き）
   */
  extractFunctionsFromCodeImproved(code, filename) {
    const functions = [];
    
    console.error(`[DEBUG] [IMPROVED] Extracting functions from file: ${filename}`);
    console.error(`[DEBUG] [IMPROVED] Code length: ${code ? code.length : 'undefined'}`);
    
    if (!code) {
      console.error(`[DEBUG] [IMPROVED] No code provided for ${filename}`);
      return functions;
    }
    
    // より詳細な関数抽出パターン
    const functionPattern = /(?:\/\*\*[\s\S]*?\*\/\s*)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g;
    let match;
    
    while ((match = functionPattern.exec(code)) !== null) {
      const functionName = match[1];
      const paramString = match[2].trim();
      
      // パラメータ解析
      const parameters = paramString ? 
        paramString.split(',').map(p => p.trim()).filter(p => p.length > 0) : 
        [];
      
      // 関数の前のコメントを抽出
      const functionStart = match.index;
      const beforeFunction = code.substring(Math.max(0, functionStart - 200), functionStart);
      const commentMatch = beforeFunction.match(/\/\*\*\s*(.*?)\s*\*\//s);
      const description = commentMatch ? 
        commentMatch[1].replace(/\*\s*/g, '').trim().split('\n')[0] : 
        null;
      
      console.error(`[DEBUG] [IMPROVED] Found function: ${functionName}(${parameters.join(', ')})`);
      
      functions.push({
        name: functionName,
        file: filename,
        parameters: parameters.length > 0 ? parameters.join(', ') : null,
        description: description,
        executable: true,
        type: 'user_function'
      });
    }

    console.error(`[DEBUG] [IMPROVED] Total functions found: ${functions.length}`);
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

  /**
   * WebAPI経由でApps Script関数を実行
   */
  async executeViaWebAPI(script_id, function_name, parameters = [], deployment_id = null) {
    try {
      // WebApp URLの構築
      const webAppUrl = deployment_id 
        ? `https://script.google.com/macros/s/${deployment_id}/exec`
        : `https://script.google.com/macros/s/${script_id}/exec`;

      // URLパラメータの構築
      const url = new URL(webAppUrl);
      url.searchParams.set('func', function_name);
      
      if (parameters.length > 0) {
        url.searchParams.set('params', JSON.stringify(parameters));
      }

      this.logger.info(`Executing function via WebAPI: ${function_name} at ${url.toString()}`);

      // HTTP GETリクエストを送信
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // レスポンスの確認
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      // 実行結果の分析
      let executionResult = {
        success: responseData.success || false,
        function_name: function_name,
        script_id: script_id,
        deployment_id: deployment_id,
        execution_method: 'WebAPI',
        timestamp: new Date().toISOString()
      };

      if (responseData.success) {
        // WebAPI実行成功
        executionResult.result = responseData.result;
        executionResult.result_type = typeof responseData.result;
        executionResult.result_summary = this.summarizeResult(responseData.result);
        
        // WebAppレスポンスに実行時間が含まれている場合
        if (responseData.execution_time) {
          executionResult.execution_time = responseData.execution_time;
        }
      } else {
        // WebAPI実行失敗
        executionResult.error = {
          type: 'WEBAPI_ERROR',
          message: responseData.error || 'WebAPI実行でエラーが発生しました',
          details: responseData.details || []
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: this.formatWebAPIExecutionResponse(executionResult)
          }
        ]
      };

    } catch (error) {
      this.logger.error('WebAPI execution failed:', error);
      
      const errorResponse = this.formatWebAPIExecutionResponse({
        success: false,
        function_name: function_name,
        script_id: script_id,
        deployment_id: deployment_id,
        execution_method: 'WebAPI',
        error: {
          type: 'WEBAPI_CONNECTION_ERROR',
          message: error.message,
          details: []
        },
        timestamp: new Date().toISOString(),
        troubleshooting: [
          '• deployment_idが正しいWebAppデプロイメントIDか確認してください',
          '• WebAppが「誰でもアクセス可能」として公開されているか確認してください',
          '• 関数名のスペルを確認してください',
          '• WebAppのdoGet関数が正しく実装されているか確認してください',
          '• ネットワーク接続を確認してください'
        ]
      });
      
      return {
        content: [
          {
            type: 'text',
            text: errorResponse
          }
        ]
      };
    }
  }

  /**
   * WebAPI実行結果フォーマット
   */
  formatWebAPIExecutionResponse(result) {
    let output = `🌐 **Apps Script WebAPI実行結果**\n\n`;
    
    if (result.success) {
      output += `✅ **実行成功**\n`;
      output += `• 関数名: ${result.function_name}\n`;
      output += `• スクリプトID: ${result.script_id}\n`;
      output += `• 実行方式: ${result.execution_method}\n`;
      
      if (result.deployment_id) {
        output += `• デプロイメントID: ${result.deployment_id}\n`;
      }
      
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
      output += `• 実行方式: ${result.execution_method}\n`;
      
      if (result.deployment_id) {
        output += `• デプロイメントID: ${result.deployment_id}\n`;
      }
      
      output += `• エラータイプ: ${result.error.type}\n`;
      output += `• エラーメッセージ: ${result.error.message}\n`;
      
      if (result.troubleshooting) {
        output += `\n🔧 **トラブルシューティング**:\n`;
        result.troubleshooting.forEach(tip => output += `${tip}\n`);
      }
    }
    
    return output;
  }
}
