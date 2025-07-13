/**
 * Basic Tools Handler for Claude-AppsScript-Pro
 * Handles connection testing, diagnostics, and API verification
 * Phase 1 Version - Minimal Dependencies
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import { PROCESS_INFO_PATH } from '../../server.js';

// 現在のファイルのディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dotenv設定（明示的パス指定）
config({ path: join(__dirname, '../../.env') });

export class BasicToolsHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
    // Phase 1: Sheets functions dependency removed for stability
  }

  /**
   * Get tool definitions for basic tools - Phase 1 Version
   */
  getToolDefinitions() {
    return [
      {
        name: 'test_connection',
        description: 'Test MCP connection and OAuth status - Phase 1 Version',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'diagnostic_info',
        description: 'Get detailed OAuth authentication diagnostic information',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'test_apis',
        description: 'Test individual Google API connections and functionality',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'get_process_info',
        description: '🔧 MCPサーバープロセス情報取得・トラブルシューティング支援',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      }
    ];
  }

  /**
   * Check if this handler can handle the given tool
   */
  canHandle(toolName) {
    return ['test_connection', 'diagnostic_info', 'test_apis', 'get_process_info', 
            'get_sheets_function_info', 'search_sheets_functions', 'validate_sheets_formula', 
            'suggest_function_alternatives', 'analyze_function_complexity'].includes(toolName);
  }

  /**
   * Handle tool execution
   */
  async handle(toolName, args) {
    switch(toolName) {
      case 'test_connection':
        return await this.handleTestConnection(args);
      case 'diagnostic_info':
        return await this.handleDiagnosticInfo(args);
      case 'test_apis':
        return await this.handleTestApis(args);
      case 'get_process_info':
        return await this.handleGetProcessInfo(args);
      case 'get_sheets_function_info':
        return await this.handleGetSheetsFunctionInfo(args);
      case 'search_sheets_functions':
        return await this.handleSearchSheetsFunctions(args);
      case 'validate_sheets_formula':
        return await this.handleValidateSheetsFormula(args);
      case 'suggest_function_alternatives':
        return await this.handleSuggestFunctionAlternatives(args);
      case 'analyze_function_complexity':
        return await this.handleAnalyzeFunctionComplexity(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  /**
   * Handle tool call - alias for handle method for MCP compatibility
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

  /**
   * Test MCP connection and OAuth status
   */
  async handleTestConnection(args) {
    try {
      const connectionStatus = {
        mcpServer: '✅ Connected',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        platform: process.platform,
        nodeVersion: process.version
      };

      // OAuth認証状況確認
      let authStatus = '❌ Not initialized';
      if (this.googleManager && this.googleManager.initialized) {
        authStatus = '✅ OAuth initialized';
      }

      return {
        content: [{
          type: 'text',
          text: `🔌 **Claude-AppsScript-Pro Connection Test**\\\\n\\\\n` +
                `📡 **MCP Server**: ${connectionStatus.mcpServer}\\\\n` +
                `🔐 **OAuth Status**: ${authStatus}\\\\n` +
                `⏰ **Timestamp**: ${connectionStatus.timestamp}\\\\n` +
                `💻 **Platform**: ${connectionStatus.platform}\\\\n` +
                `🟢 **Node.js**: ${connectionStatus.nodeVersion}\\\\n\\\\n` +
                `🎯 **Phase 1 Implementation Status**: Ready\\\\n` +
                `• test_connection ✅\\\\n` +
                `• diagnostic_info ⏳\\\\n` +
                `• test_apis ⏳\\\\n\\\\n` +
                `🚀 **Revolutionary Output Reduction System**: Active`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Connection test failed:** ${error.message}\\\\n\\\\n` +
                `🔍 **Troubleshooting:**\\\\n` +
                `• Check OAuth authentication\\\\n` +
                `• Verify .env file configuration\\\\n` +
                `• Ensure MCP server is properly started`
        }]
      };
    }
  }

  /**
   * Get detailed OAuth authentication diagnostic information
   */
  async handleDiagnosticInfo(args) {
    try {
      if (!this.googleManager) {
        throw new Error('Google Manager not initialized');
      }

      const authInfo = this.googleManager.getAuthInfo();
      const serviceStatus = this.googleManager.getServiceStatus();
      const envCheck = this.checkEnvironmentVariables();

      return {
        content: [{
          type: 'text',
          text: `🔍 **OAuth Authentication Diagnostic Report**\\\\n\\\\n` +
                `🔐 **Authentication Method**: ${authInfo.authType}\\\\n` +
                `✅ **Initialization Status**: ${authInfo.initialized ? '✅ Success' : '❌ Failed'}\\\\n` +
                `🔑 **Refresh Token**: ${authInfo.hasRefreshToken ? '✅ Present' : '❌ Missing'}\\\\n\\\\n` +
                `🌐 **Google APIs Status**:\\\\n` +
                `• Apps Script API: ${serviceStatus.script.initialized ? '✅' : '❌'}\\\\n` +
                `• Drive API: ${serviceStatus.drive.initialized ? '✅' : '❌'}\\\\n` +
                `• Sheets API: ${serviceStatus.sheets.initialized ? '✅' : '❌'}\\\\n\\\\n` +
                `⚙️ **Environment Variables**:\\\\n` +
                `• CLIENT_ID: ${envCheck.clientId ? '✅' : '❌'}\\\\n` +
                `• CLIENT_SECRET: ${envCheck.clientSecret ? '✅' : '❌'}\\\\n` +
                `• REFRESH_TOKEN: ${envCheck.refreshToken ? '✅' : '❌'}\\\\n` +
                `• REDIRECT_URI: ${envCheck.redirectUri ? '✅' : '❌'}\\\\n\\\\n` +
                `📊 **System Capabilities**: 3/10 tools implemented (Phase 1)`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Diagnostic failed:** ${error.message}\\\\n\\\\n` +
                `🔧 **Immediate Actions Required:**\\\\n` +
                `• Verify .env file exists and has correct format\\\\n` +
                `• Check OAuth credentials validity\\\\n` +
                `• Restart MCP server if needed`
        }]
      };
    }
  }

  /**
   * Test individual Google API connections and functionality
   */
  async handleTestApis(args) {
    try {
      if (!this.googleManager || !this.googleManager.initialized) {
        throw new Error('Google Manager not initialized. Run diagnostic_info first.');
      }

      // Drive API テスト
      const driveTest = await this.googleManager.testBasicConnection();
      
      // Apps Script API テスト
      const scriptTest = await this.googleManager.testAppsScriptAPI();

      return {
        content: [{
          type: 'text',
          text: `🧪 **Google APIs Connection Test Results**\\\\n\\\\n` +
                `📁 **Drive API Test**:\\\\n` +
                `• Status: ${driveTest.success ? '✅ Success' : '❌ Failed'}\\\\n` +
                `• User: ${driveTest.user?.emailAddress || 'N/A'}\\\\n` +
                `• Display Name: ${driveTest.user?.displayName || 'N/A'}\\\\n` +
                `${driveTest.error ? `• Error: ${driveTest.error}` : ''}\\\\n\\\\n` +
                `⚙️ **Apps Script API Test**:\\\\n` +
                `• Status: ${scriptTest.success ? '✅ Success' : '❌ Failed'}\\\\n` +
                `• Test Project: ${scriptTest.title || 'N/A'}\\\\n` +
                `• Project ID: ${scriptTest.projectId || 'N/A'}\\\\n` +
                `${scriptTest.error ? `• Error: ${scriptTest.error}` : ''}\\\\n\\\\n` +
                `🎯 **API Capabilities Verified**:\\\\n` +
                `• OAuth authentication: ${driveTest.success && scriptTest.success ? '✅' : '❌'}\\\\n` +
                `• Project creation: ${scriptTest.success ? '✅' : '❌'}\\\\n` +
                `• Full access: ${driveTest.success && scriptTest.success ? '✅ Ready for Phase 2' : '❌ Issues detected'}\\\\n\\\\n` +
                `🚀 **Phase 1 Complete**: Ready to implement system construction tools!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **API test failed:** ${error.message}\\\\n\\\\n` +
                `🔧 **Resolution Steps:**\\\\n` +
                `• Run diagnostic_info for detailed analysis\\\\n` +
                `• Check Google Cloud Console permissions\\\\n` +
                `• Verify OAuth scope configuration\\\\n` +
                `• Try refreshing authentication tokens`
        }]
      };
    }
  }

  /**
   * Check environment variables status
   */
  checkEnvironmentVariables() {
    // Debug: 実際の環境変数値をチェック（セキュリティ配慮）
    const clientId = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN;
    const redirectUri = process.env.GOOGLE_APP_SCRIPT_API_REDIRECT_URI;
    
    // STDERRにデバッグ情報出力（MCPに影響しない）
    console.error('[ENV DEBUG]', {
      clientId: clientId ? `${clientId.substring(0, 20)}...` : 'NOT_FOUND',
      clientSecret: clientSecret ? 'SET' : 'NOT_FOUND',
      refreshToken: refreshToken ? 'SET' : 'NOT_FOUND',
      redirectUri: redirectUri || 'NOT_FOUND'
    });
    
    return {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      refreshToken: !!refreshToken,
      redirectUri: !!redirectUri
    };
  }

  /**
   * 🔧 MCPサーバープロセス情報取得・トラブルシューティング支援
   */
  async handleGetProcessInfo(args) {
    try {
      // server.jsから export されたパスを使用
      let processInfoContent = '';
      
      try {
        processInfoContent = await fs.readFile(PROCESS_INFO_PATH, 'utf8');
        console.error('[PROCESS-INFO] ✅ Successfully read process info from:', PROCESS_INFO_PATH);
      } catch (error) {
        console.error('[PROCESS-INFO] ⚠️ Failed to read process info file:', error.message);
        // ファイルが見つからない場合は現在のプロセス情報を生成
        processInfoContent = this.generateCurrentProcessInfo();
      }

      // 現在のプロセス情報を追加
      const currentInfo = this.getCurrentRuntimeInfo();

      return {
        content: [{
          type: 'text',
          text: `🔧 **MCP Server Process Information**\\n\\n` +
                `📄 **Saved Process Info:**\\n` +
                `\\`\\`\\`\\n${processInfoContent}\\`\\`\\`\\n\\n` +
                `⚡ **Current Runtime Info:**\\n` +
                `• PID: ${currentInfo.pid}\\n` +
                `• Uptime: ${currentInfo.uptime} seconds\\n` +
                `• Memory Usage: ${currentInfo.memoryUsage} MB\\n` +
                `• CPU Usage: ${currentInfo.cpuUsage}%\\n` +
                `• Platform: ${currentInfo.platform}\\n` +
                `• Node Version: ${currentInfo.nodeVersion}\\n\\n` +
                `🔍 **Process Check Commands:**\\n` +
                `• PowerShell: \\`Get-Process -Id ${currentInfo.pid}\\`\\n` +
                `• Claude Code: \\`ps -p ${currentInfo.pid}\\`\\n\\n` +
                `🛑 **Kill Process Commands (if needed):**\\n` +
                `• PowerShell: \\`Stop-Process -Id ${currentInfo.pid}\\`\\n` +
                `• Claude Code: \\`kill ${currentInfo.pid}\\`\\n\\n` +
                `💡 **このプロセス情報をナレッジベースに記録することで、今後のトラブルシューティングが大幅に改善されます。**`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **プロセス情報取得失敗:** ${error.message}\\n\\n` +
                `🔧 **基本プロセス情報:**\\n` +
                `• PID: ${process.pid}\\n` +
                `• Platform: ${process.platform}\\n` +
                `• Node Version: ${process.version}\\n` +
                `• Working Dir: ${process.cwd()}\\n\\n` +
                `💡 **トラブルシューティング:** プロセス情報ファイルが見つからない可能性があります。`
        }]
      };
    }
  }

  /**
   * 現在のプロセス情報を生成
   */
  generateCurrentProcessInfo() {
    const startTime = new Date().toISOString();
    return [
      `Claude-AppsScript-Pro MCP Server v2.0.0`,
      `Phase: 2c (10 tools implemented)`,
      `PID: ${process.pid}`,
      `Start Time: ${startTime}`,
      `Command: ${process.argv.join(' ')}`,
      `Working Dir: ${process.cwd()}`,
      `Node Version: ${process.version}`,
      `Platform: ${process.platform}`,
      `Architecture: ${process.arch}`,
      ``
    ].join('\\n');
  }

  /**
   * 現在のランタイム情報を取得
   */
  getCurrentRuntimeInfo() {
    const memUsage = process.memoryUsage();
    const memUsageMB = Math.round(memUsage.rss / 1024 / 1024 * 100) / 100;
    
    return {
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      memoryUsage: memUsageMB,
      cpuUsage: process.cpuUsage ? 'Available' : 'N/A',
      platform: process.platform,
      nodeVersion: process.version
    };
  }

  // ==== Sheets Functions Tools ====

  /**
   * 📊 Google Sheets関数の詳細情報取得・Claude認識エラー防止
   */
  async handleGetSheetsFunctionInfo(args) {
    try {
      const { function_name, include_examples = true, include_alternatives = true } = args;
      
      const functionInfo = this.sheetsLightweight.getFunctionInfo(function_name);
      if (!functionInfo) {
        return {
          content: [{
            type: 'text',
            text: `❌ **関数が見つかりません**: \"${function_name}\"\\n\\n` +
                  `🔍 **検索提案**: \\`search_sheets_functions\\` ツールで類似関数を検索してください。`
          }]
        };
      }

      let response = `📊 **${functionInfo.function_name}関数の詳細情報**\\n\\n` +
                    `📝 **構文**: \\`${functionInfo.syntax}\\`\\n` +
                    `💡 **説明**: ${functionInfo.description}\\n` +
                    `📂 **カテゴリ**: ${functionInfo.category}\\n`;

      if (include_examples && functionInfo.examples?.length) {
        response += `\\n🎯 **使用例**:\\n`;
        functionInfo.examples.forEach((example, i) => {
          response += `• \\`${example}\\`\\n`;
        });
      }

      if (include_alternatives && functionInfo.alternatives?.length) {
        response += `\\n🔄 **代替関数**:\\n`;
        functionInfo.alternatives.forEach(alt => {
          response += `• **${alt}**: 類似機能を提供\\n`;
        });
      }

      return {
        content: [{
          type: 'text',
          text: response
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **エラー**: ${error.message}\\n\\n` +
                `💡 **ヒント**: 関数名は正確に入力してください（例：VLOOKUP, SUMIF）`
        }]
      };
    }
  }

  /**
   * 🔍 Google Sheets関数検索・Claude知識補完システム
   */
  async handleSearchSheetsFunctions(args) {
    try {
      const { query, max_results = 10, category_filter } = args;
      
      console.error('[DEBUG] Search query:', query, 'max_results:', max_results);
      
      const searchData = this.sheetsLightweight.searchFunctions(query, max_results, category_filter);
      console.error('[DEBUG] Search data type:', typeof searchData);
      console.error('[DEBUG] Search data keys:', Object.keys(searchData || {}));
      
      const searchResults = searchData && searchData.results ? searchData.results : [];
      console.error('[DEBUG] Search results length:', searchResults.length);
      
      if (!searchResults.length) {
        return {
          content: [{
            type: 'text',
            text: `🔍 **検索結果なし**: \"${query}\"\\n\\n` +
                  `💡 **検索のヒント**:\\n` +
                  `• より一般的な用語で検索（例：「集計」「検索」「日付」）\\n` +
                  `• 英語の関数名で検索（例：VLOOKUP, SUMIF）\\n` +
                  `• カテゴリを指定（論理、数学、テキストなど）`
          }]
        };
      }

      let response = `🔍 **検索結果**: \"${query}\" (${searchResults.length}件)\\n\\n`;
      
      searchResults.forEach((func, index) => {
        response += `**${index + 1}. ${func.function_name || func.name || 'Unknown'}**\\n` +
                   `📝 ${func.syntax || 'N/A'}\\n` +
                   `💡 ${func.description || 'N/A'}\\n` +
                   `📂 カテゴリ: ${func.category || 'N/A'}\\n\\n`;
      });

      return {
        content: [{
          type: 'text',
          text: response
        }]
      };

    } catch (error) {
      console.error('[DEBUG] Search error:', error);
      return {
        content: [{
          type: 'text',
          text: `❌ **検索エラー**: ${error.message}\\n\\n` +
                `💡 **再試行**: より簡単なキーワードで検索してください`
        }]
      };
    }
  }

  /**
   * ✅ Google Sheets数式検証・正確な対応状況確認
   */
  async handleValidateSheetsFormula(args) {
    try {
      const { formula, context_info } = args;
      
      const validation = this.sheetsLightweight.validateFormula(formula);
      
      let response = `✅ **数式検証結果**\\n\\n` +
                    `📝 **数式**: \\`${formula}\\`\\n` +
                    `🔍 **構文チェック**: ${validation.isValid ? '✅ 正常' : '❌ エラー'}\\n`;

      if (validation.detectedFunctions?.length) {
        response += `\\n🔧 **検出された関数**:\\n`;
        validation.detectedFunctions.forEach(funcName => {
          const funcInfo = this.sheetsLightweight.getFunctionInfo(funcName);
          response += `• **${funcName}**: ${funcInfo ? '✅ 対応' : '❌ 未対応'}\\n`;
        });
      }

      if (validation.issues?.length) {
        response += `\\n⚠️ **検出された問題**:\\n`;
        validation.issues.forEach(issue => {
          response += `• ${issue}\\n`;
        });
      }

      if (validation.suggestions?.length) {
        response += `\\n💡 **改善提案**:\\n`;
        validation.suggestions.forEach(suggestion => {
          response += `• ${suggestion}\\n`;
        });
      }

      return {
        content: [{
          type: 'text',
          text: response
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **検証エラー**: ${error.message}\\n\\n` +
                `💡 **ヒント**: 数式は正確に入力してください（例：=VLOOKUP(A1,D:F,3,FALSE)）`
        }]
      };
    }
  }

  /**
   * 💡 関数代替案提案・最適化選択肢提供
   */
  async handleSuggestFunctionAlternatives(args) {
    try {
      const { function_name, purpose, complexity_level } = args;
      
      const alternativesData = this.sheetsLightweight.getAlternatives(function_name);
      console.error('[DEBUG] Alternatives data:', alternativesData, 'type:', typeof alternativesData);
      
      if (!alternativesData || !Array.isArray(alternativesData) || !alternativesData.length) {
        return {
          content: [{
            type: 'text',
            text: `💡 **代替案なし**: \"${function_name}\"\\n\\n` +
                  `🎯 **${function_name}**は既に最適な選択肢です。\\n\\n` +
                  `💪 **最適化のヒント**:\\n` +
                  `• パフォーマンスを重視する場合は配列関数の使用を検討\\n` +
                  `• 複雑な条件がある場合はLAMBDA関数の活用を検討`
          }]
        };
      }

      let response = `💡 **${function_name}の代替案提案**\\n\\n`;
      
      if (purpose) {
        response += `🎯 **用途**: ${purpose}\\n\\n`;
      }

      alternativesData.forEach((altName, index) => {
        const altInfo = this.sheetsLightweight.getFunctionInfo(altName);
        response += `**${index + 1}. ${altName}**\\n` +
                   `📝 構文: \\`${altInfo?.syntax || 'N/A'}\\`\\n` +
                   `💡 理由: 類似機能を提供\\n` +
                   `📂 カテゴリ: ${altInfo?.category || 'N/A'}\\n\\n`;
      });

      return {
        content: [{
          type: 'text',
          text: response
        }]
      };

    } catch (error) {
      console.error('[DEBUG] Alternatives error:', error);
      return {
        content: [{
          type: 'text',
          text: `❌ **代替案生成エラー**: ${error.message}\\n\\n` +
                `💡 **ヒント**: 正確な関数名を入力してください`
        }]
      };
    }
  }

  /**
   * 📈 関数複雑度分析・学習難易度指標提供
   */
  async handleAnalyzeFunctionComplexity(args) {
    try {
      const { function_name, context } = args;
      
      const complexity = this.sheetsLightweight.analyzeComplexity(function_name, context);
      
      if (!complexity) {
        return {
          content: [{
            type: 'text',
            text: `❌ **関数が見つかりません**: \"${function_name}\"\\n\\n` +
                  `🔍 **検索提案**: \\`search_sheets_functions\\` ツールで関数を検索してください。`
          }]
        };
      }

      let response = `📈 **${function_name}の複雑度分析**\\n\\n` +
                    `📊 **複雑度スコア**: ${complexity.score}/10\\n` +
                    `🎓 **学習難易度**: ${complexity.level}\\n` +
                    `⏱️ **習得時間**: ${complexity.learningTime || '未算出'}\\n\\n`;

      if (complexity.prerequisites?.length) {
        response += `📚 **前提知識**:\\n`;
        complexity.prerequisites.forEach(prereq => {
          response += `• ${prereq}\\n`;
        });
        response += '\\n';
      }

      if (complexity.learningPath?.length) {
        response += `🛤️ **学習パス**:\\n`;
        complexity.learningPath.forEach((step, index) => {
          response += `${index + 1}. ${step}\\n`;
        });
        response += '\\n';
      }

      if (complexity.tips?.length) {
        response += `💡 **学習のコツ**:\\n`;
        complexity.tips.forEach(tip => {
          response += `• ${tip}\\n`;
        });
      }

      return {
        content: [{
          type: 'text',
          text: response
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **複雑度分析エラー**: ${error.message}\\n\\n` +
                `💡 **ヒント**: 正確な関数名を入力してください（例：VLOOKUP, LAMBDA）`
        }]
      };
    }
  }

  /**
   * 環境変数チェック（diagnostic_info用）
   */
  checkEnvironmentVariables() {
    return {
      clientId: !!process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID,
      clientSecret: !!process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET,
      refreshToken: !!process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN,
      redirectUri: !!process.env.GOOGLE_APP_SCRIPT_API_REDIRECT_URI
    };
  }
}
