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
        version: '3.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Initialize Core Services
    this.logger = new DiagnosticLogger();
    this.googleManager = new GoogleAPIsManager();
    
    // Initialize All Handler Modules（61ツール完全統合）
    this.basicTools = new BasicToolsHandler(this.googleManager, this.logger);
    this.systemTools = new SystemToolsHandler(this.googleManager, this.logger);
    this.developmentTools = new DevelopmentToolsHandler(this.googleManager, this.logger);
    this.patchTools = new PatchToolsHandler(this.googleManager, this.logger);
    this.enhancedPatchTools = new EnhancedPatchToolsHandler(this.googleManager, this.logger);
    this.functionTools = new FunctionToolsHandler(this.googleManager, this.logger);
    this.formulaTools = new FormulaToolsHandler(this.googleManager, this.logger);
    this.webAppDeploymentTools = new WebAppDeploymentToolsHandler(this.googleManager, this.logger);
    this.browserDebugTools = new BrowserDebugTools(this.googleManager, this.logger);
    this.sheetTools = new SheetToolsHandler(this.googleManager, this.logger);
    this.sheetManagement = new SheetManagementHandler(this.googleManager, this.logger);
    this.executionTools = new ExecutionToolsHandler(this.googleManager, this.logger);
    this.intelligentWorkflow = new IntelligentWorkflowHandler(this.googleManager, this.logger);

    // Collect all handlers（61ツール統合配列）
    this.handlers = [
      this.basicTools,
      this.systemTools, 
      this.developmentTools,
      this.patchTools,
      this.enhancedPatchTools,
      this.functionTools,
      this.formulaTools,
      this.webAppDeploymentTools,
      this.browserDebugTools,
      this.sheetTools,
      this.sheetManagement,
      this.executionTools,
      this.intelligentWorkflow
    ];

    this.setupHandlers();
    this.logProcessInfo();
  }

  /**
   * プロセス情報出力（MCPサーバー情報）
   */
  logProcessInfo() {
    const startTime = new Date().toISOString();
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    // 出力：詳細プロセス情報（STDERR使用でSTDOUT汚染回避）
    console.error('====================================================');
    console.error('[MCP-PROCESS] Claude-AppsScript-Pro Server v3.0.0');
    console.error('====================================================');
    console.error('[MCP-PROCESS] PID:', process.pid);
    console.error('[MCP-PROCESS] Start Time:', startTime);
    console.error('[MCP-PROCESS] Command:', process.argv[0], __filename);
    console.error('[MCP-PROCESS] Working Dir:', process.cwd());
    console.error('[MCP-PROCESS] Script Path:', __filename);
    console.error('[MCP-PROCESS] Node Version:', process.version);
    console.error('[MCP-PROCESS] Platform:', process.platform);
    console.error('[MCP-PROCESS] Architecture:', process.arch);
    console.error('[MCP-PROCESS] Phase: All-in-One Suite (61 tools implemented)');
    console.error('====================================================');

    // mcp-process-info.txtファイル生成
    this.saveProcessInfoToFile(startTime);
  }

  /**
   * プロセス情報をファイルに保存
   */
  async saveProcessInfoToFile(startTime) {
    try {
      const processInfo = `Claude-AppsScript-Pro MCP Server v3.0.0
Phase: All-in-One Suite (61 tools implemented)
PID: ${process.pid}
Start Time: ${startTime}
Command: ${process.argv[0]} ${fileURLToPath(import.meta.url)}
Working Dir: ${process.cwd()}
Script Path: ${fileURLToPath(import.meta.url)}
Server Dir: ${dirname(fileURLToPath(import.meta.url))}
Node Version: ${process.version}
Platform: ${process.platform}
Architecture: ${process.arch}

PowerShell Process Check Command:
Get-Process -Id ${process.pid}

Claude Code Process Check Command:
ps -p ${process.pid}

Kill Process Command (if needed):
PowerShell: Stop-Process -Id ${process.pid}
Claude Code: kill ${process.pid}
`;

      await fs.writeFile('mcp-process-info.txt', processInfo, 'utf8');
      console.error('[MCP-PROCESS] Process info saved to mcp-process-info.txt');
    } catch (error) {
      console.error('[MCP-PROCESS] Failed to save process info:', error.message);
    }
  }

  setupHandlers() {
    // List Tools Handler（61ツール定義）
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const allTools = [];
      
      // 全ハンドラーからツール定義を収集
      for (const handler of this.handlers) {
        if (handler.getToolDefinitions) {
          const tools = handler.getToolDefinitions();
          allTools.push(...tools);
        }
      }

      return {
        tools: allTools
      };
    });

    // Call Tool Handler（61ツール実行ルーティング）
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name: toolName, arguments: args } = request.params;
      
      try {
        // ツール名に基づいてハンドラーを特定し実行
        for (const handler of this.handlers) {
          if (handler.canHandle && handler.canHandle(toolName)) {
            this.logger.info(`Executing tool: ${toolName}`);
            const result = await handler.handle(toolName, args || {});
            this.logger.info(`Tool execution completed: ${toolName}`);
            return {
              content: [
                {
                  type: "text",
                  text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
                }
              ],
              isError: false
            };
          }
        }

        // ハンドラーが見つからない場合
        throw new Error(`Unknown tool: ${toolName}`);
        
      } catch (error) {
        this.logger.error(`Tool execution failed: ${toolName}`, error);
        return {
          content: [
            {
              type: "text", 
              text: `Error executing ${toolName}: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    this.logger.info('🚀 Claude-AppsScript-Pro MCP Server v3.0.0 All-in-One Suite starting...');
    this.logger.info('📊 61 tools integrated for Google Apps Script & Sheets development');
    await this.server.connect(transport);
    this.logger.info('✅ MCP Server running successfully');
  }
}

// Initialize and run server
const server = new MCPServer();
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
