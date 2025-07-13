#!/usr/bin/env node

// ─── imports 追加 ───────────────────────────────
import { config } from 'dotenv';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs/promises';
import yargs from 'yargs';

// ─── CLI 引数解析 ───────────────────────────────
const argv = yargs(process.argv.slice(2))
  .option('db', { type: 'string', describe: 'Path to Sheets Functions DB' })
  .option('info', { type: 'string', describe: 'Path to mcp-process-info.txt' })
  .parseSync();

// ─── デフォルト（モジュール相対） ──────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let dbPath = path.resolve(__dirname, './sheets-functions-test/functions-database/index-ultra-minimal.js');
let infoPath = path.resolve(__dirname, './mcp-process-info.txt');

// ─── 環境変数があれば上書き ───────────────────
if (process.env.FUNCTION_DB_PATH) dbPath = path.resolve(process.env.FUNCTION_DB_PATH);
if (process.env.MCP_INFO_PATH) infoPath = path.resolve(process.env.MCP_INFO_PATH);

// ─── CLI が最優先 ─────────────────────────────
if (argv.db) dbPath = path.resolve(argv.db);
if (argv.info) infoPath = path.resolve(argv.info);

// ─── 存在チェック ─────────────────────────────
try {
  await fs.access(dbPath);
  await fs.access(path.dirname(infoPath)); // infoPath のディレクトリが存在するかチェック
  console.error(`[INIT] ✅ Database found: ${dbPath}`);
  console.error(`[INIT] ✅ Info path ready: ${infoPath}`);
} catch (error) {
  console.error(`[INIT] ❌ ファイルが見つかりません:\n  DB  : ${dbPath}\n  INFO: ${infoPath}`);
  console.error(`[INIT] Error: ${error.message}`);
  process.exit(1);
}

// ─── 514 関数 DB を動的 import ────────────────
const dbUrl = pathToFileURL(dbPath).href;
const dbModule = await import(dbUrl);
export const FunctionsDatabaseManager = dbModule.FunctionsDatabaseManager;
export const getFunctionInfo = dbModule.getFunctionInfo;
export const searchFunctions = dbModule.searchFunctions;

// ─── INFO パスをハンドラに共有できるよう export ─
export const PROCESS_INFO_PATH = infoPath;

// dotenv configuration for environment variables
config({ path: path.join(__dirname, '.env') });

import { GoogleAPIsManager } from './lib/core/google-apis-manager.js';
import { DiagnosticLogger } from './lib/core/diagnostic-logger.js';
import { BasicToolsHandler } from './lib/handlers/basic-tools.js';
import { SheetToolsHandler } from './lib/handlers/sheet-tools.js';
import { SheetManagementHandler } from './lib/handlers/sheet-management-tools.js';
import { SystemToolsHandler } from './lib/handlers/system-tools.js';
import { DevelopmentToolsHandler } from './lib/handlers/development-tools.js';
import { PatchToolsHandler } from './lib/handlers/patch-tools.js';
import { FunctionToolsHandler } from './lib/handlers/function-tools.js';
import { FormulaToolsHandler } from './lib/handlers/formula-tools.js';
import { SheetsFunctionsTools } from './lib/handlers/sheets-functions-tools.js';
import { BrowserDebugTools } from './lib/handlers/browser-debug-tools.js';
import { WebAppDeploymentHandler } from './lib/handlers/webapp-deployment-tools.js';

// Block 2: MCPServer Class
class MCPServer {
  constructor() {
    this.server = new Server(
      { name: 'claude-appsscript-pro', version: '2.1.0' },
      { capabilities: { tools: {} } }
    );
    
    this.googleManager = GoogleAPIsManager.getInstance();
    this.logger = new DiagnosticLogger();
    
    this.basicTools = new BasicToolsHandler(this.googleManager, this.logger);
    this.sheetTools = new SheetToolsHandler(this.googleManager, this.logger);
    this.sheetManagement = new SheetManagementHandler(this.googleManager, this.logger);
    this.systemTools = new SystemToolsHandler(this.googleManager, this.logger);
    this.developmentTools = new DevelopmentToolsHandler(this.googleManager, this.logger);
    this.patchTools = new PatchToolsHandler(this.googleManager, this.logger);
    this.functionTools = new FunctionToolsHandler(this.googleManager, this.logger);
    this.formulaTools = new FormulaToolsHandler(this.googleManager, this.logger);
    this.browserDebugTools = new BrowserDebugTools(this.googleManager, this.logger);
    this.webAppDeployment = new WebAppDeploymentHandler(this.googleManager, this.logger);
    // 関数データベース統合の確認とデバッグ
    console.error('[MCP-INIT] Checking imported functions...');
    console.error(`  getFunctionInfo: ${typeof getFunctionInfo}`);
    console.error(`  searchFunctions: ${typeof searchFunctions}`);
    console.error(`  FunctionsDatabaseManager: ${typeof FunctionsDatabaseManager}`);
    
    // SheetsFunctionsTools初期化（デバッグ付き）
    const serverExports = {
      getFunctionInfo: getFunctionInfo,
      searchFunctions: searchFunctions,
      FunctionsDatabaseManager: FunctionsDatabaseManager
    };
    
    this.sheetsFunctions = new SheetsFunctionsTools(this.googleManager, serverExports);
    
    this.logProcessInfo();
    this.setupHandlers();
  }

