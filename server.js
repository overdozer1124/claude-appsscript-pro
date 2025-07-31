#!/usr/bin/env node

/**
 * 🚀 Claude-AppsScript-Pro MCP Server v3.0.0 All-in-One Suite
 * Google Apps Script & Sheets専門の61ツール統合型オールインワン開発スイート
 * 
 * v3.0.0 All-in-One Suite 特徴:
 * - 61核心ツール完全統合（WebApp開発・デプロイメント・ブラウザデバッグ）
 * - AI自律開発システム（intelligent workflow analyzer）
 * - リアルタイムブラウザ制御（Playwright-Core統合）
 * - 99%出力削減効果・Enhanced Patch Tools
 * - Google Workspace完全対応オールインワンプラットフォーム
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import { config } from 'dotenv';

// Core Modules
import { GoogleAPIsManager } from './lib/core/google-apis-manager.js';
import { DiagnosticLogger } from './lib/core/diagnostic-logger.js';

// Handler Modules - Local Enhanced (61ツール構成)
import { BasicToolsHandler } from './lib/handlers/basic-tools.js';
import { SystemToolsHandler } from './lib/handlers/system-tools.js';
import { DevelopmentToolsHandler } from './lib/handlers/development-tools.js';
import { PatchToolsHandler } from './lib/handlers/patch-tools.js';
import { EnhancedPatchToolsHandler } from './lib/handlers/enhanced-patch-tools.js';
import { FunctionToolsHandler } from './lib/handlers/function-tools.js';
import { FormulaToolsHandler } from './lib/handlers/formula-tools.js';
import { WebAppDeploymentToolsHandler } from './lib/handlers/webapp-deployment-tools.js';
import { BrowserDebugTools } from './lib/handlers/browser-debug-tools.js';
import { SheetToolsHandler } from './lib/handlers/sheet-tools.js';
import { SheetManagementHandler } from './lib/handlers/sheet-management-tools.js';
import { ExecutionToolsHandler } from './lib/handlers/execution-tools.js';
import { IntelligentWorkflowHandler } from './lib/handlers/intelligent-workflow-tools.js';

// Load environment variables
config();

/**
 * MCP Server Class - v3.0.0 All-in-One Suite（61ツール・オールインワン版）
 */
class MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'claude-appsscript-pro',
        version: '3.0.0-all-in-one-suite'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Initialize all components (オールインワン版)
    this.googleManager = new GoogleAPIsManager();
    this.logger = new DiagnosticLogger();
    
    // Initialize handlers - All-in-One Suite (61ツール構成)
    this.basicTools = new BasicToolsHandler(this.googleManager, this.logger, this);
    this.systemTools = new SystemToolsHandler(this.googleManager, this.logger);
    this.developmentTools = new DevelopmentToolsHandler(this.googleManager, this.logger);
    this.patchTools = new PatchToolsHandler(this.googleManager, this.logger);
    this.enhancedPatchTools = new EnhancedPatchToolsHandler(this.googleManager, this.logger);
    this.functionTools = new FunctionToolsHandler(this.googleManager, this.logger);
    this.formulaTools = new FormulaToolsHandler(this.googleManager, this.logger);
    this.webappDeploymentTools = new WebAppDeploymentToolsHandler(this.googleManager, this.logger);
    this.browserDebugTools = new BrowserDebugTools(this.googleManager, this.logger);
    this.sheetTools = new SheetToolsHandler(this.googleManager, this.logger);
    this.sheetManagement = new SheetManagementHandler(this.googleManager, this.logger);
    this.executionTools = new ExecutionToolsHandler(this.googleManager, this.logger);
    this.intelligentWorkflow = new IntelligentWorkflowHandler(this.googleManager, this.logger, this);

    // Initialize Google APIs
    this.initializeAPIs();

    // Log process info
    this.logProcessInfo();
    
    // Setup handlers
    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Get basic tools (4個)
      const basicTools = [
        {
          name: 'test_connection',
          description: 'Test MCP connection and OAuth status',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'diagnostic_info',
          description: 'Get detailed OAuth authentication diagnostic information',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'test_apis',
          description: 'Test individual Google API connections and functionality',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        },
        {
          name: 'get_process_info',
          description: '🔧 MCPサーバープロセス情報取得・トラブルシューティング支援',
          inputSchema: {
            type: 'object',
            properties: {},
            required: []
          }
        }
      ];

      // Get all handler tools - All-in-One Suite (61個)
      const systemTools = this.systemTools.getToolDefinitions();
      const developmentTools = this.developmentTools.getToolDefinitions();
      const patchTools = this.patchTools.getToolDefinitions();
      const enhancedPatchTools = this.enhancedPatchTools.getToolDefinitions();
      const functionTools = this.functionTools.getToolDefinitions();
      const formulaTools = this.formulaTools.getToolDefinitions();
      const webappDeploymentTools = this.webappDeploymentTools.getToolDefinitions();
      const browserDebugTools = this.browserDebugTools.getToolDefinitions();
      const sheetTools = this.sheetTools.getToolDefinitions();
      const sheetManagementTools = this.sheetManagement.getToolDefinitions();
      const executionTools = this.executionTools.getToolDefinitions();
      const intelligentWorkflowTools = this.intelligentWorkflow.getToolDefinitions();

      const allTools = [
        ...basicTools, 
        ...systemTools, 
        ...developmentTools, 
        ...patchTools,
        ...enhancedPatchTools,
        ...functionTools, 
        ...formulaTools,
        ...webappDeploymentTools,
        ...browserDebugTools,
        ...sheetTools,
        ...sheetManagementTools,
        ...executionTools,
        ...intelligentWorkflowTools
      ];

      return {
        tools: allTools
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Basic tools
        if (['test_connection', 'diagnostic_info', 'test_apis', 'get_process_info'].includes(name)) {
          return await this.basicTools.handleTool(name, args || {});
        }
        
        // System tools
        if (this.systemTools.canHandle(name)) {
          return await this.systemTools.handleTool(name, args || {});
        }
        
        // Development tools
        if (this.developmentTools.canHandle(name)) {
          return await this.developmentTools.handleTool(name, args || {});
        }
        
        // Patch tools
        if (this.patchTools.canHandle(name)) {
          return await this.patchTools.handleTool(name, args || {});
        }
        
        // Enhanced Patch tools (🚀 革命的パッチシステム)
        if (this.enhancedPatchTools.canHandle(name)) {
          return await this.enhancedPatchTools.handleTool(name, args || {});
        }
        
        // Function tools
        if (this.functionTools.canHandle(name)) {
          return await this.functionTools.handleTool(name, args || {});
        }
        
        // Formula tools
        if (this.formulaTools.canHandle(name)) {
          return await this.formulaTools.handleTool(name, args || {});
        }

        // WebApp deployment tools
        if (this.webappDeploymentTools.canHandle(name)) {
          return await this.webappDeploymentTools.handleTool(name, args || {});
        }

        // Browser debug tools
        if (this.browserDebugTools.canHandle(name)) {
          return await this.browserDebugTools.handleTool(name, args || {});
        }

        // Sheet tools
        if (this.sheetTools.canHandle(name)) {
          return await this.sheetTools.handleTool(name, args || {});
        }

        // Sheet management tools
        if (this.sheetManagement.canHandle(name)) {
          return await this.sheetManagement.handleTool(name, args || {});
        }

        // Execution tools
        if (this.executionTools.canHandle(name)) {
          return await this.executionTools.handleTool(name, args || {});
        }

        // Intelligent Workflow tools
        if (this.intelligentWorkflow.canHandle(name)) {
          return await this.intelligentWorkflow.handleToolCall(name, args || {});
        }
        
        throw new Error(`Unknown tool: ${name}`);
        
      } catch (error) {
        this.logger.error(`Tool execution error for ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error executing ${name}: ${error.message}`
            }
          ]
        };
      }
    });
  }

  /**
   * Initialize Google APIs
   */
  async initializeAPIs() {
    try {
      await this.googleManager.initialize();
      this.logger.info('Google APIs initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google APIs:', error);
    }
  }

  /**
   * Log process information for debugging and monitoring
   */
  logProcessInfo() {
    const startTime = new Date().toISOString();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    
    const processInfo = {
      pid: process.pid,
      startTime: startTime,
      command: process.argv.join(' '),
      workingDir: process.cwd(),
      scriptPath: __filename,
      serverDir: __dirname,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      phase: 'v3.0.0 All-in-One Suite (61 tools - all-in-one features)',
      memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100
    };
    
    // Log to STDERR to avoid STDOUT pollution
    console.error('====================================================');
    console.error('[MCP-PROCESS] Claude-AppsScript-Pro Server v3.0.0 All-in-One Suite');
    console.error('[MCP-PROCESS] PID:', processInfo.pid);
    console.error('[MCP-PROCESS] Start Time:', processInfo.startTime);
    console.error('[MCP-PROCESS] Phase:', processInfo.phase);
    console.error('[MCP-PROCESS] Memory Usage:', processInfo.memoryUsage, 'MB');
    console.error('[MCP-PROCESS] Architecture:', processInfo.architecture);
    console.error('====================================================');
    
    // Save process info to file for troubleshooting
    this.saveProcessInfoToFile(processInfo);
  }

  /**
   * Save process information to file
   */
  async saveProcessInfoToFile(processInfo) {
    try {
      const content = `Claude-AppsScript-Pro MCP Server v3.0.0 All-in-One Suite
${processInfo.phase}
PID: ${processInfo.pid}
Start Time: ${processInfo.startTime}
Command: ${processInfo.command}
Working Dir: ${processInfo.workingDir}
Script Path: ${processInfo.scriptPath}
Server Dir: ${processInfo.serverDir}
Node Version: ${processInfo.nodeVersion}
Platform: ${processInfo.platform}
Architecture: ${processInfo.architecture}
Memory Usage: ${processInfo.memoryUsage} MB

PowerShell Process Check Command:
Get-Process -Id ${processInfo.pid}

Claude Code Process Check Command:
ps -p ${processInfo.pid}

Kill Process Command (if needed):
PowerShell: Stop-Process -Id ${processInfo.pid}
Claude Code: kill ${processInfo.pid}

🎯 v3.0.0 All-in-One Suite Features:
- 61 integrated tools (complete feature set)
- Enhanced Patch Tools (revolutionary anchor-based system)
- WebApp deployment system (6 tools)
- Browser debugging with Playwright-Core (10 tools)
- Complete Sheet operations (18 tools)
- Intelligent Workflow tools (4 tools)
- Execution tools (2 tools)
- AI autonomous development system
- Real-time browser control
- 99% output reduction system
- Fully portable + enhanced architecture
- All-in-One development platform
- Anchor-based patching system
`;
      
      await fs.writeFile('mcp-process-info.txt', content, 'utf8');
      this.logger.info('Process info saved to mcp-process-info.txt');
    } catch (error) {
      this.logger.error('Failed to save process info:', error.message);
    }
  }

  /**
   * Start the MCP server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    this.logger.info('🚀 Claude-AppsScript-Pro MCP Server v3.0.0 All-in-One Suite started successfully');
    this.logger.info('📊 Features: 61 tools, complete integration, AI autonomous development');
    this.logger.info('💡 Ready for enterprise-grade Google Apps Script development with all-in-one features!');
  }
}

// Start the server
const server = new MCPServer();
server.start().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
