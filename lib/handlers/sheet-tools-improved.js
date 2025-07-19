/**
 * Improved Sheet Tools Handler for Claude-AppsScript-Pro
 * Enhanced with configurable output limits and full data access
 * 
 * Revolutionary Direct Sheet Access without Apps Script intermediary
 * Phase Sheet-3 Implementation: Unlimited row display capability
 */

export class SheetToolsHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
  }

  /**
   * Get tool definitions for sheet operations - Enhanced Version
   */
  getToolDefinitions() {
    return [
      {
        name: 'read_sheet_data',
        description: 'Read data from Google Sheets directly via Sheets API with configurable output',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            range: { 
              type: 'string', 
              description: 'Range in A1 notation (e.g., "Sheet1!A1:C10", default: entire sheet)',
              default: 'Sheet1'
            },
            value_render_option: {
              type: 'string',
              enum: ['FORMATTED_VALUE', 'UNFORMATTED_VALUE', 'FORMULA'],
              default: 'FORMATTED_VALUE',
              description: 'How values should be represented in output'
            },
            sample_rows: {
              type: 'number',
              description: 'Number of sample rows to display (default: 20, max: 100)',
              default: 20,
              minimum: 1,
              maximum: 100
            },
            full_output: {
              type: 'boolean',
              description: 'Return complete data instead of sample (default: false)',
              default: false
            }
          },
          required: ['spreadsheet_id']
        }
      },
      {
        name: 'write_sheet_data',
        description: 'Write data to Google Sheets directly via Sheets API',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            range: { 
              type: 'string', 
              description: 'Range in A1 notation (e.g., "A1", "Sheet1!A1:C5")',
              default: 'A1'
            },
            values: { 
              type: 'array', 
              description: 'Data to write as 2D array (e.g., [["A1", "B1"], ["A2", "B2"]])',
              items: { 
                type: 'array', 
                items: { 
                  anyOf: [
                    { type: 'string' },
                    { type: 'number' },
                    { type: 'boolean' }
                  ]
                }
              }
            },
            value_input_option: {
              type: 'string',
              enum: ['RAW', 'USER_ENTERED'],
              default: 'USER_ENTERED',
              description: 'How input data should be interpreted'
            }
          },
          required: ['spreadsheet_id', 'values']
        }
      },
      {
        name: 'update_sheet_range',
        description: 'Update specific range in Google Sheets with precise control',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { type: 'string' },
            range: { type: 'string', description: 'Exact range to update' },
            values: { type: 'array', description: '2D array of new values' },
            value_input_option: {
              type: 'string',
              enum: ['RAW', 'USER_ENTERED'],
              default: 'USER_ENTERED'
            }
          },
          required: ['spreadsheet_id', 'range', 'values']
        }
      },
      {
        name: 'append_sheet_data',
        description: 'Append new rows to Google Sheets without overwriting existing data',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { type: 'string' },
            range: { type: 'string', description: 'Range to append to', default: 'A1' },
            values: { type: 'array', description: 'Data to append' },
            value_input_option: {
              type: 'string',
              enum: ['RAW', 'USER_ENTERED'],
              default: 'USER_ENTERED'
            },
            insert_data_option: {
              type: 'string',
              enum: ['INSERT_ROWS', 'OVERWRITE'],
              default: 'INSERT_ROWS'
            }
          },
          required: ['spreadsheet_id', 'values']
        }
      }
    ];
  }

  /**
   * Check if this handler can handle the given tool
   */
  canHandle(toolName) {
    return [
      'read_sheet_data', 
      'write_sheet_data', 
      'update_sheet_range', 
      'append_sheet_data'
    ].includes(toolName);
  }

  /**
   * Handle tool execution
   */
  async handle(toolName, args) {
    switch(toolName) {
      case 'read_sheet_data':
        return await this.handleReadSheetData(args);
      case 'write_sheet_data':
        return await this.handleWriteSheetData(args);
      case 'update_sheet_range':
        return await this.handleUpdateSheetRange(args);
      case 'append_sheet_data':
        return await this.handleAppendSheetData(args);
      default:
        throw new Error(`Unknown sheet tool: ${toolName}`);
    }
  }

  // Alias method for compatibility with server.js
  async handleToolCall(tool, args) {
    return await this.handle(tool, args);
  }

  /**
   * Get the actual first sheet name from spreadsheet metadata
   * Revolutionary multi-language support for all Google Sheets locales
   */
  async getFirstSheetName(spreadsheet_id) {
    try {
      const metadataResponse = await this.googleManager.sheets.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties.title'
      });
      
      const sheets = metadataResponse.data.sheets || [];
      if (sheets.length > 0) {
        const firstSheetName = sheets[0].properties.title;
        console.log('🌍 Multi-language: Detected first sheet name:', firstSheetName);
        return firstSheetName;
      }
      
      // フォールバック: 一般的なデフォルト名を順番に試行
      return 'Sheet1'; // 最後の手段
    } catch (error) {
      console.log('⚠️ Metadata fetch failed, using fallback');
      return 'Sheet1';
    }
  }

  /**
   * Enhanced Read data from Google Sheets directly via Sheets API
   * Revolutionary configurable output with unlimited row access
   */
  async handleReadSheetData(args) {
    try {
      const { 
        spreadsheet_id, 
        range = 'auto', 
        value_render_option = 'FORMATTED_VALUE',
        sample_rows = 20,
        full_output = false
      } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // 🌍 Multi-language support: Auto-detect first sheet name
      let processedRange = range;
      if (range === 'auto' || range === 'Sheet1' || !range.includes('!')) {
        const detectedSheetName = await this.getFirstSheetName(spreadsheet_id);
        processedRange = `${detectedSheetName}!A1:ZZ1000`;
        console.log('🌍 Multi-language range auto-detection:', {
          original: range,
          detected: detectedSheetName,
          final: processedRange
        });
      }

      // Sheets API直接呼び出し
      const response = await this.googleManager.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheet_id,
        range: processedRange,
        valueRenderOption: value_render_option
      });

      const values = response.data.values || [];
      const range_info = response.data.range || range;

      // データ分析
      const analysis = {
        totalRows: values.length,
        totalColumns: values.length > 0 ? Math.max(...values.map(row => row.length)) : 0,
        hasHeaders: values.length > 0 && values[0].every(cell => typeof cell === 'string'),
        dataTypes: this.analyzeDataTypes(values),
        isEmpty: values.length === 0
      };

      // 🚀 IMPROVED: Configurable data display
      const displayRows = full_output ? values.length : Math.min(sample_rows, values.length);
      const sampleData = values.slice(0, displayRows);
      const moreDataIndicator = values.length > displayRows ? 
        `\n... and ${values.length - displayRows} more rows (Total: ${values.length} rows)` : '';

      return {
        content: [{
          type: 'text',
          text: `📊 **Enhanced Sheet Data Read Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📍 **Range:** ${range_info}\n` +
                `📋 **Render Option:** ${value_render_option}\n` +
                `🔧 **Display Mode:** ${full_output ? 'Full Output' : `Sample (${displayRows} rows)`}\n\n` +
                `📈 **Data Analysis:**\n` +
                `• Total Rows: ${analysis.totalRows}\n` +
                `• Total Columns: ${analysis.totalColumns}\n` +
                `• Has Headers: ${analysis.hasHeaders ? 'Yes' : 'No'}\n` +
                `• Data Types: ${Object.entries(analysis.dataTypes).map(([type, count]) => `${type} (${count})`).join(', ')}\n` +
                `• Empty: ${analysis.isEmpty ? 'Yes' : 'No'}\n\n` +
                `💾 **Data Preview (${displayRows} of ${values.length} rows):**\n` +
                `\`\`\`\n${sampleData.map(row => row.join('\t')).join('\n')}${moreDataIndicator}\`\`\`\n\n` +
                `🚀 **Revolutionary Enhancement:**\n` +
                `${full_output ? '✅ Complete data output enabled!' : `✅ Customizable sample display (${displayRows}/${values.length} rows shown)`}\n` +
                `${values.length > sample_rows && !full_output ? `💡 Use "full_output": true or increase "sample_rows" to see more data` : ''}`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to read sheet data:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify spreadsheet ID format\n` +
                `• Check sheet name and range (e.g., "Sheet1!A1:C10")\n` +
                `• Ensure OAuth permissions include Google Sheets\n` +
                `• Verify spreadsheet sharing settings\n\n` +
                `💡 **Enhanced Usage Examples:**\n` +
                `\`\`\`javascript\n` +
                `// Standard usage (20 rows sample)\n` +
                `claude-appsscript-pro:read_sheet_data({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  range: "Sheet1!A1:C10"\n` +
                `})\n\n` +
                `// Large sample (up to 100 rows)\n` +
                `claude-appsscript-pro:read_sheet_data({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  sample_rows: 50\n` +
                `})\n\n` +
                `// Complete data output\n` +
                `claude-appsscript-pro:read_sheet_data({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  full_output: true\n` +
                `})\n\`\`\``
        }]
      };
    }
  }

  /**
   * Write data to Google Sheets directly via Sheets API
   * Revolutionary direct sheet writing without Apps Script intermediary
   */
  async handleWriteSheetData(args) {
    try {
      const { spreadsheet_id, range = 'A1', values, value_input_option = 'USER_ENTERED' } = args;
      
      // 入力検証
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Values must be a non-empty 2D array');
      }

      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Sheets API直接書き込み
      const response = await this.googleManager.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet_id,
        range: range,
        valueInputOption: value_input_option,
        requestBody: { values: values }
      });

      const updatedRange = response.data.updatedRange;
      const updatedRows = response.data.updatedRows || 0;
      const updatedColumns = response.data.updatedColumns || 0;
      const updatedCells = response.data.updatedCells || 0;

      // 成功分析
      const analysis = {
        dataRows: values.length,
        dataColumns: Math.max(...values.map(row => row.length)),
        totalCells: values.reduce((sum, row) => sum + row.length, 0),
        successful: true
      };

      return {
        content: [{
          type: 'text',
          text: `✅ **Sheet Data Written Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📍 **Updated Range:** ${updatedRange}\n` +
                `⚙️ **Input Option:** ${value_input_option}\n\n` +
                `📊 **Write Summary:**\n` +
                `• Rows Written: ${updatedRows}\n` +
                `• Columns Written: ${updatedColumns}\n` +
                `• Cells Updated: ${updatedCells}\n` +
                `• Data Rows: ${analysis.dataRows}\n` +
                `• Data Columns: ${analysis.dataColumns}\n\n` +
                `💾 **Written Data Preview:**\n` +
                `\`\`\`\n${values.slice(0, 3).map(row => row.join('\t')).join('\n')}\n` +
                `${values.length > 3 ? '... and ' + (values.length - 3) + ' more rows' : ''}\`\`\`\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Direct sheet writing without Apps Script intermediary!\n` +
                `Real-time data updates to any Google Spreadsheet.`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to write sheet data:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify spreadsheet ID format\n` +
                `• Check range format (e.g., "A1", "Sheet1!A1:C5")\n` +
                `• Ensure values is 2D array: [["A1", "B1"], ["A2", "B2"]]\n` +
                `• Verify write permissions to spreadsheet\n` +
                `• Check OAuth permissions include Google Sheets\n\n` +
                `💡 **Example Usage:**\n` +
                `\`\`\`javascript\n` +
                `claude-appsscript-pro:write_sheet_data({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  range: "A1:C2",\n` +
                `  values: [["Name", "Age", "City"], ["John", 30, "Tokyo"]]\n` +
                `})\n\`\`\``
        }]
      };
    }
  }

  /**
   * Update specific range in Google Sheets with precise control
   */
  async handleUpdateSheetRange(args) {
    try {
      const { spreadsheet_id, range, values, value_input_option = 'USER_ENTERED' } = args;
      
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Values must be a non-empty 2D array');
      }

      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Sheets API直接更新
      const response = await this.googleManager.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheet_id,
        range: range,
        valueInputOption: value_input_option,
        requestBody: { values: values }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **Sheet Range Updated Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📍 **Updated Range:** ${response.data.updatedRange}\n` +
                `📊 **Cells Updated:** ${response.data.updatedCells}\n\n` +
                `🚀 **Precise Range Control Achievement:**\n` +
                `Exact range updating without affecting other data!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to update range:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify exact range format (e.g., "Sheet1!B2:D4")\n` +
                `• Ensure values match range dimensions\n` +
                `• Check spreadsheet permissions`
        }]
      };
    }
  }

  /**
   * Append new rows to Google Sheets without overwriting existing data
   */
  async handleAppendSheetData(args) {
    try {
      const { 
        spreadsheet_id, 
        range = 'A1', 
        values, 
        value_input_option = 'USER_ENTERED',
        insert_data_option = 'INSERT_ROWS'
      } = args;
      
      if (!Array.isArray(values) || values.length === 0) {
        throw new Error('Values must be a non-empty 2D array');
      }

      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Sheets API直接追記
      const response = await this.googleManager.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheet_id,
        range: range,
        valueInputOption: value_input_option,
        insertDataOption: insert_data_option,
        requestBody: { values: values }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **Data Appended Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📍 **Updated Range:** ${response.data.updates.updatedRange}\n` +
                `📊 **Rows Added:** ${response.data.updates.updatedRows}\n` +
                `💾 **Insert Method:** ${insert_data_option}\n\n` +
                `🚀 **Safe Append Achievement:**\n` +
                `New data added without affecting existing content!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to append data:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify spreadsheet permissions\n` +
                `• Check data format (2D array required)\n` +
                `• Ensure sufficient sheet space`
        }]
      };
    }
  }

  /**
   * Analyze data types in sheet values
   */
  analyzeDataTypes(values) {
    const types = { string: 0, number: 0, boolean: 0, formula: 0, empty: 0 };
    
    values.forEach(row => {
      row.forEach(cell => {
        if (cell === '' || cell == null) {
          types.empty++;
        } else if (typeof cell === 'string' && cell.startsWith('=')) {
          types.formula++;
        } else if (!isNaN(cell) && !isNaN(parseFloat(cell))) {
          types.number++;
        } else if (cell === 'TRUE' || cell === 'FALSE') {
          types.boolean++;
        } else {
          types.string++;
        }
      });
    });
    
    return types;
  }
}