  // Google APIs Manager初期化メソッド
  async initializeGoogleManager() {
    try {
      await this.googleManager.initialize();
      console.error('[MCP-INIT] ✅ Google APIs Manager initialized successfully');
    } catch (error) {
      console.error('[MCP-INIT] ❌ Google APIs Manager initialization failed:', error.message);
    }
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, () => this.listTools());
    this.server.setRequestHandler(CallToolRequestSchema, (request) => this.callTool(request));
  }

  listTools() {
    const allTools = [
      ...this.basicTools.getToolDefinitions(),
      ...this.sheetTools.getToolDefinitions(),
      ...this.sheetManagement.getToolDefinitions(),
      ...this.systemTools.getToolDefinitions(),
      ...this.developmentTools.getToolDefinitions(),
      ...this.patchTools.getToolDefinitions(),
      ...this.functionTools.getToolDefinitions(),
      ...this.formulaTools.getToolDefinitions(),
      ...this.sheetsFunctions.getToolDefinitions(),
      ...this.browserDebugTools.getToolDefinitions(),
      ...this.webAppDeployment.getToolDefinitions()
    ];
    
    return { tools: allTools };
  }

  async callTool(request) {
    const { name, arguments: args } = request.params;
    
    try {
      if (this.basicTools.canHandle(name)) {
        return await this.basicTools.handleTool(name, args);
      }
      if (this.sheetTools.canHandle(name)) {
        return await this.sheetTools.handleTool(name, args);
      }
      if (this.sheetManagement.canHandle(name)) {
        return await this.sheetManagement.handleTool(name, args);
      }
      if (this.systemTools.canHandle(name)) {
        return await this.systemTools.handleTool(name, args);
      }
      if (this.developmentTools.canHandle(name)) {
        return await this.developmentTools.handleTool(name, args);
      }
      if (this.patchTools.canHandle(name)) {
        return await this.patchTools.handleTool(name, args);
      }
      if (this.functionTools.canHandle(name)) {
        return await this.functionTools.handleTool(name, args);
      }
      if (this.formulaTools.canHandle(name)) {
        return await this.formulaTools.handleTool(name, args);
      }
      if (this.sheetsFunctions.canHandle(name)) {
        return await this.sheetsFunctions.handleTool(name, args);
      }
      if (this.browserDebugTools.canHandle(name)) {
        return await this.browserDebugTools.handleTool(name, args);
      }
      
      // WebApp Deployment Tools
      const webAppDeploymentTools = ['deploy_webapp', 'update_webapp_deployment', 'list_webapp_deployments', 'get_webapp_deployment_info', 'delete_webapp_deployment'];
      if (webAppDeploymentTools.includes(name)) {
        return await this.webAppDeployment.handleToolCall(name, args);
      }
      
      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      this.logger.error(`Tool ${name} execution error:`, error);
      throw error;
    }
  }

  logProcessInfo() {
    const startTime = new Date().toISOString();
    
    const processInfo = {
      pid: process.pid,
      startTime: startTime,
      command: process.argv.join(' '),
      workingDir: process.cwd(),
      scriptPath: fileURLToPath(import.meta.url),
      serverDir: __dirname,
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      dbPath: dbPath,
      infoPath: infoPath,
      phase: 'Portable v2.1.0 (51 tools integrated - WebAppデプロイ機能追加)'
    };
    
    // STDERR出力（STDOUT汚染防止）
    console.error('====================================================');
    console.error('[MCP-PROCESS] Claude-AppsScript-Pro Server v2.1.0');
    console.error('[MCP-PROCESS] PID:', processInfo.pid);
    console.error('[MCP-PROCESS] Start Time:', processInfo.startTime);
    console.error('[MCP-PROCESS] DB Path:', processInfo.dbPath);
    console.error('[MCP-PROCESS] Info Path:', processInfo.infoPath);
    console.error('[MCP-PROCESS] Phase:', processInfo.phase);
    console.error('====================================================');
    
    // プロセス情報ファイル保存
    this.saveProcessInfoToFile(processInfo);
  }

  async saveProcessInfoToFile(processInfo) {
    try {
      const content = `Claude-AppsScript-Pro MCP Server v2.1.0
${processInfo.phase}
PID: ${processInfo.pid}
Start Time: ${processInfo.startTime}
Command: ${processInfo.command}
Working Dir: ${processInfo.workingDir}
Script Path: ${processInfo.scriptPath}
Server Dir: ${processInfo.serverDir}
DB Path: ${processInfo.dbPath}
Info Path: ${processInfo.infoPath}
Node Version: ${processInfo.nodeVersion}
Platform: ${processInfo.platform}
Architecture: ${processInfo.architecture}

PowerShell Process Check Command:
Get-Process -Id ${processInfo.pid}

Claude Code Process Check Command:
ps -p ${processInfo.pid}

Kill Process Command (if needed):
PowerShell: Stop-Process -Id ${processInfo.pid}
Claude Code: kill ${processInfo.pid}

Portable Configuration:
- Database: ${processInfo.dbPath}
- Process Info: ${processInfo.infoPath}
- CLI Override: --db <path> --info <path>
- Environment Variables: FUNCTION_DB_PATH, MCP_INFO_PATH
`;
      
      await fs.writeFile(infoPath, content, 'utf8');
      console.error(`[MCP-PROCESS] ✅ Process info saved to: ${infoPath}`);
    } catch (error) {
      console.error(`[MCP-PROCESS] ❌ Failed to save process info: ${error.message}`);
    }
  }

  async start() {
    // Google APIs Manager初期化
    await this.initializeGoogleManager();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.info('Claude-AppsScript-Pro MCP Server v2.1.0 started - Portable Edition');
  }
}

// Block 3: 起動処理
const mcpServer = new MCPServer();
mcpServer.start().catch(console.error);