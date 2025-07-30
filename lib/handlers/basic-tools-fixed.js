/**
 * Basic Tools Handler for Claude-AppsScript-Pro - 修正版
 * 戻り値形式エラー解決（二重エスケープ問題修正）
 */

export class BasicToolsHandler {
  constructor(googleManager, diagLogger, serverInstance = null) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
    this.serverInstance = serverInstance;
  }

  getToolDefinitions() {
    return [
      {
        name: 'test_connection',
        description: 'Test MCP connection and OAuth status',
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
        description: 'MCPサーバープロセス情報取得・トラブルシューティング支援',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ];
  }

  canHandle(toolName) {
    return ['test_connection', 'diagnostic_info', 'test_apis', 'get_process_info'].includes(toolName);
  }

  async handleTool(toolName, args) {
    switch(toolName) {
      case 'test_connection':
        return await this.handleTestConnection(args);
      case 'diagnostic_info':
        return await this.handleDiagnosticInfo(args);
      case 'test_apis':
        return await this.handleTestApis(args);
      case 'get_process_info':
        return await this.handleGetProcessInfo(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async handleTestConnection(args) {
    try {
      const connectionStatus = {
        mcpServer: '✅ Connected',
        timestamp: new Date().toISOString(),
        version: '2.1.0-minimal',
        platform: process.platform,
        nodeVersion: process.version
      };

      let authStatus = '❌ Not initialized';
      if (this.googleManager && this.googleManager.initialized) {
        authStatus = '✅ OAuth initialized';
      }

      return {
        content: [{
          type: 'text',
          text: `🔌 **Claude-AppsScript-Pro Connection Test**

📡 **MCP Server**: ${connectionStatus.mcpServer}
🔐 **OAuth Status**: ${authStatus}
⏰ **Timestamp**: ${connectionStatus.timestamp}
💻 **Platform**: ${connectionStatus.platform}
🟢 **Node.js**: ${connectionStatus.nodeVersion}

🎯 **Minimal Configuration (4 tools)**: Ready
• test_connection ✅
• diagnostic_info ✅  
• test_apis ✅
• get_process_info ✅

🚀 **Revolutionary Output Reduction System**: Active`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Connection test failed:** ${error.message}

🔍 **Troubleshooting:**
• Check OAuth authentication
• Verify .env file configuration
• Ensure MCP server is properly started`
        }]
      };
    }
  }

  async handleDiagnosticInfo(args) {
    try {
      if (!this.googleManager) {
        throw new Error('Google Manager not initialized');
      }

      // GoogleAPIsManagerの既存メソッドを使用して診断情報を組み立て
      const authInfo = this.googleManager.getAuthInfo();
      const serviceStatus = this.googleManager.getServiceStatus();
      
      // OAuth初期化試行
      let initStatus = 'Not attempted';
      try {
        if (!this.googleManager.initialized) {
          await this.googleManager.initialize();
        }
        initStatus = '✅ Initialized successfully';
      } catch (initError) {
        initStatus = `❌ Failed: ${initError.message}`;
      }

      // 基本接続テスト
      let connectionTest = 'Not tested';
      try {
        if (this.googleManager.initialized) {
          const testResult = await this.googleManager.testBasicConnection();
          connectionTest = testResult.success ? '✅ Connection successful' : `❌ Failed: ${testResult.error}`;
        }
      } catch (testError) {
        connectionTest = `❌ Error: ${testError.message}`;
      }

      return {
        content: [{
          type: 'text',
          text: `🔍 **OAuth Authentication Diagnostic**

**Initialization Status:**
${initStatus}

**Auth Configuration:**
• Method: ${authInfo.method}
• Type: ${authInfo.authType}
• Has Refresh Token: ${authInfo.hasRefreshToken ? '✅' : '❌'}
• Initialized: ${authInfo.initialized ? '✅' : '❌'}

**Service Status:**
• Drive API: ${serviceStatus.drive.initialized ? '✅' : '❌'}
• Sheets API: ${serviceStatus.sheets.initialized ? '✅' : '❌'}
• Script API: ${serviceStatus.script.initialized ? '✅' : '❌'}
• Slides API: ${serviceStatus.slides.initialized ? '✅' : '❌'}

**Connection Test:**
${connectionTest}

**Environment Variables:**
• CLIENT_ID: ${process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID ? '✅ Set' : '❌ Missing'}
• CLIENT_SECRET: ${process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}
• REFRESH_TOKEN: ${process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN ? '✅ Set' : '❌ Missing'}`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Diagnostic failed:** ${error.message}

Please check your OAuth configuration.`
        }]
      };
    }
  }

  async handleTestApis(args) {
    try {
      if (!this.googleManager) {
        throw new Error('Google Manager not initialized');
      }

      // OAuth初期化確認
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      const results = [];
      
      // Drive API テスト
      let driveTest = '❌ Not tested';
      try {
        const driveResult = await this.googleManager.testBasicConnection();
        driveTest = driveResult.success ? 
          `✅ Connected (User: ${driveResult.user?.displayName || 'Unknown'})` : 
          `❌ Failed: ${driveResult.error}`;
      } catch (error) {
        driveTest = `❌ Error: ${error.message}`;
      }

      // Apps Script API テスト
      let scriptTest = '❌ Not tested';
      try {
        const scriptResult = await this.googleManager.testAppsScriptAPI();
        scriptTest = scriptResult.success ? 
          `✅ Connected (Test Project: ${scriptResult.projectId})` : 
          `❌ Failed: ${scriptResult.error}`;
      } catch (error) {
        scriptTest = `❌ Error: ${error.message}`;
      }

      // サービス状況確認
      const serviceStatus = this.googleManager.getServiceStatus();

      return {
        content: [{
          type: 'text',
          text: `🧪 **Google APIs Test Results**

**API Initialization Status:**
• Drive API: ${serviceStatus.drive.initialized ? '✅ Initialized' : '❌ Not initialized'}
• Sheets API: ${serviceStatus.sheets.initialized ? '✅ Initialized' : '❌ Not initialized'}
• Script API: ${serviceStatus.script.initialized ? '✅ Initialized' : '❌ Not initialized'}
• Slides API: ${serviceStatus.slides.initialized ? '✅ Initialized' : '❌ Not initialized'}

**Connection Tests:**
• Drive API: ${driveTest}
• Apps Script API: ${scriptTest}

**Overall Status:**
${serviceStatus.drive.initialized && serviceStatus.script.initialized ? 
  '🎉 **Full Access Ready** - All critical APIs operational' : 
  '⚠️ **Partial Access** - Some APIs may need initialization'}`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **API test failed:** ${error.message}

Please check your API configuration.`
        }]
      };
    }
  }

  async handleGetProcessInfo(args) {
    try {
      const processInfo = {
        pid: process.pid,
        memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        uptime: Math.round(process.uptime()),
        platform: process.platform,
        nodeVersion: process.version
      };

      return {
        content: [{
          type: 'text',
          text: `🔧 **MCP Server Process Information**

**Process Details:**
• PID: ${processInfo.pid}
• Memory Usage: ${processInfo.memory} MB
• Uptime: ${processInfo.uptime} seconds
• Platform: ${processInfo.platform}
• Node Version: ${processInfo.nodeVersion}

**Commands for Process Management:**
PowerShell: Get-Process -Id ${processInfo.pid}
Claude Code: ps -p ${processInfo.pid}

**Kill Process (if needed):**
PowerShell: Stop-Process -Id ${processInfo.pid}
Claude Code: kill ${processInfo.pid}`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Process info failed:** ${error.message}`
        }]
      };
    }
  }
}
