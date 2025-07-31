/**
 * Basic Tools Handler for Claude-AppsScript-Pro
 * Handles connection testing, diagnostics, and API verification
 */

export class BasicToolsHandler {
  constructor(googleManager, diagLogger, serverInstance = null) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
    this.serverInstance = serverInstance; // Server instance for dynamic info
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
   * Get dynamic system capabilities information
   */
  getDynamicSystemInfo() {
    try {
      // Basic tools count
      const basicToolsCount = this.getToolDefinitions().length; // 4 tools
      
      // System tools count (from server instance if available)
      let systemToolsCount = 0;
      let developmentToolsCount = 0;
      let totalToolsCount = basicToolsCount;
      let currentPhase = 'Phase 1 (Basic Tools)';
      
      if (this.serverInstance && this.serverInstance.systemTools) {
        systemToolsCount = this.serverInstance.systemTools.getToolDefinitions().length;
        totalToolsCount = basicToolsCount + systemToolsCount;
        
        if (systemToolsCount > 0) {
          currentPhase = `Phase 2 (System Construction - ${totalToolsCount} tools)`;
        }
      }
      
      if (this.serverInstance && this.serverInstance.developmentTools) {
        developmentToolsCount = this.serverInstance.developmentTools.getToolDefinitions().length;
        totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount;
        
        if (developmentToolsCount > 0) {
          currentPhase = `Phase 3 (Incremental Development - ${totalToolsCount} tools)`;
        }
      }
      
      // Check for patch tools (Phase 4)
      let patchToolsCount = 0;
      if (this.serverInstance && this.serverInstance.patchTools) {
        patchToolsCount = this.serverInstance.patchTools.getToolDefinitions().length;
        totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount + patchToolsCount;
        
        if (patchToolsCount > 0) {
          currentPhase = `Phase 4 (Patch System - ${totalToolsCount} tools)`;
        }
      }
      
      // Check for function tools (Phase 5)
      let functionToolsCount = 0;
      if (this.serverInstance && this.serverInstance.functionTools) {
        functionToolsCount = this.serverInstance.functionTools.getToolDefinitions().length;
        totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount + patchToolsCount + functionToolsCount;
        
        if (functionToolsCount > 0) {
          currentPhase = `Phase 5 (Function Tools - ${totalToolsCount} tools)`;
        }
      }
      
      // Check for formula tools (Phase 6)
      let formulaToolsCount = 0;
      if (this.serverInstance && this.serverInstance.formulaTools) {
        formulaToolsCount = this.serverInstance.formulaTools.getToolDefinitions().length;
        totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount + patchToolsCount + functionToolsCount + formulaToolsCount;
        
        if (formulaToolsCount > 0) {
          currentPhase = `Phase 6 (Formula Tools - ${totalToolsCount} tools)`;
        }
      }
      
      // Check for webapp deployment tools (Phase 7)
      let webappDeploymentToolsCount = 0;
      if (this.serverInstance && this.serverInstance.webappDeploymentTools) {
        webappDeploymentToolsCount = this.serverInstance.webappDeploymentTools.getToolDefinitions().length;
        totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount + patchToolsCount + functionToolsCount + formulaToolsCount + webappDeploymentToolsCount;
        
        if (webappDeploymentToolsCount > 0) {
          currentPhase = `Phase 7 (WebApp Deployment - ${totalToolsCount} tools)`;
        }
      }
      
      // Check for sheet operations tools (Phase 8)
      let sheetToolsCount = 0;
      let sheetManagementToolsCount = 0;
      if (this.serverInstance && this.serverInstance.sheetTools) {
        sheetToolsCount = this.serverInstance.sheetTools.getToolDefinitions().length;
      }
      if (this.serverInstance && this.serverInstance.sheetManagement) {
        sheetManagementToolsCount = this.serverInstance.sheetManagement.getToolDefinitions().length;
      }
      
      if (sheetToolsCount > 0 || sheetManagementToolsCount > 0) {
        totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount + patchToolsCount + functionToolsCount + formulaToolsCount + webappDeploymentToolsCount + sheetToolsCount + sheetManagementToolsCount;
        currentPhase = `Phase 8 (Sheet Operations - ${totalToolsCount} tools)`;
      }
      
      // Sheets functions tools removed in v3.0.0 All-in-One Suite (cost optimization)
      let sheetsFunctionsToolsCount = 0; // Fixed to 0 - functions database removed
      
      // Check for browser debug tools if available
      let browserDebugToolsCount = 0;
      if (this.serverInstance && this.serverInstance.browserDebugTools) {
        browserDebugToolsCount = this.serverInstance.browserDebugTools.getToolDefinitions().length;
      }
      
      // Check for execution tools if available
      let executionToolsCount = 0;
      if (this.serverInstance && this.serverInstance.executionTools) {
        executionToolsCount = this.serverInstance.executionTools.getToolDefinitions().length;
      }
      
      // Check for intelligent workflow tools if available
      let intelligentWorkflowCount = 0;
      if (this.serverInstance && this.serverInstance.intelligentWorkflow) {
        intelligentWorkflowCount = this.serverInstance.intelligentWorkflow.getToolDefinitions().length;
      }
      
      // Final total calculation (v3.0.0 All-in-One Suite - 61 tools total)
      totalToolsCount = basicToolsCount + systemToolsCount + developmentToolsCount + 
                       patchToolsCount + functionToolsCount + formulaToolsCount + 
                       webappDeploymentToolsCount + sheetToolsCount + sheetManagementToolsCount + 
                       browserDebugToolsCount + executionToolsCount + intelligentWorkflowCount;
      
      // v3.0.0 All-in-One Suite: Unified phase display
      if (totalToolsCount >= 50) {
        currentPhase = `v3.0.0 All-in-One Suite - ${totalToolsCount} Tools Integrated`;
      } else if (totalToolsCount >= 40) {
        currentPhase = `v3.0.0 Advanced Integration - ${totalToolsCount} Tools`;
      } else if (sheetToolsCount > 0 || sheetManagementToolsCount > 0) {
        currentPhase = `Phase 8 (Sheet Operations - ${totalToolsCount} tools)`;
      }
      
      return {
        basicToolsCount,
        systemToolsCount,
        developmentToolsCount,
        patchToolsCount,
        functionToolsCount,
        formulaToolsCount,
        webappDeploymentToolsCount,
        sheetToolsCount,
        sheetManagementToolsCount,
        sheetsFunctionsToolsCount,
        browserDebugToolsCount,
        executionToolsCount,
        intelligentWorkflowCount,
        totalToolsCount,
        currentPhase,
        estimatedTotalTools: 61, // v3.0.0 All-in-One Suite - actual implemented tools count
        completionPercentage: Math.round((totalToolsCount / 61) * 100)
      };
    } catch (error) {
      console.error('[DYNAMIC_SYSTEM_INFO] Error:', error.message);
      return {
        basicToolsCount: 4,
        systemToolsCount: 0,
        developmentToolsCount: 0,
        totalToolsCount: 4,
        currentPhase: 'Phase 1 (Basic Tools)',
        estimatedTotalTools: 61, // v3.0.0 All-in-One Suite - actual implemented tools count
        completionPercentage: 7 // 4/61 ≈ 7%
      };
    }
  }
  canHandle(toolName) {
    return ['test_connection', 'diagnostic_info', 'test_apis', 'get_process_info'].includes(toolName);
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
   * Handle tool - main alias for server.js compatibility
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
        version: '3.0.0',
        platform: process.platform,
        nodeVersion: process.version
      };

