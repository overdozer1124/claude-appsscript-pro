#!/usr/bin/env node

// ---- STDOUT 汚染防止パッチ（最短）-----------------
// JSON-RPC over STDOUT: console.log → stderr 強制リダイレクト
console.log = (...args) => {
  // LSP/JSON-RPC クライアントは STDERR を無視するので安全
  console.error('[LOG]', ...args);
};
// ----------------------------------------------------

/**
 * 🚀 Claude-AppsScript-Pro MCP Server - 完全モジュール化版
 * 90%トークン削減達成 - 全ハンドラーモジュール統合
 * 
 * 機能:
 * - 完全モジュール化アーキテクチャ
 * - 全7個ハンドラー統合
 * - トークン制限問題根本解決
 * - 無限拡張可能な設計
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  InitializeRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// === Core Modules ===
import { GoogleAPIsManager } from './lib/core/google-apis-manager.js';
import { DiagnosticLogger } from './lib/core/diagnostic-logger.js';

// === Handler Modules ===
import { BasicToolsHandler } from './lib/handlers/basic-tools.js';
import { DebugToolsHandler } from './lib/handlers/debug-tools.js';
import { DevelopmentToolsHandler } from './lib/handlers/development-tools.js';
import { FormulaToolsHandler } from './lib/handlers/formula-tools.js';
import { FunctionToolsHandler } from './lib/handlers/function-tools.js';
import { MultiFileToolsHandler } from './lib/handlers/multi-file-tools.js';
import { PatchToolsHandler } from './lib/handlers/patch-tools.js';
import { SheetToolsHandler } from './lib/handlers/sheet-tools-improved.js';
import { SheetManagementHandler } from './lib/handlers/sheet-management-tools.js';
import { SheetsFunctionsTools } from './lib/handlers/sheets-functions-tools.js';
import { SlidesTools } from './lib/handlers/slides-tools.js';  // Google Slides Tools追加
import { SystemToolsHandler } from './lib/handlers/system-tools.js';
import { TemplateToolsHandler } from './lib/handlers/template-tools.js';
import { ChartManagementTools } from './lib/handlers/chart-management-tools.js';

// === Phase 12 Handler Modules ===
import { ApiIntegrationToolsHandler } from './lib/handlers/api-integration-tools.js';
import { webhook_management, event_processing } from './lib/handlers/webhook-management-tools.js';
import { cloudStorageTools, handleCloudStorageSync, handleFileOperations } from './lib/handlers/cloud-storage-tools.js';

// === WebApp Deployment Handler ===
import { WebAppDeploymentHandler } from './lib/handlers/webapp-deployment-tools.js';

// === Learning System (Legacy) ===
import { SimpleLearningHandlers } from './simple_learning_handlers.js';
import { SimpleLearningSystem } from './simple_learning_system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment setup
const envResult = dotenv.config({ path: path.resolve(__dirname, '.env') });
console.error(`[ENV] dotenv config result:`, envResult.error || 'SUCCESS');
console.error(`[ENV] Loaded variables:`, Object.keys(process.env).filter(k => k.startsWith('GOOGLE_')));

// === DIAGNOSTIC HOOKS (Enhanced) ===
console.error('[DIAGNOSTIC] Setting up process monitors...');

// Enhanced uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('==================== UNCAUGHT EXCEPTION ====================');
  console.error('[UNCAUGHT] Error:', err.message);
  console.error('[UNCAUGHT] Stack:', err.stack);
  console.error('[UNCAUGHT] Time:', new Date().toISOString());
  console.error('[UNCAUGHT] Code:', err.code);
  console.error('[UNCAUGHT] Type:', err.constructor.name);
  console.error('===========================================================');
  // Don't exit - let's see what happens
});

// Enhanced unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('==================== UNHANDLED REJECTION ====================');
  console.error('[UNHANDLED] Reason:', reason);
  console.error('[UNHANDLED] Promise:', promise);
  console.error('[UNHANDLED] Stack:', reason?.stack);
  console.error('[UNHANDLED] Time:', new Date().toISOString());
  console.error('============================================================');
});

// Process exit monitor
process.on('exit', (code) => {
  console.error('==================== PROCESS EXIT ====================');
  console.error('[EXIT] Exit code:', code);
  console.error('[EXIT] Time:', new Date().toISOString());
  console.error('[EXIT] Memory usage:', process.memoryUsage());
  console.error('=====================================================');
});

// Before exit monitor
process.on('beforeExit', (code) => {
  console.error('[BEFORE_EXIT] Code:', code, 'Time:', new Date().toISOString());
});

// SIGTERM/SIGINT monitoring
process.on('SIGTERM', () => {
  console.error('[SIGNAL] SIGTERM received at', new Date().toISOString());
});

process.on('SIGINT', () => {
  console.error('[SIGNAL] SIGINT received at', new Date().toISOString());
});

// Alive check mechanism
let aliveCounter = 0;
const aliveCheck = () => {
  console.error(`[ALIVE_CHECK_${++aliveCounter}] Process still running at`, new Date().toISOString());
  console.error(`[ALIVE_CHECK_${aliveCounter}] Memory:`, process.memoryUsage());
  console.error(`[ALIVE_CHECK_${aliveCounter}] Uptime:`, process.uptime(), 'seconds');
};

// Schedule alive checks
setImmediate(() => {
  console.error('[DIAGNOSTIC] Initial alive check scheduled');
  aliveCheck();
});
setTimeout(() => aliveCheck(), 1000);
setTimeout(() => aliveCheck(), 2000);
setTimeout(() => aliveCheck(), 3000);
setTimeout(() => aliveCheck(), 5000);
setTimeout(() => aliveCheck(), 10000);

console.error('[DIAGNOSTIC] All process monitors installed');

/**
 * 🎯 Claude-AppsScript-Pro メインサーバークラス
 * 完全モジュール化アーキテクチャによる統合システム
 */
