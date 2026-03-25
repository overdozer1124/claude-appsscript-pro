#!/usr/bin/env node

/**
 * 🚀 Claude-AppsScript-Pro MCP Server v3.0.0 OPTIMIZED
 * 35-40 essential tools for autonomous Claude operation
 * Optimized for トイ☆パレット development
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

// Essential Handlers
import { BasicToolsHandler } from './lib/handlers/basic-tools.js';
import { SystemToolsHandler } from './lib/handlers/system-tools.js';
import { DevelopmentToolsHandler } from './lib/handlers/development-tools.js';
import { PatchToolsHandler } from './lib/handlers/patch-tools.js';
import { EnhancedPatchToolsHandler } from './lib/handlers/enhanced-patch-tools.js';
import { WebAppDeploymentToolsHandler } from './lib/handlers/webapp-deployment-tools.js';
import { SheetToolsHandler } from './lib/handlers/sheet-tools.js';
import { SheetManagementHandler } from './lib/handlers/sheet-management-tools.js';
import { ExecutionToolsHandler } from './lib/handlers/execution-tools.js';

config();

class MCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'claude-appsscript-pro',
        version: '3.0.0-optimized'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.googleManager = new GoogleAPIsManager();
    this.logger = new DiagnosticLogger();
    
    // Initialize essential handlers only
    this.basicTools = new BasicToolsHandler(this.googleManager, this.logger, this);
    this.systemTools = new SystemToolsHandler(this.googleManager, this.logger);
    this.developmentTools = new DevelopmentToolsHandler(this.googleManager, this.logger);
    this.patchTools = new PatchToolsHandler(this.googleManager, this.logger);
    this.enhancedPatchTools = new EnhancedPatchToolsHandler(this.googleManager, this.logger);
    this.webappDeploymentTools = new WebAppDeploymentToolsHandler(this.googleManager, this.logger);
    this.sheetTools = new SheetToolsHandler(this.googleManager, this.logger);
    this.sheetManagement = new SheetManagementHandler(this.googleManager, this.logger);
    this.executionTools = new ExecutionToolsHandler(this.googleManager, this.logger);

    this._initPromise = this.initializeAPIs();
    this.logProcessInfo();
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Compact tool definitions - descriptions shortened for size optimization
      const tools = [
        // === Basic Tools (4) ===
        {
          name: 'test_connection',
          description: 'Test MCP connection and OAuth status',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'diagnostic_info',
          description: 'Get OAuth authentication diagnostics',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'test_apis',
          description: 'Test Google API connections',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        {
          name: 'get_process_info',
          description: 'Get MCP server process info',
          inputSchema: { type: 'object', properties: {}, required: [] }
        },
        
        // === System Tools (2) ===
        {
          name: 'create_apps_script_system',
          description: 'Create complete Apps Script system with spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              system_name: { type: 'string', description: 'System name' },
              script_files: { 
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    content: { type: 'string' },
                    type: { type: 'string', enum: ['server_js', 'html'] }
                  },
                  required: ['name', 'content']
                }
              }
            },
            required: ['system_name', 'script_files']
          }
        },
        {
          name: 'get_script_info',
          description: 'Get Apps Script project info with optimization analysis',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string', description: 'Apps Script project ID' }
            },
            required: ['script_id']
          }
        },
        
        // === Development Tools (6) ===
        {
          name: 'add_script_file',
          description: 'Add new file to Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              content: { type: 'string' },
              file_type: { type: 'string', enum: ['server_js', 'html'] }
            },
            required: ['script_id', 'file_name', 'content']
          }
        },
        {
          name: 'update_script_file',
          description: 'Update existing file in Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              content: { type: 'string' }
            },
            required: ['script_id', 'file_name', 'content']
          }
        },
        {
          name: 'get_script_file_contents',
          description: 'Get file contents from Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              include_line_numbers: { type: 'boolean', default: true }
            },
            required: ['script_id', 'file_name']
          }
        },
        {
          name: 'delete_script_file',
          description: 'Delete file from Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' }
            },
            required: ['script_id', 'file_name']
          }
        },
        {
          name: 'list_script_files',
          description: 'List all files in Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' }
            },
            required: ['script_id']
          }
        },
        {
          name: 'rename_script_file',
          description: 'Rename file in Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              old_name: { type: 'string' },
              new_name: { type: 'string' }
            },
            required: ['script_id', 'old_name', 'new_name']
          }
        },
        
        // === Patch Tools (2) ===
        {
          name: 'apply_patch',
          description: 'Apply code patch to existing file',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              old_code: { type: 'string', description: 'Code to replace' },
              new_code: { type: 'string', description: 'Replacement code' }
            },
            required: ['script_id', 'file_name', 'old_code', 'new_code']
          }
        },
        {
          name: 'apply_anchor_patch',
          description: 'Apply patch using anchor-based positioning',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              anchor_before: { type: 'string', description: 'Code anchor before insertion' },
              anchor_after: { type: 'string', description: 'Code anchor after insertion' },
              new_code: { type: 'string', description: 'Code to insert' },
              replace_between: { type: 'boolean', default: false }
            },
            required: ['script_id', 'file_name', 'anchor_before', 'anchor_after', 'new_code']
          }
        },
        
        // === Enhanced Patch Tools (4) ===
        {
          name: 'smart_patch',
          description: 'Intelligent patch with auto-detection and validation',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              target_code: { type: 'string' },
              replacement_code: { type: 'string' },
              validation_mode: { type: 'string', enum: ['strict', 'fuzzy'], default: 'fuzzy' }
            },
            required: ['script_id', 'file_name', 'target_code', 'replacement_code']
          }
        },
        {
          name: 'multi_patch',
          description: 'Apply multiple patches in single operation',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              patches: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    old_code: { type: 'string' },
                    new_code: { type: 'string' }
                  },
                  required: ['old_code', 'new_code']
                }
              }
            },
            required: ['script_id', 'file_name', 'patches']
          }
        },
        {
          name: 'function_patch',
          description: 'Replace entire function by name',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              function_name: { type: 'string' },
              new_function_code: { type: 'string' }
            },
            required: ['script_id', 'file_name', 'function_name', 'new_function_code']
          }
        },
        {
          name: 'insert_at_line',
          description: 'Insert code at specific line number',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              file_name: { type: 'string' },
              line_number: { type: 'number' },
              code_to_insert: { type: 'string' }
            },
            required: ['script_id', 'file_name', 'line_number', 'code_to_insert']
          }
        },
        
        // === WebApp Deployment (3) ===
        {
          name: 'deploy_webapp',
          description: 'Deploy Apps Script as web application',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              description: { type: 'string', default: 'Web App Deployment' },
              version: { type: 'string', enum: ['new', 'HEAD'], default: 'new' }
            },
            required: ['script_id']
          }
        },
        {
          name: 'get_deployments',
          description: 'Get all deployments for Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' }
            },
            required: ['script_id']
          }
        },
        {
          name: 'update_deployment',
          description: 'Update existing deployment',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              deployment_id: { type: 'string' },
              description: { type: 'string' }
            },
            required: ['script_id', 'deployment_id']
          }
        },
        
        // === Sheet Tools (6) ===
        {
          name: 'get_sheet_data',
          description: 'Get data from spreadsheet range',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              range: { type: 'string', description: 'A1 notation range' },
              sheet_name: { type: 'string' }
            },
            required: ['spreadsheet_id', 'range']
          }
        },
        {
          name: 'update_sheet_data',
          description: 'Update spreadsheet data',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              range: { type: 'string' },
              values: { type: 'array' },
              sheet_name: { type: 'string' }
            },
            required: ['spreadsheet_id', 'range', 'values']
          }
        },
        {
          name: 'append_sheet_data',
          description: 'Append data to spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              range: { type: 'string' },
              values: { type: 'array' }
            },
            required: ['spreadsheet_id', 'range', 'values']
          }
        },
        {
          name: 'clear_sheet_data',
          description: 'Clear spreadsheet range',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              range: { type: 'string' }
            },
            required: ['spreadsheet_id', 'range']
          }
        },
        {
          name: 'get_sheet_info',
          description: 'Get spreadsheet metadata',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' }
            },
            required: ['spreadsheet_id']
          }
        },
        {
          name: 'batch_update_sheet',
          description: 'Batch update spreadsheet operations',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              requests: { type: 'array' }
            },
            required: ['spreadsheet_id', 'requests']
          }
        },
        
        // === Sheet Management (4) ===
        {
          name: 'create_sheet',
          description: 'Create new sheet in spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              sheet_name: { type: 'string' }
            },
            required: ['spreadsheet_id', 'sheet_name']
          }
        },
        {
          name: 'delete_sheet',
          description: 'Delete sheet from spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              sheet_id: { type: 'number' }
            },
            required: ['spreadsheet_id', 'sheet_id']
          }
        },
        {
          name: 'rename_sheet',
          description: 'Rename sheet in spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' },
              sheet_id: { type: 'number' },
              new_name: { type: 'string' }
            },
            required: ['spreadsheet_id', 'sheet_id', 'new_name']
          }
        },
        {
          name: 'list_sheets',
          description: 'List all sheets in spreadsheet',
          inputSchema: {
            type: 'object',
            properties: {
              spreadsheet_id: { type: 'string' }
            },
            required: ['spreadsheet_id']
          }
        },
        
        // === Execution Tools (2) ===
        {
          name: 'execute_function',
          description: 'Execute function in Apps Script project',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' },
              function_name: { type: 'string' },
              parameters: { type: 'array' },
              dev_mode: { type: 'boolean', default: false }
            },
            required: ['script_id', 'function_name']
          }
        },
        {
          name: 'get_execution_logs',
          description: 'Get Apps Script execution logs',
          inputSchema: {
            type: 'object',
            properties: {
              script_id: { type: 'string' }
            },
            required: ['script_id']
          }
        }
      ];

      this.logger.info(`Returning ${tools.length} optimized tools for autonomous operation`);
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      // ===== ??????????????(?????) =====
      const _ALIAS = {
        'execute_function':       'execute_script_function',
        'get_sheet_data':         'read_sheet_data',
        'update_sheet_data':      'write_sheet_data',
        'get_sheet_info':         'get_spreadsheet_metadata',
        'clear_sheet_data':       'update_sheet_range',
        'batch_update_sheet':     'update_sheet_range',
        'apply_patch':            'apply_code_patch',
        'apply_anchor_patch':     'apply_enhanced_patch',
        'smart_patch':            'smart_fix_script',
        'multi_patch':            'apply_html_patch',
        'get_deployments':        'list_webapp_deployments',
        'update_deployment':      'update_webapp_deployment',
        'list_script_files':      'get_script_info',
        'rename_script_file':     'update_script_file',
      };
      const resolvedName = _ALIAS[name] || name;
      // ===== ???????????? =====

      // Google APIs????????
      if (this._initPromise) {
        try { await this._initPromise; } catch(e) {}
      }

      
      try {
        // Route to appropriate handler
        if (['test_connection', 'diagnostic_info', 'test_apis', 'get_process_info'].includes(resolvedName)) {
          return await this.basicTools.handleTool(resolvedName, args || {});
        }
        
        if (this.systemTools.canHandle(resolvedName)) {
          return await this.systemTools.handleTool(resolvedName, args || {});
        }
        
        if (this.developmentTools.canHandle(resolvedName)) {
          return await this.developmentTools.handleTool(resolvedName, args || {});
        }
        
        if (this.patchTools.canHandle(resolvedName)) {
          return await this.patchTools.handleTool(resolvedName, args || {});
        }
        
        if (this.enhancedPatchTools.canHandle(resolvedName)) {
          return await this.enhancedPatchTools.handleTool(resolvedName, args || {});
        }
        
        if (this.webappDeploymentTools.canHandle(resolvedName)) {
          return await this.webappDeploymentTools.handleTool(resolvedName, args || {});
        }
        
        if (this.sheetTools.canHandle(resolvedName)) {
          return await this.sheetTools.handleTool(resolvedName, args || {});
        }
        
        if (this.sheetManagement.canHandle(resolvedName)) {
          return await this.sheetManagement.handleTool(resolvedName, args || {});
        }
        
        if (this.executionTools.canHandle(resolvedName)) {
          return await this.executionTools.handleTool(resolvedName, args || {});
        }
        
        throw new Error(`Unknown tool: ${resolvedName}`);
        
      } catch (error) {
        this.logger.error(`Tool execution error for ${resolvedName}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error.message,
                tool: resolvedName
              }, null, 2)
            }
          ]
        };
      }
    });
  }

  async initializeAPIs() {
    try {
      await this.googleManager.initialize();
      this.logger.info('Google APIs initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Google APIs:', error);
    }
  }

  logProcessInfo() {
    const startTime = new Date().toISOString();
    console.error('====================================================');
    console.error('[MCP] Claude-AppsScript-Pro v3.0.0 OPTIMIZED');
    console.error('[MCP] 35+ essential tools for autonomous operation');
    console.error('[MCP] PID:', process.pid);
    console.error('[MCP] Start:', startTime);
    console.error('====================================================');
  }

  async run() {
    const transport = new StdioServerTransport();
    this.logger.info('🚀 Claude-AppsScript-Pro OPTIMIZED starting...');
    this.logger.info('📊 35+ essential tools ready for autonomous Claude operation');
    await this.server.connect(transport);
    this.logger.info('✅ MCP Server running successfully');
  }
}

const server = new MCPServer();
server.run().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
