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
    this._initializationPromise = null;  // API初期化Promise（競合防止）
    
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

    // Initialize Google APIs（Promiseを保存して後から待機可能にする）
    this._initializationPromise = this.initializeAPIs();

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

      // エイリアスツール定義（旧名称でもClaudeが発見できるように）
      const aliasToolDefs = [
        { name: 'execute_function',      description: '🎯 Apps Script関数実行（execute_script_functionのエイリアス）', inputSchema: { type: 'object', properties: { script_id: { type: 'string' }, function_name: { type: 'string' }, parameters: { type: 'array', items: { type: 'string' } } }, required: ['script_id', 'function_name'] } },
        { name: 'get_sheet_data',        description: 'スプレッドシートデータ取得（read_sheet_dataのエイリアス）',        inputSchema: { type: 'object', properties: { spreadsheet_id: { type: 'string' }, range: { type: 'string' } }, required: ['spreadsheet_id'] } },
        { name: 'update_sheet_data',     description: 'スプレッドシートデータ更新（write_sheet_dataのエイリアス）',        inputSchema: { type: 'object', properties: { spreadsheet_id: { type: 'string' }, range: { type: 'string' }, values: { type: 'array' } }, required: ['spreadsheet_id', 'range', 'values'] } },
        { name: 'get_sheet_info',        description: 'スプレッドシートメタ情報取得（get_spreadsheet_metadataのエイリアス）', inputSchema: { type: 'object', properties: { spreadsheet_id: { type: 'string' } }, required: ['spreadsheet_id'] } },
        { name: 'clear_sheet_data',      description: 'シートデータクリア（update_sheet_rangeのエイリアス）',               inputSchema: { type: 'object', properties: { spreadsheet_id: { type: 'string' }, range: { type: 'string' } }, required: ['spreadsheet_id', 'range'] } },
        { name: 'batch_update_sheet',    description: 'シート一括更新（update_sheet_rangeのエイリアス）',                  inputSchema: { type: 'object', properties: { spreadsheet_id: { type: 'string' }, range: { type: 'string' }, values: { type: 'array' } }, required: ['spreadsheet_id'] } },
        { name: 'apply_patch',           description: 'コードパッチ適用（apply_code_patchのエイリアス）',                  inputSchema: { type: 'object', properties: { script_id: { type: 'string' }, file_name: { type: 'string' }, patch_content: { type: 'string' } }, required: ['script_id', 'file_name', 'patch_content'] } },
        { name: 'apply_anchor_patch',    description: 'アンカーベースパッチ（apply_enhanced_patchのエイリアス）',            inputSchema: { type: 'object', properties: { script_id: { type: 'string' }, file_name: { type: 'string' }, anchored_patches: { type: 'array' } }, required: ['script_id', 'file_name', 'anchored_patches'] } },
        { name: 'smart_patch',           description: 'スマートパッチ（smart_fix_scriptのエイリアス）',                    inputSchema: { type: 'object', properties: { script_id: { type: 'string' }, issue_description: { type: 'string' } }, required: ['script_id', 'issue_description'] } },
        { name: 'multi_patch',           description: '複数パッチ適用（apply_html_patchのエイリアス）',                    inputSchema: { type: 'object', properties: { script_id: { type: 'string' }, file_name: { type: 'string' } }, required: ['script_id', 'file_name'] } },
        { name: 'get_deployments',       description: 'デプロイ一覧取得（list_webapp_deploymentsのエイリアス）',            inputSchema: { type: 'object', properties: { script_id: { type: 'string' } }, required: ['script_id'] } },
        { name: 'update_deployment',     description: 'デプロイ更新（update_webapp_deploymentのエイリアス）',              inputSchema: { type: 'object', properties: { script_id: { type: 'string' }, deployment_id: { type: 'string' } }, required: ['script_id', 'deployment_id'] } },
        { name: 'list_script_files',     description: 'スクリプトファイル一覧（get_script_infoのエイリアス）',              inputSchema: { type: 'object', properties: { script_id: { type: 'string' } }, required: ['script_id'] } },
      ];


      return {
        tools: [...allTools, ...aliasToolDefs]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // ===== ツール名エイリアスマッピング（後方互換性保持） =====
      const TOOL_ALIAS_MAP = {
        // Execution tools
        'execute_function':          'execute_script_function',
        // Sheet tools
        'get_sheet_data':            'read_sheet_data',
        'update_sheet_data':         'write_sheet_data',
        'get_sheet_info':            'get_spreadsheet_metadata',
        'clear_sheet_data':          'update_sheet_range',
        'batch_update_sheet':        'update_sheet_range',
        // Patch tools
        'apply_patch':               'apply_code_patch',
        'apply_anchor_patch':        'apply_enhanced_patch',
        'smart_patch':               'smart_fix_script',
        'multi_patch':               'apply_html_patch',
        // Deployment tools
        'get_deployments':           'list_webapp_deployments',
        'update_deployment':         'update_webapp_deployment',
        'deploy_webapp_version':     'deploy_webapp',
        // Sheet management
        'list_script_files':         'get_script_info',
        'rename_script_file':        'update_script_file',
        'delete_script_file_alias':  'delete_script_file',
        // Script info
        'get_script_info_alias':     'get_script_info',
      };
      const resolvedName = TOOL_ALIAS_MAP[name] || name;
      // ===== エイリアスマッピング終了 =====

      // Google APIs初期化完了を待機（競合防止）
      if (this._initializationPromise) {
        try { await this._initializationPromise; } catch(e) { /* 初期化エラーは各ツールで処理 */ }
      }

      try {
        // Basic tools
        if (['test_connection', 'diagnostic_info', 'test_apis', 'get_process_info'].includes(resolvedName)) {
          return await this.basicTools.handleTool(resolvedName, args || {});
        }
        
        // System tools
        if (this.systemTools.canHandle(resolvedName)) {
          return await this.systemTools.handleTool(resolvedName, args || {});
        }
        
        // Development tools
        if (this.developmentTools.canHandle(resolvedName)) {
          return await this.developmentTools.handleTool(resolvedName, args || {});
        }
        
        // Patch tools
        if (this.patchTools.canHandle(resolvedName)) {
          return await this.patchTools.handleTool(resolvedName, args || {});
        }
        
        // Enhanced Patch tools (🚀 革命的パッチシステム)
        if (this.enhancedPatchTools.canHandle(resolvedName)) {
          return await this.enhancedPatchTools.handleTool(resolvedName, args || {});
        }
        
        // Function tools
        if (this.functionTools.canHandle(resolvedName)) {
          return await this.functionTools.handleTool(resolvedName, args || {});
        }
        
        // Formula tools
        if (this.formulaTools.canHandle(resolvedName)) {
          return await this.formulaTools.handleTool(resolvedName, args || {});
        }

        // WebApp deployment tools
        if (this.webappDeploymentTools.canHandle(resolvedName)) {
          return await this.webappDeploymentTools.handleTool(resolvedName, args || {});
        }

        // Browser debug tools
        if (this.browserDebugTools.canHandle(resolvedName)) {
          return await this.browserDebugTools.handleTool(resolvedName, args || {});
        }

        // Sheet tools
        if (this.sheetTools.canHandle(resolvedName)) {
          return await this.sheetTools.handleTool(resolvedName, args || {});
        }

        // Sheet management tools
        if (this.sheetManagement.canHandle(resolvedName)) {
          return await this.sheetManagement.handleTool(resolvedName, args || {});
        }

        // Execution tools
        if (this.executionTools.canHandle(resolvedName)) {
          return await this.executionTools.handleTool(resolvedName, args || {});
        }

        // Intelligent Workflow tools
        if (this.intelligentWorkflow.canHandle(resolvedName)) {
          return await this.intelligentWorkflow.handleToolCall(resolvedName, args || {});
        }
        
        throw new Error(`Unknown tool: ${resolvedName}`);
        
      } catch (error) {
        this.logger.error(`Tool execution error for ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                tool: name
              }, null, 2)
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