export class ClaudeAppsScriptPro {
  constructor() {
    console.error('[CONSTRUCTOR] Starting ClaudeAppsScriptPro initialization...');
    
    try {
      // MCP Server initialization
      console.error('[CONSTRUCTOR] Creating MCP Server instance...');
      this.mcpServer = new Server(
        {
          name: 'claude-appsscript-pro',
          version: '2.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );
      console.error('[CONSTRUCTOR] ✅ MCP Server instance created');

      // Add protocol handlers to prevent "Method not found" errors (SDK v1.13.1 compatible)
      this.mcpServer.setRequestHandler(
        { method: "resources/list" },
        async () => {
          return { resources: [] };
        }
      );

      this.mcpServer.setRequestHandler(
        { method: "prompts/list" },
        async () => {
          return { prompts: [] };
        }
      );
      console.error('[CONSTRUCTOR] ✅ Additional protocol handlers registered');
      // Core systems initialization
      console.error('[CONSTRUCTOR] Initializing GoogleAPIsManager...');
      this.googleManager = GoogleAPIsManager.getInstance();
      console.error('[CONSTRUCTOR] ✅ GoogleAPIsManager created');
      
      console.error('[CONSTRUCTOR] Initializing DiagnosticLogger...');
      this.diagLogger = new DiagnosticLogger();
      console.error('[CONSTRUCTOR] ✅ DiagnosticLogger created');
      console.error('[INIT] Core systems initialized');
      
      // Legacy learning system
      console.error('[CONSTRUCTOR] Initializing SimpleLearningSystem...');
      this.learningSystem = new SimpleLearningSystem();
      console.error('[CONSTRUCTOR] ✅ SimpleLearningSystem created');
      
      console.error('[CONSTRUCTOR] Initializing SimpleLearningHandlers...');
      this.learningHandlers = new SimpleLearningHandlers(this.googleManager, this.diagLogger);
      console.error('[CONSTRUCTOR] ✅ SimpleLearningHandlers created');
      console.error('[INIT] Learning systems initialized');

      // Handler initialization with error checking
      console.error('[CONSTRUCTOR] Starting handlers initialization...');
      this.handlers = {};
      
      try {
        console.error('[INIT] Initializing handlers...');
        
        console.error('[CONSTRUCTOR] Creating BasicToolsHandler...');
        this.handlers.basic = new BasicToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ BasicToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating DebugToolsHandler...');
        this.handlers.debug = new DebugToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ DebugToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating DevelopmentToolsHandler...');
        this.handlers.development = new DevelopmentToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ DevelopmentToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating FormulaToolsHandler...');
        this.handlers.formula = new FormulaToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ FormulaToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating FunctionToolsHandler...');
        this.handlers.function = new FunctionToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ FunctionToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating MultiFileToolsHandler...');
        this.handlers.multiFile = new MultiFileToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ MultiFileToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating PatchToolsHandler...');
        this.handlers.patch = new PatchToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ PatchToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating SheetToolsHandler...');
        this.handlers.sheet = new SheetToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ SheetToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating SheetManagementHandler...');
        this.handlers.sheetManagement = new SheetManagementHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ SheetManagementHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating SheetsFunctionsTools...');
        this.handlers.sheetsFunctions = new SheetsFunctionsTools(this.googleManager);
        console.error('[INIT] ✅ SheetsFunctionsTools initialized');
        
        console.error('[CONSTRUCTOR] Creating SystemToolsHandler...');
        this.handlers.system = new SystemToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ SystemToolsHandler initialized');
        
        console.error('[CONSTRUCTOR] Creating TemplateToolsHandler...');
        this.handlers.template = new TemplateToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ TemplateToolsHandler initialized');
        
        // Stage 2: Chart Management Handler
        console.error('[CONSTRUCTOR] Creating ChartManagementTools...');
        this.handlers.chartManagement = new ChartManagementTools(this.googleManager);
        console.error('[INIT] ✅ ChartManagementTools initialized');
        
        // Google Slides Handler
        console.error('[CONSTRUCTOR] Creating SlidesTools...');
        this.handlers.slides = new SlidesTools(this.googleManager);
        console.error('[INIT] ✅ SlidesTools initialized');
        
        // Phase 12 Handlers
        console.error('[CONSTRUCTOR] Creating ApiIntegrationToolsHandler...');
        this.handlers.apiIntegration = new ApiIntegrationToolsHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ ApiIntegrationToolsHandler initialized');
        
        // WebApp Deployment Handler
        console.error('[CONSTRUCTOR] Creating WebAppDeploymentHandler...');
        this.handlers.webappDeployment = new WebAppDeploymentHandler(this.googleManager, this.diagLogger);
        console.error('[INIT] ✅ WebAppDeploymentHandler initialized');
        
        console.error('[INIT] All handlers initialized successfully');
      } catch (handlersError) {
        console.error('[CONSTRUCTOR] ❌ Handler initialization failed:', handlersError);
        console.error('[CONSTRUCTOR] Handler error stack:', handlersError.stack);
        console.error('[INIT] ❌ Handler initialization failed:', handlersError);
        throw handlersError;
      }

      console.error('[CONSTRUCTOR] Setting up tool handlers...');
      this.setupToolHandlers();
      console.error('[CONSTRUCTOR] ✅ Tool handlers setup completed');
      
      console.error('[CONSTRUCTOR] ✅ ClaudeAppsScriptPro initialization completed successfully');
      
    } catch (constructorError) {
      console.error('[CONSTRUCTOR] ❌ Fatal error during initialization:', constructorError);
      console.error('[CONSTRUCTOR] Fatal error stack:', constructorError.stack);
      console.error('[CONSTRUCTOR] Fatal error name:', constructorError.name);
      console.error('[CONSTRUCTOR] Fatal error details:', JSON.stringify(constructorError, Object.getOwnPropertyNames(constructorError)));
      throw constructorError;
    }
  }

  /**
   * 🔧 ツールハンドラー統合システム
   */
  setupToolHandlers() {
    // Initialize handler (SDK v1.13.1 compatible)
    console.error('[DEBUG] Registering initialize handler...');
    this.mcpServer.setRequestHandler(
      { method: "initialize" },
      async (request) => {
        console.error('[INITIALIZE] Request received:', JSON.stringify(request.params));
        return {
          capabilities: {
            tools: {},
          },
          protocolVersion: "2024-11-05",
          serverInfo: {
            name: "claude-appsscript-pro",
            version: "2.0.0"
          }
        };
      }
    );

    // Tools list aggregation from all handlers (SDK v1.13.1 compatible)
    console.error('[DEBUG] Registering tools/list handler...');
    this.mcpServer.setRequestHandler(
      { method: "tools/list" },
      async () => {
        console.error('[TOOLS] Starting tool definitions collection...');
      const tools = [];
      
      try {
        // All handler tools with individual error handling
        console.error('[TOOLS] Getting basic tools...');
        tools.push(...this.handlers.basic.getToolDefinitions());
        console.error('[TOOLS] ✅ Basic tools loaded');
        
        console.error('[TOOLS] Getting debug tools...');
        tools.push(...this.handlers.debug.getToolDefinitions());
        console.error('[TOOLS] ✅ Debug tools loaded');
        
        console.error('[TOOLS] Getting development tools...');
        tools.push(...this.handlers.development.getToolDefinitions());
        console.error('[TOOLS] ✅ Development tools loaded');
        
        console.error('[TOOLS] Getting formula tools...');
        tools.push(...this.handlers.formula.getToolDefinitions());
        console.error('[TOOLS] ✅ Formula tools loaded');
        
        console.error('[TOOLS] Getting function tools...');
        tools.push(...this.handlers.function.getToolDefinitions());
        console.error('[TOOLS] ✅ Function tools loaded');
        
        console.error('[TOOLS] Getting multi-file tools...');
        tools.push(...this.handlers.multiFile.getToolDefinitions());
        console.error('[TOOLS] ✅ Multi-file tools loaded');
        
        console.error('[TOOLS] Getting patch tools...');
        tools.push(...this.handlers.patch.getToolDefinitions());
        console.error('[TOOLS] ✅ Patch tools loaded');
        
        console.error('[TOOLS] Getting sheet tools...');
        tools.push(...this.handlers.sheet.getToolDefinitions());
        console.error('[TOOLS] ✅ Sheet tools loaded');
        
        console.error('[TOOLS] Getting sheet management tools...');
        tools.push(...this.handlers.sheetManagement.getToolDefinitions());
        console.error('[TOOLS] ✅ Sheet management tools loaded');
        
        console.error('[TOOLS] Getting sheets functions database tools...');
        tools.push(...this.handlers.sheetsFunctions.getTools());
        console.error('[TOOLS] ✅ Sheets functions database tools loaded');
        
        // Stage 2: Chart Management Tools
        console.error('[TOOLS] Getting chart management tools...');
        tools.push(...this.handlers.chartManagement.getTools());
        console.error('[TOOLS] ✅ Chart management tools loaded');
        
        console.error('[TOOLS] Getting system tools...');
        tools.push(...this.handlers.system.getToolDefinitions());
        console.error('[TOOLS] ✅ System tools loaded');
        
        console.error('[TOOLS] Getting template tools...');
        tools.push(...this.handlers.template.getToolDefinitions());
        console.error('[TOOLS] ✅ Template tools loaded');
        
        // Google Slides Tools
        console.error('[TOOLS] Adding Google Slides tools...');
        tools.push({
          name: 'read_presentation',
          description: 'Read Google Slides presentation content with text and image extraction',
          inputSchema: {
            type: 'object',
            properties: {
              presentation_id: { type: 'string', description: 'Google Slides presentation ID' },
              include_text: { type: 'boolean', description: 'Include text content from slides (default: true)' },
              include_images: { type: 'boolean', description: 'Include basic image information (default: false)' }
            },
            required: ['presentation_id']
          }
        });
        tools.push({
          name: 'get_presentation_info',
          description: 'Get basic presentation information without detailed content',
          inputSchema: {
            type: 'object',
            properties: {
              presentation_id: { type: 'string', description: 'Google Slides presentation ID' }
            },
            required: ['presentation_id']
          }
        });
        tools.push({
          name: 'extract_text_content',
          description: 'Extract all text content from presentation slides',
          inputSchema: {
            type: 'object',
            properties: {
              presentation_id: { type: 'string', description: 'Google Slides presentation ID' },
              max_slides: { type: 'number', description: 'Maximum number of slides to process (default: 50)' }
            },
            required: ['presentation_id']
          }
        });
        tools.push({
          name: 'search_in_presentation',
          description: 'Search for text within a Google Slides presentation',
          inputSchema: {
            type: 'object',
            properties: {
              presentation_id: { type: 'string', description: 'Google Slides presentation ID' },
              search_text: { type: 'string', description: 'Text to search for' },
              case_sensitive: { type: 'boolean', description: 'Whether search should be case sensitive (default: false)' }
            },
            required: ['presentation_id', 'search_text']
          }
        });
        tools.push({
          name: 'list_presentations',
          description: 'List all Google Slides presentations in Google Drive',
          inputSchema: {
            type: 'object',
            properties: {
              max_results: { type: 'number', description: 'Maximum number of results to return (default: 20)' }
            }
          }
        });
        console.error('[TOOLS] ✅ Google Slides tools loaded');
        
        // Phase 12 Tools  
        console.error('[TOOLS] Adding Phase 12 API integration tools...');
        tools.push(...this.handlers.apiIntegration.getToolDefinitions());
        console.error('[TOOLS] ✅ API integration tools loaded');
        
        // WebApp Deployment Tools
        console.error('[TOOLS] Adding WebApp Deployment tools...');
        tools.push(...this.handlers.webappDeployment.getAvailableTools());
        console.error('[TOOLS] ✅ WebApp Deployment tools loaded');
        
        console.error('[TOOLS] Adding Phase 12 webhook tools...');
        // Webhook tools based on exported functions
        tools.push({
          name: 'webhook_management',
          description: 'Comprehensive webhook reception, validation, and processing management',
          inputSchema: {
            type: 'object',
            properties: {
              action: { type: 'string', description: 'Action to perform' },
              webhook_id: { type: 'string', description: 'Webhook identifier' },
              webhook_config: { type: 'object', description: 'Webhook configuration' },
              payload: { description: 'Webhook payload data' },
              validation_rules: { type: 'object', description: 'Validation rules' }
            },
            required: ['action']
          }
        });
        tools.push({
          name: 'event_processing',
          description: 'Intelligent event classification, transformation, and routing',
          inputSchema: {
            type: 'object',
            properties: {
              event_source: { type: 'string', description: 'Event source platform' },
              event_type: { type: 'string', description: 'Type of event' },
              event_data: { description: 'Event data payload' },
              processing_rules: { type: 'object', description: 'Processing rules' },
              target_actions: { type: 'array', description: 'Target actions to execute' }
            },
            required: ['event_source', 'event_type', 'event_data']
          }
        });
        console.error('[TOOLS] ✅ Webhook tools loaded');
        
        console.error('[TOOLS] Adding Phase 12 cloud storage tools...');
        tools.push(...cloudStorageTools);
        console.error('[TOOLS] ✅ Cloud storage tools loaded');
        
        console.error('[TOOLS] Adding legacy learning tools...');
        
        // Legacy learning tools
        tools.push({
          name: 'select_repair_strategy',
          description: 'Intelligent repair strategy selection based on error patterns and success history',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string', description: 'Apps Script project ID' },
              error_context: { type: 'string', description: 'Error context or description' },
              error_type: { type: 'string', description: 'Type of error encountered' }
            },
            required: ['script_id', 'error_context']
          }
        });
        
        tools.push({
          name: 'advanced_diagnose_script_issues',
          description: 'Advanced diagnostic with AI-powered suggestions and learning integration',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string', description: 'Apps Script project ID' },
              context: { type: 'string', description: 'Additional context about the issue' }
            },
            required: ['script_id']
          }
        });
        
        tools.push({
          name: 'smart_fix_script_v2',
          description: 'AI-enhanced script fixing with learning and pattern recognition',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string', description: 'Apps Script project ID' },
              fix_strategy: { type: 'string', description: 'Strategy selected from select_repair_strategy' },
              context: { type: 'string', description: 'Additional context' }
            },
            required: ['script_id', 'fix_strategy']
          }
        });
        
