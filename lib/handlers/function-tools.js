/**
 * Function Tools Handler - Advanced function management and analysis tools
 * Claude-AppsScript-Pro Function integrity, dependency analysis, and stub generation
 * 
 * Features:
 * - handleValidateFunctionConsistency: Validate menu functions against implementations
 * - handleGenerateFunctionStubs: Generate implementation stubs for missing functions
 * - handleAnalyzeFunctionDependencies: Analyze Apps Script function dependencies and suggest optimal order
 */

export class FunctionToolsHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
  }

  /**
   * Get tool definitions for function management operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'validate_function_consistency',
        description: 'Validate consistency between menu functions and implementations to prevent runtime errors',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            auto_generate_stubs: { 
              type: 'boolean', 
              default: false, 
              description: 'Auto-generate missing function stubs' 
            },
            include_advanced_scan: {
              type: 'boolean',
              default: true,
              description: 'Include triggers, buttons, and other function references'
            }
          },
          required: ['script_id']
        }
      },
      {
        name: 'generate_function_stubs',
        description: 'Generate implementation stubs for missing functions to prevent runtime errors',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            function_names: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'List of function names to generate stubs for' 
            },
            stub_type: {
              type: 'string',
              enum: ['basic', 'menu_handler', 'data_processor', 'ui_dialog'],
              default: 'basic',
              description: 'Type of stub to generate'
            },
            target_file: {
              type: 'string',
              default: 'FunctionStubs',
              description: 'Target file name for generated stubs'
            }
          },
          required: ['script_id', 'function_names']
        }
      },
      {
        name: 'analyze_apps_script_function_dependencies',
        description: 'Analyze Apps Script function dependencies and suggest optimal implementation order',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { 
              type: 'string', 
              description: 'Apps Script project ID' 
            },
            target_function: {
              type: 'string',
              description: 'Specific function to analyze (optional - analyzes all if not provided)'
            },
            depth_limit: {
              type: 'integer',
              default: 3,
              description: 'Maximum dependency analysis depth'
            }
          },
          required: ['script_id']
        }
      }
    ];
  }

  /**
   * Route function tool requests to appropriate handlers
   */
  async handleRequest(name, args) {
    try {
      switch (name) {
        case 'validate_function_consistency':
          return await this.handleValidateFunctionConsistency(args);
        case 'generate_function_stubs':
          return await this.handleGenerateFunctionStubs(args);
        case 'analyze_apps_script_function_dependencies':
          return await this.handleAnalyzeFunctionDependencies(args);
        default:
          throw new Error(`Unknown function tool: ${name}`);
      }
    } catch (error) {
      this.diagLogger.error(`Function tool error for ${name}:`, error);
      throw error;
    }
  }

  /**
   * Validate function consistency between menu definitions and implementations
   */
  async handleValidateFunctionConsistency(args) {
    const { script_id, auto_generate_stubs = false, include_advanced_scan = true } = args;
    
    try {
      this.diagLogger.log('Starting function consistency validation');
      
      // Get project files
      const filesResponse = await this.googleManager.appsScript.projects.getContent({
        scriptId: script_id
      });
      
      if (!filesResponse.data || !filesResponse.data.files) {
        return {
          success: false,
          error: 'Failed to retrieve project files',
          validation_results: {}
        };
      }
      
      const files = filesResponse.data.files;
      const analysis = {
        menu_functions: [],
        implemented_functions: [],
        missing_implementations: [],
        orphaned_implementations: [],
        trigger_functions: [],
        button_functions: []
      };
      
      // Analyze each file
      for (const file of files) {
        if (file.type === 'SERVER_JS') {
          const content = file.source || '';
          
          // Extract menu function references
          const menuMatches = content.match(/\.addItem\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]\s*\)/g);
          if (menuMatches) {
            menuMatches.forEach(match => {
              const funcMatch = match.match(/,\s*['"`]([^'"`]+)['"`]\s*\)/);
              if (funcMatch) {
                analysis.menu_functions.push({
                  name: funcMatch[1],
                  file: file.name,
                  line_context: match
                });
              }
            });
          }
          
          // Extract function implementations
          const funcMatches = content.match(/function\s+(\w+)\s*\(/g);
          if (funcMatches) {
            funcMatches.forEach(match => {
              const nameMatch = match.match(/function\s+(\w+)\s*\(/);
              if (nameMatch) {
                analysis.implemented_functions.push({
                  name: nameMatch[1],
                  file: file.name
                });
              }
            });
          }
          
          if (include_advanced_scan) {
            // Extract trigger functions
            const triggerMatches = content.match(/ScriptApp\.newTrigger\s*\(\s*['"`]([^'"`]+)['"`]/g);
            if (triggerMatches) {
              triggerMatches.forEach(match => {
                const nameMatch = match.match(/['"`]([^'"`]+)['"`]/);
                if (nameMatch) {
                  analysis.trigger_functions.push({
                    name: nameMatch[1],
                    file: file.name
                  });
                }
              });
            }
            
            // Extract button function references
            const buttonMatches = content.match(/onAction\s*:\s*['"`]([^'"`]+)['"`]/g);
            if (buttonMatches) {
              buttonMatches.forEach(match => {
                const nameMatch = match.match(/['"`]([^'"`]+)['"`]/);
                if (nameMatch) {
                  analysis.button_functions.push({
                    name: nameMatch[1],
                    file: file.name
                  });
                }
              });
            }
          }
        }
      }
      
      // Find missing implementations
      const implementedNames = analysis.implemented_functions.map(f => f.name);
      const menuFunctionNames = analysis.menu_functions.map(f => f.name);
      const triggerFunctionNames = analysis.trigger_functions.map(f => f.name);
      const buttonFunctionNames = analysis.button_functions.map(f => f.name);
      
      const allRequiredFunctions = [
        ...menuFunctionNames,
        ...triggerFunctionNames,
        ...buttonFunctionNames
      ];
      
      analysis.missing_implementations = allRequiredFunctions
        .filter(name => !implementedNames.includes(name))
        .map(name => ({ name, required_by: [] }));
      
      // Add context for missing functions
      analysis.missing_implementations.forEach(missing => {
        if (menuFunctionNames.includes(missing.name)) {
          missing.required_by.push('menu');
        }
        if (triggerFunctionNames.includes(missing.name)) {
          missing.required_by.push('trigger');
        }
        if (buttonFunctionNames.includes(missing.name)) {
          missing.required_by.push('button');
        }
      });
      
      // Find orphaned implementations (functions not referenced anywhere)
      analysis.orphaned_implementations = implementedNames
        .filter(name => !allRequiredFunctions.includes(name))
        .filter(name => !['onOpen', 'onEdit', 'onInstall'].includes(name)) // Exclude system functions
        .map(name => ({ name }));
      
      const validation_results = {
        total_files_analyzed: files.filter(f => f.type === 'SERVER_JS').length,
        menu_functions_found: analysis.menu_functions.length,
        implemented_functions_found: analysis.implemented_functions.length,
        missing_implementations_count: analysis.missing_implementations.length,
        orphaned_implementations_count: analysis.orphaned_implementations.length,
        consistency_score: Math.round(
          ((analysis.implemented_functions.length - analysis.missing_implementations.length) / 
           Math.max(analysis.implemented_functions.length, 1)) * 100
        )
      };
      
      // Auto-generate stubs if requested
      let stub_generation_result = null;
      if (auto_generate_stubs && analysis.missing_implementations.length > 0) {
        const missing_names = analysis.missing_implementations.map(m => m.name);
        stub_generation_result = await this.handleGenerateFunctionStubs({
          script_id,
          function_names: missing_names,
          stub_type: 'menu_handler'
        });
      }
      
      this.diagLogger.log('Function consistency validation completed');
      
      return {
        success: true,
        script_id,
        validation_results,
        analysis,
        stub_generation_result,
        recommendations: this.generateConsistencyRecommendations(analysis)
      };
      
    } catch (error) {
      this.diagLogger.error('Function consistency validation failed:', error);
      return {
        success: false,
        error: error.message,
        validation_results: {}
      };
    }
  }

  /**
   * Generate function stubs for missing implementations
   */
  async handleGenerateFunctionStubs(args) {
    const { script_id, function_names, stub_type = 'basic', target_file = 'FunctionStubs' } = args;
    
    try {
      this.diagLogger.log('Starting function stub generation');
      
      // Get existing files
      const filesResponse = await this.googleManager.appsScript.projects.getContent({
        scriptId: script_id
      });
      
      if (!filesResponse.data || !filesResponse.data.files) {
        return {
          success: false,
          error: 'Failed to retrieve project files'
        };
      }
      
      const files = filesResponse.data.files;
      const existingFileNames = files.map(f => f.name);
      
      // Generate stub content
      const stubContent = this.generateStubContent(function_names, stub_type);
      
      // Check if target file exists
      const targetFileExists = existingFileNames.includes(target_file);
      
      if (targetFileExists) {
        // Append to existing file
        const targetFileData = files.find(f => f.name === target_file);
        const existingContent = targetFileData.source || '';
        const updatedContent = existingContent + '\n\n' + stubContent;
        
        // Update existing file
        targetFileData.source = updatedContent;
      } else {
        // Create new file
        files.push({
          name: target_file,
          type: 'SERVER_JS',
          source: stubContent
        });
      }
      
      // Update project
      const updateResponse = await this.googleManager.appsScript.projects.updateContent({
        scriptId: script_id,
        requestBody: {
          files: files
        }
      });
      
      this.diagLogger.log('Function stubs generated successfully');
      
      return {
        success: true,
        script_id,
        target_file,
        functions_generated: function_names,
        stub_type,
        file_operation: targetFileExists ? 'updated' : 'created',
        generated_content: stubContent
      };
      
    } catch (error) {
      this.diagLogger.error('Function stub generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze function dependencies and call relationships
   */
  async handleAnalyzeFunctionDependencies(args) {
    const { script_id, target_function, depth_limit = 3 } = args;
    
    try {
      this.diagLogger.log('Starting function dependency analysis');
      
      // Get project files
      const filesResponse = await this.googleManager.appsScript.projects.getContent({
        scriptId: script_id
      });
      
      if (!filesResponse.data || !filesResponse.data.files) {
        return {
          success: false,
          error: 'Failed to retrieve project files'
        };
      }
      
      const files = filesResponse.data.files;
      const functionMap = new Map();
      const dependencies = new Map();
      
      // Build function map and extract dependencies
      for (const file of files) {
        if (file.type === 'SERVER_JS') {
          const content = file.source || '';
          
          // Extract function definitions
          const funcMatches = content.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/g);
          if (funcMatches) {
            funcMatches.forEach(match => {
              const nameMatch = match.match(/function\s+(\w+)\s*\(/);
              if (nameMatch) {
                const funcName = nameMatch[1];
                functionMap.set(funcName, {
                  name: funcName,
                  file: file.name,
                  definition: match
                });
                dependencies.set(funcName, new Set());
              }
            });
          }
        }
      }
      
      // Analyze function calls within each function
      for (const file of files) {
        if (file.type === 'SERVER_JS') {
          const content = file.source || '';
          
          // Split into functions
          const functionBodies = this.extractFunctionBodies(content);
          
          functionBodies.forEach(({ name, body }) => {
            if (dependencies.has(name)) {
              // Find function calls within this function
              const callMatches = body.match(/(\w+)\s*\(/g);
              if (callMatches) {
                callMatches.forEach(call => {
                  const calledFunc = call.replace(/\s*\($/, '');
                  if (functionMap.has(calledFunc) && calledFunc !== name) {
                    dependencies.get(name).add(calledFunc);
                  }
                });
              }
            }
          });
        }
      }
      
      // Build dependency graph
      const dependencyGraph = {};
      for (const [funcName, deps] of dependencies) {
        dependencyGraph[funcName] = {
          depends_on: Array.from(deps),
          depended_by: []
        };
      }
      
      // Fill reverse dependencies
      for (const [funcName, info] of Object.entries(dependencyGraph)) {
        info.depends_on.forEach(depFunc => {
          if (dependencyGraph[depFunc]) {
            dependencyGraph[depFunc].depended_by.push(funcName);
          }
        });
      }
      
      // Analyze specific function if provided
      let specific_analysis = null;
      if (target_function && dependencyGraph[target_function]) {
        specific_analysis = this.analyzeSpecificFunction(
          target_function, 
          dependencyGraph, 
          depth_limit
        );
      }
      
      // Generate implementation order suggestion
      const implementation_order = this.generateImplementationOrder(dependencyGraph);
      
      // Detect circular dependencies
      const circular_dependencies = this.detectCircularDependencies(dependencyGraph);
      
      this.diagLogger.log('Function dependency analysis completed');
      
      return {
        success: true,
        script_id,
        analysis_summary: {
          total_functions: functionMap.size,
          functions_with_dependencies: Object.keys(dependencyGraph).filter(
            name => dependencyGraph[name].depends_on.length > 0
          ).length,
          circular_dependencies_count: circular_dependencies.length
        },
        dependency_graph: dependencyGraph,
        implementation_order,
        circular_dependencies,
        specific_analysis,
        recommendations: this.generateDependencyRecommendations(dependencyGraph, circular_dependencies)
      };
      
    } catch (error) {
      this.diagLogger.error('Function dependency analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate appropriate stub content based on stub type
   */
  generateStubContent(functionNames, stubType) {
    const timestamp = new Date().toISOString();
    let stubContent = `/**\n * Generated Function Stubs - ${timestamp}\n * Auto-generated by Claude-AppsScript-Pro\n */\n\n`;
    
    functionNames.forEach(funcName => {
      switch (stubType) {
        case 'menu_handler':
          stubContent += `/**\n * Menu handler function: ${funcName}\n */\nfunction ${funcName}() {\n  try {\n    const ui = SpreadsheetApp.getUi();\n    ui.alert('${funcName}', 'This function is not yet implemented.', ui.ButtonSet.OK);\n    console.log('${funcName} function called');\n  } catch (error) {\n    console.error('Error in ${funcName}:', error);\n  }\n}\n\n`;
          break;
          
        case 'data_processor':
          stubContent += `/**\n * Data processor function: ${funcName}\n */\nfunction ${funcName}(data) {\n  try {\n    console.log('${funcName} processing data:', data);\n    // TODO: Implement data processing logic\n    return data;\n  } catch (error) {\n    console.error('Error in ${funcName}:', error);\n    return null;\n  }\n}\n\n`;
          break;
          
        case 'ui_dialog':
          stubContent += `/**\n * UI dialog function: ${funcName}\n */\nfunction ${funcName}() {\n  try {\n    const ui = SpreadsheetApp.getUi();\n    const result = ui.prompt('${funcName}', 'This dialog is not yet implemented.', ui.ButtonSet.OK_CANCEL);\n    console.log('${funcName} dialog result:', result.getResponseText());\n    return result;\n  } catch (error) {\n    console.error('Error in ${funcName}:', error);\n  }\n}\n\n`;
          break;
          
        default: // basic
          stubContent += `/**\n * Function: ${funcName}\n */\nfunction ${funcName}() {\n  // TODO: Implement ${funcName}\n  console.log('${funcName} function called - implementation needed');\n}\n\n`;
      }
    });
    
    return stubContent;
  }

  /**
   * Extract function bodies from JavaScript content
   */
  extractFunctionBodies(content) {
    const functions = [];
    const lines = content.split('\n');
    let currentFunction = null;
    let braceCount = 0;
    let inFunction = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for function start
      const funcMatch = line.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
      if (funcMatch && !inFunction) {
        currentFunction = {
          name: funcMatch[1],
          body: line + '\n',
          startLine: i
        };
        braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        inFunction = true;
        continue;
      }
      
      if (inFunction) {
        currentFunction.body += line + '\n';
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        
        if (braceCount <= 0) {
          currentFunction.endLine = i;
          functions.push(currentFunction);
          currentFunction = null;
          inFunction = false;
          braceCount = 0;
        }
      }
    }
    
    return functions;
  }

  /**
   * Analyze specific function dependencies
   */
  analyzeSpecificFunction(funcName, dependencyGraph, depthLimit, visited = new Set(), depth = 0) {
    if (depth >= depthLimit || visited.has(funcName)) {
      return { name: funcName, depth, truncated: depth >= depthLimit };
    }
    
    visited.add(funcName);
    const info = dependencyGraph[funcName] || { depends_on: [], depended_by: [] };
    
    return {
      name: funcName,
      depth,
      direct_dependencies: info.depends_on,
      dependent_functions: info.depended_by,
      nested_dependencies: info.depends_on.map(dep => 
        this.analyzeSpecificFunction(dep, dependencyGraph, depthLimit, new Set(visited), depth + 1)
      )
    };
  }

  /**
   * Generate optimal implementation order
   */
  generateImplementationOrder(dependencyGraph) {
    const implemented = new Set();
    const order = [];
    const remaining = new Set(Object.keys(dependencyGraph));
    
    while (remaining.size > 0) {
      let found = false;
      
      for (const funcName of remaining) {
        const dependencies = dependencyGraph[funcName].depends_on;
        const canImplement = dependencies.every(dep => implemented.has(dep) || !remaining.has(dep));
        
        if (canImplement) {
          order.push({
            function: funcName,
            level: order.length + 1,
            dependencies: dependencies.filter(dep => implemented.has(dep))
          });
          implemented.add(funcName);
          remaining.delete(funcName);
          found = true;
          break;
        }
      }
      
      // Handle circular dependencies
      if (!found && remaining.size > 0) {
        const func = remaining.values().next().value;
        order.push({
          function: func,
          level: order.length + 1,
          dependencies: dependencyGraph[func].depends_on,
          note: 'Circular dependency detected'
        });
        implemented.add(func);
        remaining.delete(func);
      }
    }
    
    return order;
  }

  /**
   * Detect circular dependencies
   */
  detectCircularDependencies(dependencyGraph) {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat([node]));
        return;
      }
      
      if (visited.has(node)) {
        return;
      }
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const dependencies = dependencyGraph[node]?.depends_on || [];
      dependencies.forEach(dep => {
        if (dependencyGraph[dep]) {
          dfs(dep, [...path]);
        }
      });
      
      recursionStack.delete(node);
    };
    
    Object.keys(dependencyGraph).forEach(func => {
      if (!visited.has(func)) {
        dfs(func);
      }
    });
    
    return cycles;
  }

  /**
   * Generate consistency recommendations
   */
  generateConsistencyRecommendations(analysis) {
    const recommendations = [];
    
    if (analysis.missing_implementations.length > 0) {
      recommendations.push({
        type: 'critical',
        title: 'Missing Function Implementations',
        description: `${analysis.missing_implementations.length} functions are referenced but not implemented`,
        action: 'Use generate_function_stubs to create placeholder implementations',
        functions: analysis.missing_implementations.map(f => f.name)
      });
    }
    
    if (analysis.orphaned_implementations.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Orphaned Functions',
        description: `${analysis.orphaned_implementations.length} functions are implemented but never called`,
        action: 'Review if these functions are still needed or should be removed',
        functions: analysis.orphaned_implementations.map(f => f.name)
      });
    }
    
    if (analysis.menu_functions.length === 0) {
      recommendations.push({
        type: 'info',
        title: 'No Menu Functions Found',
        description: 'Consider adding menu functions for better user experience',
        action: 'Implement onOpen() function with custom menu items'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate dependency recommendations
   */
  generateDependencyRecommendations(dependencyGraph, circularDependencies) {
    const recommendations = [];
    
    if (circularDependencies.length > 0) {
      recommendations.push({
        type: 'critical',
        title: 'Circular Dependencies Detected',
        description: `${circularDependencies.length} circular dependency chains found`,
        action: 'Refactor code to break circular dependencies',
        cycles: circularDependencies
      });
    }
    
    const highlyDependentFunctions = Object.entries(dependencyGraph)
      .filter(([_, info]) => info.depended_by.length > 5)
      .map(([name, info]) => ({ name, dependents: info.depended_by.length }));
    
    if (highlyDependentFunctions.length > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Highly Dependent Functions',
        description: 'Some functions have many dependents - consider refactoring',
        action: 'Review if these functions can be simplified or split',
        functions: highlyDependentFunctions
      });
    }
    
    const isolatedFunctions = Object.entries(dependencyGraph)
      .filter(([_, info]) => info.depends_on.length === 0 && info.depended_by.length === 0)
      .map(([name, _]) => name);
    
    if (isolatedFunctions.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Isolated Functions',
        description: `${isolatedFunctions.length} functions have no dependencies`,
        action: 'These can be implemented in any order',
        functions: isolatedFunctions
      });
    }
    
    return recommendations;
  }

  /**
   * Check if this handler can handle the given tool
   */
  canHandle(toolName) {
    return ['validate_function_consistency', 'generate_function_stubs', 'analyze_function_dependencies'].includes(toolName);
  }

  /**
   * Handle tool - alias for handleRequest method for server.js compatibility
   */
  async handleTool(toolName, args) {
    return await this.handleRequest(toolName, args);
  }
}