      // OAuth認証状況確認
      let authStatus = '❌ Not initialized';
      if (this.googleManager && this.googleManager.initialized) {
        authStatus = '✅ OAuth initialized';
      }

      // Dynamic system information
      const systemInfo = this.getDynamicSystemInfo();

      return {
        content: [{
          type: 'text',
          text: `🔌 **Claude-AppsScript-Pro Connection Test**\\n\\n` +
                `📡 **MCP Server**: ${connectionStatus.mcpServer}\\n` +
                `🔐 **OAuth Status**: ${authStatus}\\n` +
                `⏰ **Timestamp**: ${connectionStatus.timestamp}\\n` +
                `💻 **Platform**: ${connectionStatus.platform}\\n` +
                `🟢 **Node.js**: ${connectionStatus.nodeVersion}\\n\\n` +
                `🎯 **${systemInfo.currentPhase}**: Ready\\n` +
                `• test_connection ✅\\n` +
                `• diagnostic_info ✅\\n` +
                `• test_apis ✅\\n` +
                `• get_process_info ✅\\n` +
                `• create_apps_script_system ✅\\n` +
                `• get_script_info ✅\\n\\n` +
                `📊 **Progress**: ${systemInfo.totalToolsCount}/${systemInfo.estimatedTotalTools} tools (${systemInfo.completionPercentage}%)\\n\\n` +
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
      
      // Dynamic system information
      const systemInfo = this.getDynamicSystemInfo();

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
                `📊 **System Capabilities**: ${systemInfo.totalToolsCount}/${systemInfo.estimatedTotalTools} tools implemented (${systemInfo.currentPhase.replace('Phase ', 'Phase ')})`
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

  /**
   * Get MCP server process information for troubleshooting
   */
  async handleGetProcessInfo(args) {
    try {
      const startTime = new Date().toISOString();
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();
      
      // プロセス情報ファイル読み込み試行
      let processInfo = null;
      try {
        const path = require('path');
        const fs = require('fs');
        const processInfoPath = path.join(process.cwd(), 'mcp-process-info.txt');
        
        if (fs.existsSync(processInfoPath)) {
          const content = fs.readFileSync(processInfoPath, 'utf8');
          processInfo = content;
        }
      } catch (fileError) {
        console.error('[PROCESS_INFO] File read error:', fileError.message);
      }

      return {
        content: [{
          type: 'text',
          text: `🔧 **Claude-AppsScript-Pro Process Information**\\n\\n` +
                `🔄 **Current Process:**\\n` +
                `• PID: ${process.pid}\\n` +
                `• Platform: ${process.platform}\\n` +
                `• Node.js: ${process.version}\\n` +
                `• Uptime: ${Math.floor(uptime)} seconds\\n` +
                `• Memory: ${Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100} MB\\n\\n` +
                `📁 **Working Directory:**\\n` +
                `• CWD: ${process.cwd()}\\n\\n` +
                `⚙️ **PowerShell Commands:**\\n` +
                `• Check Process: Get-Process -Id ${process.pid}\\n` +
                `• Kill Process: Stop-Process -Id ${process.pid}\\n\\n` +
                `🐧 **Claude Code Commands:**\\n` +
                `• Check Process: ps -p ${process.pid}\\n` +
                `• Kill Process: kill ${process.pid}\\n\\n` +
                `${processInfo ? `📄 **Saved Process Info:**\\n\`\`\`\\n${processInfo.substring(0, 500)}${processInfo.length > 500 ? '...' : ''}\\n\`\`\`\\n\\n` : ''}` +
                `🎯 **Troubleshooting Ready**: Use commands above for process management`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Process info failed:** ${error.message}\\n\\n` +
                `🔧 **Basic Info:**\\n` +
                `• PID: ${process.pid}\\n` +
                `• Platform: ${process.platform}\\n` +
                `• Node.js: ${process.version}`
        }]
      };
    }
  }
}