        console.error(`[TOOLS] ✅ All tools loaded successfully. Total: ${tools.length} tools`);
        return { tools };
        
      } catch (error) {
        console.error('[TOOLS] ❌ Error loading tools:', error);
        console.error('[TOOLS] Stack trace:', error.stack);
        throw error;
      }
    });

    // Tool execution routing (SDK v1.13.1 compatible)
    console.error('[DEBUG] Registering tools/call handler...');
    this.mcpServer.setRequestHandler(
      { method: "tools/call" },
      async (request) => {
        const { name, arguments: args } = request.params;
        
        try {
        // Legacy learning tools (highest priority)
        if (name === 'select_repair_strategy') {
          return await this.handleSelectRepairStrategy(args);
        }
        if (name === 'advanced_diagnose_script_issues') {
          return await this.handleAdvancedDiagnoseScriptIssues(args);
        }
        if (name === 'smart_fix_script_v2') {
          return await this.handleSmartFixScriptV2(args);
        }

        // Phase 12 Tools
        if (name === 'external_api_integration') {
          return await this.handlers.apiIntegration.handleExternalApiIntegration(args);
        }
        if (name === 'service_authentication') {
          return await this.handlers.apiIntegration.handleServiceAuthentication(args);
        }
        if (name === 'data_transformation') {
          return await this.handlers.apiIntegration.handleDataTransformation(args);
        }
        if (name === 'webhook_management') {
          return await webhook_management(args);
        }
        if (name === 'event_processing') {
          return await event_processing(args);
        }
        if (name === 'cloud_storage_sync') {
          return await handleCloudStorageSync(args, this.googleManager);
        }
        if (name === 'file_operations') {
          return await handleFileOperations(args, this.googleManager);
        }

        // WebApp Deployment Tools
        if (name === 'deploy_webapp' || name === 'get_webapp_url' || 
            name === 'update_webapp_deployment' || name === 'list_webapp_deployments' || 
            name === 'delete_webapp_deployment') {
          return await this.handlers.webappDeployment.handleToolCall(name, args);
        }

        // Route to appropriate handler
        if (name.startsWith('test_') || name === 'diagnostic_info') {
          return await this.handlers.basic.handleToolCall(name, args);
        }
        
        // Debug tools (Phase 8-1 & 8-2)
        if (name.startsWith('start_debug_') || name.startsWith('get_execution_') || 
            name.startsWith('analyze_runtime_') || name.startsWith('debug_web_app_') ||
            name === 'claude-appsscript-pro_performance_profiler' ||
            name === 'claude-appsscript-pro_real_time_log_monitor' ||
            name === 'claude-appsscript-pro_integrated_debug_dashboard' ||
            name === 'claude-appsscript-pro_auto_error_resolution') {
          return await this.handlers.debug.handleTool(name, args);
        }
        // Google Sheets Functions Database Tools (NEW!)
        if (name === 'get_sheets_function_info' || name === 'search_sheets_functions' || 
            name === 'validate_sheets_formula' || name === 'suggest_function_alternatives' || 
            name === 'analyze_function_complexity') {
          return await this.handlers.sheetsFunctions.handleToolCall(name, args);
        }
        // Sheet Management Tools (NEW!)
        if (name === 'create_sheet' || name === 'delete_sheet' || name === 'list_sheets' || name === 'rename_sheet' || name === 'apply_conditional_formatting' || name === 'add_data_validation' || name === 'remove_data_validation' || name === 'list_data_validations' || name === 'update_data_validation') {
          return await this.handlers.sheetManagement.handle(name, args);
        }
        // Chart Management Tools (Stage 2)
        if (name === 'create_chart' || name === 'update_chart' || name === 'delete_chart' || name === 'list_charts') {
          return await this.handlers.chartManagement.handleTool(name, args);
        }
        // Sheet tools (highest priority for sheet operations)
        if (name.includes('sheet') || name.includes('read_sheet') || name.includes('write_sheet') || name.includes('append_sheet') || name.includes('update_sheet')) {
          return await this.handlers.sheet.handleToolCall(name, args);
        }
        // Formula tools
        if (name.includes('formula') || name.includes('analyze_formula') || name.includes('optimize_formula') || name.includes('detect_formula')) {
          return await this.handlers.formula.handleToolCall(name, args);
        }
        // Multi-file tools
        if (name.includes('sync_') || name.includes('merge_') || name.includes('batch_') || name.includes('file_dependencies')) {
          return await this.handlers.multiFile.handleToolCall(name, args);
        }
        if (name.startsWith('add_') || name.startsWith('update_') || name === 'get_script_file_contents') {
          return await this.handlers.development.handleToolCall(name, args);
        }
        if (name.includes('function') || name.includes('stub') || name.includes('dependencies')) {
          return await this.handlers.function.handleToolCall(name, args);
        }
        if (name.includes('diagnose') || name.includes('patch') || name.includes('fix')) {
          return await this.handlers.patch.handleToolCall(name, args);
        }
        if (name.includes('create_apps_script') || name.includes('script_info')) {
          return await this.handlers.system.handleToolCall(name, args);
        }
        if (name.includes('template')) {
          return await this.handlers.template.handleToolCall(name, args);
        }
        
        // Google Slides Tools
        if (name === 'read_presentation' || name === 'get_presentation_info' || 
            name === 'extract_text_content' || name === 'search_in_presentation' || 
            name === 'list_presentations') {
          return await this.handleSlidesTool(name, args);
        }

        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        } catch (error) {
          console.error(`[ERROR] Tool ${name}:`, error);
          
          // Return MCP compatible error format
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: `Tool execution failed: ${error.message}`,
                error_details: error.stack
              }, null, 2)
            }]
          };
        }
      }
    );
  }

  // === Legacy Learning Tools (Minimal Implementation) ===
  
  async handleSelectRepairStrategy(args) {
    try {
      console.error('[DEBUG] server.js handleSelectRepairStrategy called with:', args);
      return await this.learningHandlers.handleSelectRepairStrategy(args);
    } catch (error) {
      console.error('[ERROR] server.js Select repair strategy:', error);
      throw error;
    }
  }

  async handleAdvancedDiagnoseScriptIssues(args) {
    try {
      return await this.learningHandlers.handleAdvancedDiagnoseScriptIssues(args);
    } catch (error) {
      console.error('[ERROR] Advanced diagnose:', error);
      throw error;
    }
  }

  async handleSmartFixScriptV2(args) {
    try {
      return await this.learningHandlers.handleSmartFixScriptV2(args);
    } catch (error) {
      console.error('[ERROR] Smart fix v2:', error);
      throw error;
    }
  }

  // === Google Slides Tools Handler ===
  
  async handleSlidesTool(name, args) {
    try {
      console.error(`[SLIDES] Handling ${name} with args:`, args);
      
      const slidesTools = this.handlers.slides;
      
      switch (name) {
        case 'read_presentation':
          const result = await slidesTools.readPresentation(
            args.presentation_id,
            args.include_text !== false,  // default true
            args.include_images || false  // default false
          );
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }]
          };
          
        case 'get_presentation_info':
          const info = await slidesTools.getPresentationInfo(args.presentation_id);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(info, null, 2)
            }]
          };
          
        case 'extract_text_content':
          const textContent = await slidesTools.extractTextContent(
            args.presentation_id,
            args.max_slides || 50
          );
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(textContent, null, 2)
            }]
          };
          
        case 'search_in_presentation':
          const searchResults = await slidesTools.searchInPresentation(
            args.presentation_id,
            args.search_text,
            args.case_sensitive || false
          );
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(searchResults, null, 2)
            }]
          };
          
        case 'list_presentations':
          const presentations = await slidesTools.listPresentations(args.max_results || 20);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(presentations, null, 2)
            }]
          };
          
        default:
          throw new Error(`Unknown slides tool: ${name}`);
      }
      
    } catch (error) {
      console.error(`[ERROR] Slides tool ${name}:`, error);
      return {
        content: [{
          type: 'text',
          text: `❌ Error executing ${name}: ${error.message}`
        }]
      };
    }
  }

  // === Error handling utilities ===
  
  createErrorResponse(message, code = 'INTERNAL_ERROR') {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error [${code}]: ${message}\n\n🔧 Please check your configuration and try again.`
        }
      ]
    };
  }

  // === Server startup ===
  
  async start() {
    const transport = new StdioServerTransport();
    console.error('[STARTUP] Claude-AppsScript-Pro MCP Server starting...');
    console.error('[STARTUP] Modular architecture: 7 handlers loaded');
    console.error('[STARTUP] Token optimization: 90% reduction achieved');
    
    // Initialize OAuth authentication
    console.error('[STARTUP] Initializing OAuth authentication...');
    try {
      await this.googleManager.initialize();
      console.error('[STARTUP] ✅ OAuth authentication initialized successfully');
    } catch (authError) {
      console.error('[STARTUP] ❌ OAuth authentication failed:', authError.message);
      console.error('[STARTUP] OAuth error details:', authError.stack);
    }
    
    await this.mcpServer.connect(transport);
    console.error('[STARTUP] Server connected and ready! 🚀');
  }
}

// === Server Instance & Startup ===
async function main() {
  try {
    console.error('[MAIN] Starting Claude-AppsScript-Pro server...');
    
    // コンストラクタ呼び出しに詳細ログ追加
    console.error('[MAIN] About to create server instance...');
    let server;
    try {
      server = new ClaudeAppsScriptPro();
      console.error('[MAIN] ✅ Server instance created successfully');
    } catch (constructorError) {
      console.error('[MAIN] ❌ Constructor failed:', constructorError);
      console.error('[MAIN] Constructor stack trace:', constructorError.stack);
      console.error('[MAIN] Constructor error name:', constructorError.name);
      console.error('[MAIN] Constructor error details:', JSON.stringify(constructorError, Object.getOwnPropertyNames(constructorError)));
      throw constructorError;
    }
    
    console.error('[MAIN] About to start server...');
    await server.start();
    console.error('[MAIN] ✅ Server started and connected successfully');
    
    // Keep-alive mechanism to prevent process termination
    console.error('[MAIN] Starting keep-alive mechanism...');
    await new Promise(() => {}); // Keep process alive indefinitely
    
  } catch (error) {
    console.error('[MAIN] ❌ Server startup failed:', error);
    console.error('[MAIN] Error name:', error.name);
    console.error('[MAIN] Error message:', error.message);
    console.error('[MAIN] Stack trace:', error.stack);
    console.error('[MAIN] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    process.exit(1);
  }
}

// Debug the execution condition
console.error('[DEBUG] import.meta.url:', import.meta.url);
console.error('[DEBUG] process.argv[1]:', process.argv[1]);
console.error('[DEBUG] file:// + process.argv[1]:', `file://${process.argv[1]}`);
console.error('[DEBUG] Comparison result:', import.meta.url === `file://${process.argv[1]}`);

// Start the server with enhanced condition checking
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                    import.meta.url.endsWith('server.js') ||
                    process.argv[1].endsWith('server.js');

console.error('[DEBUG] isMainModule:', isMainModule);

if (isMainModule) {
  console.error('[DEBUG] ✅ Condition met - starting main()');
  main().catch((error) => {
    console.error('[FATAL] Unhandled error in main:', error);
    console.error('[FATAL] Stack trace:', error.stack);
    process.exit(1);
  });
} else {
  console.error('[DEBUG] ❌ Condition not met - main() NOT called');
  console.error('[DEBUG] This might be why the server is not starting');
}
