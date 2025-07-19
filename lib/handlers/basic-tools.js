/**
 * Basic Tools Handler for Claude-AppsScript-Pro
 * Handles connection testing, diagnostics, and API verification
 */

export class BasicToolsHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
  }

  /**
   * Get tool definitions for basic tools
   */
  getToolDefinitions() {
    return [
      {
        name: 'test_connection',
        description: 'Test MCP connection and OAuth status - ES Modules VERSION',
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
      }
    ];
  }

  /**
   * Check if this handler can handle the given tool
   */
  canHandle(toolName) {
    return ['test_connection', 'diagnostic_info', 'test_apis'].includes(toolName);
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
          text: `🔌 **Claude-AppsScript-Pro Connection Test**\\n\\n` +
                `📡 **MCP Server**: ${connectionStatus.mcpServer}\\n` +
                `🔐 **OAuth Status**: ${authStatus}\\n` +
                `⏰ **Timestamp**: ${connectionStatus.timestamp}\\n` +
                `💻 **Platform**: ${connectionStatus.platform}\\n` +
                `🟢 **Node.js**: ${connectionStatus.nodeVersion}\\n\\n` +
                `🎯 **Phase 1 Implementation Status**: Ready\\n` +
                `• test_connection ✅\\n` +
                `• diagnostic_info ⏳\\n` +
                `• test_apis ⏳\\n\\n` +
                `🚀 **Revolutionary Output Reduction System**: Active`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Connection test failed:** ${error.message}\\n\\n` +
                `🔍 **Troubleshooting:**\\n` +
                `• Check OAuth authentication\\n` +
                `• Verify .env file configuration\\n` +
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
          text: `🔍 **OAuth Authentication Diagnostic Report**\\n\\n` +
                `🔐 **Authentication Method**: ${authInfo.authType}\\n` +
                `✅ **Initialization Status**: ${authInfo.initialized ? '✅ Success' : '❌ Failed'}\\n` +
                `🔑 **Refresh Token**: ${authInfo.hasRefreshToken ? '✅ Present' : '❌ Missing'}\\n\\n` +
                `🌐 **Google APIs Status**:\\n` +
                `• Apps Script API: ${serviceStatus.script.initialized ? '✅' : '❌'}\\n` +
                `• Drive API: ${serviceStatus.drive.initialized ? '✅' : '❌'}\\n` +
                `• Sheets API: ${serviceStatus.sheets.initialized ? '✅' : '❌'}\\n\\n` +
                `⚙️ **Environment Variables**:\\n` +
                `• CLIENT_ID: ${envCheck.clientId ? '✅' : '❌'}\\n` +
                `• CLIENT_SECRET: ${envCheck.clientSecret ? '✅' : '❌'}\\n` +
                `• REFRESH_TOKEN: ${envCheck.refreshToken ? '✅' : '❌'}\\n` +
                `• REDIRECT_URI: ${envCheck.redirectUri ? '✅' : '❌'}\\n\\n` +
                `📊 **System Capabilities**: 3/10 tools implemented (Phase 1)`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Diagnostic failed:** ${error.message}\\n\\n` +
                `🔧 **Immediate Actions Required:**\\n` +
                `• Verify .env file exists and has correct format\\n` +
                `• Check OAuth credentials validity\\n` +
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
          text: `🧪 **Google APIs Connection Test Results**\\n\\n` +
                `📁 **Drive API Test**:\\n` +
                `• Status: ${driveTest.success ? '✅ Success' : '❌ Failed'}\\n` +
                `• User: ${driveTest.user?.emailAddress || 'N/A'}\\n` +
                `• Display Name: ${driveTest.user?.displayName || 'N/A'}\\n` +
                `${driveTest.error ? `• Error: ${driveTest.error}` : ''}\\n\\n` +
                `⚙️ **Apps Script API Test**:\\n` +
                `• Status: ${scriptTest.success ? '✅ Success' : '❌ Failed'}\\n` +
                `• Test Project: ${scriptTest.title || 'N/A'}\\n` +
                `• Project ID: ${scriptTest.projectId || 'N/A'}\\n` +
                `${scriptTest.error ? `• Error: ${scriptTest.error}` : ''}\\n\\n` +
                `🎯 **API Capabilities Verified**:\\n` +
                `• OAuth authentication: ${driveTest.success && scriptTest.success ? '✅' : '❌'}\\n` +
                `• Project creation: ${scriptTest.success ? '✅' : '❌'}\\n` +
                `• Full access: ${driveTest.success && scriptTest.success ? '✅ Ready for Phase 2' : '❌ Issues detected'}\\n\\n` +
                `🚀 **Phase 1 Complete**: Ready to implement system construction tools!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **API test failed:** ${error.message}\\n\\n` +
                `🔧 **Resolution Steps:**\\n` +
                `• Run diagnostic_info for detailed analysis\\n` +
                `• Check Google Cloud Console permissions\\n` +
                `• Verify OAuth scope configuration\\n` +
                `• Try refreshing authentication tokens`
        }]
      };
    }
  }

  /**
   * Check environment variables status
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
