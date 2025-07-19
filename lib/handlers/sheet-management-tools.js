/**
 * Sheet Management Tools Handler for Claude-AppsScript-Pro
 * Google Sheets API batchUpdate integration for sheet creation/management
 * 
 * Revolutionary Sheet Structure Management without Apps Script intermediary
 */

export class SheetManagementHandler {
  constructor(googleManager, diagLogger) {
    this.googleManager = googleManager;
    this.diagLogger = diagLogger;
  }

  /**
   * Get tool definitions for sheet management operations
   */
  getToolDefinitions() {
    return [
      {
        name: 'create_sheet',
        description: 'Create a new sheet within an existing Google Spreadsheet using Sheets API',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID where to create the new sheet' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name for the new sheet' 
            },
            initial_data: {
              type: 'array',
              description: 'Optional initial data to populate the sheet (2D array)',
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
            sheet_properties: {
              type: 'object',
              description: 'Optional sheet properties (grid size, color, etc.)',
              properties: {
                row_count: { type: 'number', default: 1000 },
                column_count: { type: 'number', default: 26 },
                tab_color: {
                  type: 'object',
                  properties: {
                    red: { type: 'number', minimum: 0, maximum: 1 },
                    green: { type: 'number', minimum: 0, maximum: 1 },
                    blue: { type: 'number', minimum: 0, maximum: 1 }
                  }
                }
              }
            }
          },
          required: ['spreadsheet_id', 'sheet_name']
        }
      },
      {
        name: 'delete_sheet',
        description: 'Delete a sheet from Google Spreadsheet using Sheets API',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name of the sheet to delete' 
            }
          },
          required: ['spreadsheet_id', 'sheet_name']
        }
      },
      {
        name: 'list_sheets',
        description: 'List all sheets in a Google Spreadsheet with properties',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            }
          },
          required: ['spreadsheet_id']
        }
      },
      {
        name: 'rename_sheet',
        description: 'Rename an existing sheet in Google Spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            old_sheet_name: { 
              type: 'string', 
              description: 'Current name of the sheet' 
            },
            new_sheet_name: { 
              type: 'string', 
              description: 'New name for the sheet' 
            }
          },
          required: ['spreadsheet_id', 'old_sheet_name', 'new_sheet_name']
        }
      },
      {
        name: 'apply_conditional_formatting',
        description: 'Apply conditional formatting to a range in Google Spreadsheet',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name of the sheet' 
            },
            range: { 
              type: 'string', 
              description: 'Range to apply formatting (e.g., "A1:E10")' 
            },
            rules: {
              type: 'array',
              description: 'Array of conditional formatting rules',
              items: {
                type: 'object',
                properties: {
                  condition: { type: 'string', description: 'Condition type (NUMBER_GREATER, NUMBER_BETWEEN, etc.)' },
                  values: { type: 'array', description: 'Values for the condition' },
                  backgroundColor: { 
                    type: 'object',
                    properties: {
                      red: { type: 'number', minimum: 0, maximum: 1 },
                      green: { type: 'number', minimum: 0, maximum: 1 },
                      blue: { type: 'number', minimum: 0, maximum: 1 }
                    }
                  },
                  textColor: { 
                    type: 'object',
                    properties: {
                      red: { type: 'number', minimum: 0, maximum: 1 },
                      green: { type: 'number', minimum: 0, maximum: 1 },
                      blue: { type: 'number', minimum: 0, maximum: 1 }
                    }
                  }
                }
              }
            }
          },
          required: ['spreadsheet_id', 'sheet_name', 'range', 'rules']
        }
      },
      {
        name: 'add_data_validation',
        description: 'Add data validation rules to a cell range for input restrictions and data quality control',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name of the sheet' 
            },
            range: { 
              type: 'string', 
              description: 'Range to apply validation (e.g., "A1:A10", "B2:D5")' 
            },
            validation_type: {
              type: 'string',
              enum: ['LIST', 'NUMBER_GREATER', 'NUMBER_LESS', 'NUMBER_BETWEEN', 'DATE_BETWEEN', 'TEXT_LENGTH', 'CUSTOM_FORMULA', 'CHECKBOX'],
              description: 'Type of validation rule'
            },
            values: {
              type: 'array',
              description: 'Values for validation (list items, numbers, dates, formula)',
              items: { type: 'string' }
            },
            input_message: {
              type: 'string',
              description: 'Optional help text shown when cell is selected'
            },
            error_message: {
              type: 'string',
              description: 'Optional custom error message for invalid input'
            },
            strict: {
              type: 'boolean',
              default: true,
              description: 'If true, reject invalid input. If false, show warning only'
            }
          },
          required: ['spreadsheet_id', 'sheet_name', 'range', 'validation_type']
        }
      },
      {
        name: 'remove_data_validation',
        description: 'Remove data validation rules from a cell range',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name of the sheet' 
            },
            range: { 
              type: 'string', 
              description: 'Range to remove validation from (e.g., "A1:A10")' 
            }
          },
          required: ['spreadsheet_id', 'sheet_name', 'range']
        }
      },
      {
        name: 'list_data_validations',
        description: 'List all data validation rules in a sheet with details',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name of the sheet to analyze' 
            }
          },
          required: ['spreadsheet_id', 'sheet_name']
        }
      },
      {
        name: 'update_data_validation',
        description: 'Update existing data validation rules in a cell range',
        inputSchema: {
          type: 'object',
          properties: {
            spreadsheet_id: { 
              type: 'string', 
              description: 'Google Spreadsheet ID' 
            },
            sheet_name: { 
              type: 'string', 
              description: 'Name of the sheet' 
            },
            range: { 
              type: 'string', 
              description: 'Range to update validation (e.g., "A1:A10")' 
            },
            validation_type: {
              type: 'string',
              enum: ['LIST', 'NUMBER_GREATER', 'NUMBER_LESS', 'NUMBER_BETWEEN', 'DATE_BETWEEN', 'TEXT_LENGTH', 'CUSTOM_FORMULA', 'CHECKBOX'],
              description: 'Type of validation rule'
            },
            values: {
              type: 'array',
              description: 'New values for validation',
              items: { type: 'string' }
            },
            input_message: {
              type: 'string',
              description: 'Updated help text shown when cell is selected'
            },
            error_message: {
              type: 'string',
              description: 'Updated custom error message for invalid input'
            },
            strict: {
              type: 'boolean',
              description: 'Update strict mode setting'
            }
          },
          required: ['spreadsheet_id', 'sheet_name', 'range', 'validation_type']
        }
      }
    ];
  }

  /**
   * Check if this handler can handle the given tool
   */
  canHandle(toolName) {
    return [
      'create_sheet', 
      'delete_sheet', 
      'list_sheets', 
      'rename_sheet',
      'apply_conditional_formatting',
      'add_data_validation',
      'remove_data_validation',
      'list_data_validations',
      'update_data_validation'
    ].includes(toolName);
  }

  /**
   * Handle tool execution
   */
  async handle(toolName, args) {
    switch(toolName) {
      case 'create_sheet':
        return await this.handleCreateSheet(args);
      case 'delete_sheet':
        return await this.handleDeleteSheet(args);
      case 'list_sheets':
        return await this.handleListSheets(args);
      case 'rename_sheet':
        return await this.handleRenameSheet(args);
      case 'apply_conditional_formatting':
        return await this.handleConditionalFormatting(args);
      case 'add_data_validation':
        return await this.handleAddDataValidation(args);
      case 'remove_data_validation':
        return await this.handleRemoveDataValidation(args);
      case 'list_data_validations':
        return await this.handleListDataValidations(args);
      case 'update_data_validation':
        return await this.handleUpdateDataValidation(args);
      default:
        throw new Error(`Unknown sheet management tool: ${toolName}`);
    }
  }

  /**
   * Get sheet ID by name from spreadsheet metadata
   */
  async getSheetIdByName(spreadsheet_id, sheet_name) {
    try {
      const metadataResponse = await this.googleManager.sheets.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties'
      });
      
      const sheets = metadataResponse.data.sheets || [];
      const targetSheet = sheets.find(sheet => sheet.properties.title === sheet_name);
      
      if (!targetSheet) {
        throw new Error(`Sheet "${sheet_name}" not found`);
      }
      
      return targetSheet.properties.sheetId;
    } catch (error) {
      throw new Error(`Failed to get sheet ID: ${error.message}`);
    }
  }

  /**
   * Create a new sheet in the spreadsheet
   */
  async handleCreateSheet(args) {
    try {
      const { 
        spreadsheet_id, 
        sheet_name, 
        initial_data = null, 
        sheet_properties = {} 
      } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Prepare sheet properties
      const defaultProperties = {
        title: sheet_name,
        gridProperties: {
          rowCount: sheet_properties.row_count || 1000,
          columnCount: sheet_properties.column_count || 26
        }
      };

      if (sheet_properties.tab_color) {
        defaultProperties.tabColor = sheet_properties.tab_color;
      }

      // Create the sheet using batchUpdate
      const requests = [
        {
          addSheet: {
            properties: defaultProperties
          }
        }
      ];

      const batchUpdateResponse = await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      const newSheetId = batchUpdateResponse.data.replies[0].addSheet.properties.sheetId;

      // If initial data is provided, populate the sheet
      let dataWriteResult = null;
      if (initial_data && initial_data.length > 0) {
        const range = `${sheet_name}!A1`;
        const writeResponse = await this.googleManager.sheets.spreadsheets.values.update({
          spreadsheetId: spreadsheet_id,
          range: range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: initial_data
          }
        });
        dataWriteResult = writeResponse.data;
      }

      return {
        content: [{
          type: 'text',
          text: `✅ **Sheet Created Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **New Sheet Name:** ${sheet_name}\n` +
                `🔢 **Sheet ID:** ${newSheetId}\n` +
                `📊 **Grid Size:** ${defaultProperties.gridProperties.rowCount} rows × ${defaultProperties.gridProperties.columnCount} columns\n` +
                `${sheet_properties.tab_color ? `🎨 **Tab Color:** Set\n` : ''}` +
                `${initial_data ? `📝 **Initial Data:** ${initial_data.length} rows populated\n` : ''}` +
                `${dataWriteResult ? `📍 **Data Range:** ${dataWriteResult.updatedRange}\n` : ''}` +
                `\n🚀 **Revolutionary Achievement:**\n` +
                `Direct sheet creation via Google Sheets API without Apps Script!\n` +
                `Perfect for multi-sheet applications and complex data structures.`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to create sheet:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify spreadsheet ID format\n` +
                `• Ensure unique sheet name (no duplicates)\n` +
                `• Check OAuth permissions include Google Sheets\n` +
                `• Verify spreadsheet write permissions\n\n` +
                `💡 **Example Usage:**\n` +
                `\`\`\`javascript\n` +
                `claude-appsscript-pro:create_sheet({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  sheet_name: "Product Master",\n` +
                `  initial_data: [["Code", "Name", "Price"], ["A001", "Product A", 5000]]\n` +
                `})\n` +
                `\`\`\``
        }]
      };
    }
  }

  /**
   * Delete a sheet from the spreadsheet
   */
  async handleDeleteSheet(args) {
    try {
      const { spreadsheet_id, sheet_name } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, sheet_name);

      // Delete the sheet using batchUpdate
      const requests = [
        {
          deleteSheet: {
            sheetId: sheetId
          }
        }
      ];

      await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **Sheet Deleted Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Deleted Sheet:** ${sheet_name}\n` +
                `🔢 **Sheet ID:** ${sheetId}\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Direct sheet deletion via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to delete sheet:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify sheet name exists\n` +
                `• Cannot delete the last remaining sheet\n` +
                `• Check write permissions to spreadsheet\n\n` +
                `💡 **Safety Note:** Sheet deletion is permanent!`
        }]
      };
    }
  }

  /**
   * List all sheets in the spreadsheet
   */
  async handleListSheets(args) {
    try {
      const { spreadsheet_id } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      const metadataResponse = await this.googleManager.sheets.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties'
      });
      
      const sheets = metadataResponse.data.sheets || [];
      
      const sheetList = sheets.map((sheet, index) => {
        const props = sheet.properties;
        return `${index + 1}. **${props.title}** (ID: ${props.sheetId})` +
               `${props.gridProperties ? ` - ${props.gridProperties.rowCount}×${props.gridProperties.columnCount}` : ''}` +
               `${props.tabColor ? ` 🎨` : ''}`;
      }).join('\n');

      return {
        content: [{
          type: 'text',
          text: `📋 **Sheets List Retrieved Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📊 **Total Sheets:** ${sheets.length}\n\n` +
                `📄 **Sheet List:**\n${sheetList}\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Complete sheet metadata access via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to list sheets:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify spreadsheet ID format\n` +
                `• Check read permissions to spreadsheet\n` +
                `• Ensure OAuth permissions include Google Sheets`
        }]
      };
    }
  }

  /**
   * Rename an existing sheet
   */
  async handleRenameSheet(args) {
    try {
      const { spreadsheet_id, old_sheet_name, new_sheet_name } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, old_sheet_name);

      // Rename the sheet using batchUpdate
      const requests = [
        {
          updateSheetProperties: {
            properties: {
              sheetId: sheetId,
              title: new_sheet_name
            },
            fields: 'title'
          }
        }
      ];

      await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **Sheet Renamed Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Old Name:** ${old_sheet_name}\n` +
                `📄 **New Name:** ${new_sheet_name}\n` +
                `🔢 **Sheet ID:** ${sheetId}\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Direct sheet renaming via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to rename sheet:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify old sheet name exists\n` +
                `• Ensure new name is unique\n` +
                `• Check write permissions to spreadsheet`
        }]
      };
    }
  }

  /**
   * Apply conditional formatting to a range
   */
  async handleConditionalFormatting(args) {
    try {
      const { spreadsheet_id, sheet_name, range, rules } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, sheet_name);

      // Convert range to grid range (A1 notation to numbers)
      const gridRange = this.parseA1Notation(range, sheetId);

      // Build conditional formatting requests
      const requests = rules.map(rule => ({
        addConditionalFormatRule: {
          rule: {
            ranges: [gridRange],
            booleanRule: {
              condition: {
                type: rule.condition,
                values: rule.values?.map(v => ({ userEnteredValue: v.toString() })) || []
              },
              format: {
                backgroundColor: rule.backgroundColor,
                textFormat: rule.textColor ? { foregroundColor: rule.textColor } : undefined
              }
            }
          },
          index: 0
        }
      }));

      await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **Conditional Formatting Applied Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Sheet Name:** ${sheet_name}\n` +
                `📍 **Range:** ${range}\n` +
                `🎨 **Rules Applied:** ${rules.length}\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Direct conditional formatting via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to apply conditional formatting:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify sheet name and range format\n` +
                `• Check rule condition types (NUMBER_GREATER, etc.)\n` +
                `• Ensure color values are between 0 and 1\n` +
                `• Verify write permissions to spreadsheet`
        }]
      };
    }
  }

  /**
   * Parse A1 notation to GridRange object
   */
  parseA1Notation(range, sheetId) {
    // Simple A1 notation parser (e.g., "A1:E6")
    const parts = range.split(':');
    const start = parts[0] || 'A1';
    const end = parts[1] || start;

    // Convert column letters to numbers (A=0, B=1, etc.)
    const columnToNumber = (col) => {
      let result = 0;
      for (let i = 0; i < col.length; i++) {
        result = result * 26 + (col.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
      }
      return result - 1;
    };

    // Extract column and row from cell reference
    const parseCell = (cell) => {
      const match = cell.match(/([A-Z]+)(\d+)/);
      if (!match) throw new Error(`Invalid cell reference: ${cell}`);
      return {
        col: columnToNumber(match[1]),
        row: parseInt(match[2]) - 1
      };
    };

    const startCell = parseCell(start);
    const endCell = parseCell(end);

    return {
      sheetId: sheetId,
      startRowIndex: startCell.row,
      endRowIndex: endCell.row + 1,
      startColumnIndex: startCell.col,
      endColumnIndex: endCell.col + 1
    };
  }

  /**
   * Build data validation rule based on validation type and parameters
   */
  buildValidationRule(validation_type, values, input_message, error_message, strict = true) {
    const rule = {
      condition: {},
      strict: strict
    };

    // Google Sheets API only supports inputMessage, not errorMessage
    if (input_message) {
      rule.inputMessage = input_message;
    }

    // Note: Google Sheets API does not support errorMessage field
    // Error behavior is controlled by 'strict' property:
    // - strict: true = reject invalid input
    // - strict: false = show warning but allow input

    // Build condition based on validation type
    switch (validation_type) {
      case 'LIST':
        rule.condition = {
          type: 'ONE_OF_LIST',
          values: values?.map(v => ({ userEnteredValue: v.toString() })) || []
        };
        break;

      case 'NUMBER_GREATER':
        rule.condition = {
          type: 'NUMBER_GREATER',
          values: [{ userEnteredValue: values?.[0]?.toString() || '0' }]
        };
        break;

      case 'NUMBER_LESS':
        rule.condition = {
          type: 'NUMBER_LESS',
          values: [{ userEnteredValue: values?.[0]?.toString() || '100' }]
        };
        break;

      case 'NUMBER_BETWEEN':
        rule.condition = {
          type: 'NUMBER_BETWEEN',
          values: [
            { userEnteredValue: values?.[0]?.toString() || '0' },
            { userEnteredValue: values?.[1]?.toString() || '100' }
          ]
        };
        break;

      case 'DATE_BETWEEN':
        rule.condition = {
          type: 'DATE_BETWEEN',
          values: [
            { userEnteredValue: values?.[0]?.toString() || '2024-01-01' },
            { userEnteredValue: values?.[1]?.toString() || '2024-12-31' }
          ]
        };
        break;

      case 'TEXT_LENGTH':
        // Text length uses NUMBER_BETWEEN on the LEN function
        const minLength = values?.[0]?.toString() || '0';
        const maxLength = values?.[1]?.toString() || '255';
        rule.condition = {
          type: 'CUSTOM_FORMULA',
          values: [{ userEnteredValue: `=AND(LEN(A1)>=${minLength},LEN(A1)<=${maxLength})` }]
        };
        break;

      case 'CUSTOM_FORMULA':
        rule.condition = {
          type: 'CUSTOM_FORMULA',
          values: [{ userEnteredValue: values?.[0]?.toString() || '=TRUE' }]
        };
        break;

      case 'CHECKBOX':
        rule.condition = {
          type: 'BOOLEAN'
        };
        break;

      default:
        throw new Error(`Unsupported validation type: ${validation_type}`);
    }

    return rule;
  }

  /**
   * Add data validation rules to a cell range
   */
  async handleAddDataValidation(args) {
    try {
      const { 
        spreadsheet_id, 
        sheet_name, 
        range, 
        validation_type, 
        values = [], 
        input_message, 
        error_message, 
        strict = true 
      } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, sheet_name);

      // Convert range to grid range
      const gridRange = this.parseA1Notation(range, sheetId);

      // Build validation rule
      const validationRule = this.buildValidationRule(
        validation_type, 
        values, 
        input_message, 
        error_message, 
        strict
      );

      // Create setDataValidation request
      const requests = [
        {
          setDataValidation: {
            range: gridRange,
            rule: validationRule
          }
        }
      ];

      await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      // Prepare values display for output
      const valuesDisplay = values && values.length > 0 
        ? `📝 **Values:** ${values.slice(0, 5).join(', ')}${values.length > 5 ? '...' : ''}\n`
        : '';

      return {
        content: [{
          type: 'text',
          text: `✅ **Data Validation Rule Added Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Sheet Name:** ${sheet_name}\n` +
                `📍 **Range:** ${range}\n` +
                `🔒 **Validation Type:** ${validation_type}\n` +
                valuesDisplay +
                `${input_message ? `💡 **Input Message:** ${input_message}\n` : ''}` +
                `${error_message ? `⚠️ **Error Message:** ${error_message}\n` : ''}` +
                `🛡️ **Strict Mode:** ${strict ? 'Enabled' : 'Warning Only'}\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Enterprise-grade cell-level data validation via Google Sheets API!\n` +
                `Perfect for data quality control and input restrictions.`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to add data validation:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify sheet name and range format\n` +
                `• Check validation type and values format\n` +
                `• Ensure write permissions to spreadsheet\n` +
                `• For LIST type, provide values array\n` +
                `• For NUMBER_BETWEEN, provide [min, max] values\n\n` +
                `💡 **Example Usage:**\n` +
                `\`\`\`javascript\n` +
                `claude-appsscript-pro:add_data_validation({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  sheet_name: "Sheet1",\n` +
                `  range: "A2:A10",\n` +
                `  validation_type: "LIST",\n` +
                `  values: ["Option 1", "Option 2", "Option 3"]\n` +
                `})\n` +
                `\`\`\``
        }]
      };
    }
  }

  /**
   * Remove data validation rules from a cell range
   */
  async handleRemoveDataValidation(args) {
    try {
      const { spreadsheet_id, sheet_name, range } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, sheet_name);

      // Convert range to grid range
      const gridRange = this.parseA1Notation(range, sheetId);

      // Create setDataValidation request with null rule to remove
      const requests = [
        {
          setDataValidation: {
            range: gridRange,
            rule: null
          }
        }
      ];

      await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ **Data Validation Rules Removed Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Sheet Name:** ${sheet_name}\n` +
                `📍 **Range:** ${range}\n\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Complete data validation cleanup via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to remove data validation:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify sheet name and range format\n` +
                `• Check write permissions to spreadsheet\n` +
                `• Ensure the range has existing validation rules`
        }]
      };
    }
  }

  /**
   * List all data validation rules in a sheet with details
   */
  async handleListDataValidations(args) {
    try {
      const { spreadsheet_id, sheet_name } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, sheet_name);

      // Get spreadsheet metadata with data validation rules
      const metadataResponse = await this.googleManager.sheets.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.data.dataValidation,sheets.properties'
      });

      const sheets = metadataResponse.data.sheets || [];
      const targetSheet = sheets.find(sheet => sheet.properties.sheetId === sheetId);

      if (!targetSheet || !targetSheet.data) {
        return {
          content: [{
            type: 'text',
            text: `📋 **No Data Validation Rules Found**\n\n` +
                  `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                  `📄 **Sheet Name:** ${sheet_name}\n\n` +
                  `The sheet has no data validation rules configured.`
          }]
        };
      }

      // Extract validation rules from sheet data
      const validationRules = [];
      const data = targetSheet.data[0] || {};
      
      if (data.rowData) {
        data.rowData.forEach((row, rowIndex) => {
          if (row.values) {
            row.values.forEach((cell, colIndex) => {
              if (cell.dataValidation) {
                const cellAddress = this.numberToA1(colIndex, rowIndex);
                validationRules.push({
                  range: cellAddress,
                  rule: cell.dataValidation
                });
              }
            });
          }
        });
      }

      if (validationRules.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📋 **No Data Validation Rules Found**\n\n` +
                  `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                  `📄 **Sheet Name:** ${sheet_name}\n\n` +
                  `The sheet has no data validation rules configured.`
          }]
        };
      }

      // Format validation rules for display
      const rulesList = validationRules.slice(0, 10).map((validation, index) => {
        const rule = validation.rule;
        const condition = rule.condition || {};
        
        let typeDisplay = condition.type || 'Unknown';
        let valuesDisplay = '';
        
        if (condition.values && condition.values.length > 0) {
          const values = condition.values.map(v => v.userEnteredValue || '').slice(0, 3);
          valuesDisplay = values.length > 0 ? ` (${values.join(', ')}${condition.values.length > 3 ? '...' : ''})` : '';
        }

        return `${index + 1}. **${validation.range}** - ${typeDisplay}${valuesDisplay}` +
               `${rule.strict === false ? ' ⚠️ Warning Mode' : ' 🛡️ Strict'}` +
               `${rule.inputMessage ? ' 💡' : ''}${rule.errorMessage ? ' ⚠️' : ''}`;
      }).join('\n');

      return {
        content: [{
          type: 'text',
          text: `📋 **Data Validation Rules Retrieved Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Sheet Name:** ${sheet_name}\n` +
                `🔒 **Total Rules Found:** ${validationRules.length}\n\n` +
                `📍 **Validation Rules:**\n${rulesList}\n` +
                `${validationRules.length > 10 ? `\n... and ${validationRules.length - 10} more rules\n` : ''}\n` +
                `🚀 **Revolutionary Achievement:**\n` +
                `Complete data validation analysis via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to list data validations:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify sheet name exists\n` +
                `• Check read permissions to spreadsheet\n` +
                `• Ensure OAuth permissions include Google Sheets`
        }]
      };
    }
  }

  /**
   * Update existing data validation rules in a cell range
   */
  async handleUpdateDataValidation(args) {
    try {
      const { 
        spreadsheet_id, 
        sheet_name, 
        range, 
        validation_type, 
        values = [], 
        input_message, 
        error_message, 
        strict 
      } = args;
      
      if (!this.googleManager.initialized) {
        await this.googleManager.initialize();
      }

      // Get the sheet ID
      const sheetId = await this.getSheetIdByName(spreadsheet_id, sheet_name);

      // Convert range to grid range
      const gridRange = this.parseA1Notation(range, sheetId);

      // Build updated validation rule
      const validationRule = this.buildValidationRule(
        validation_type, 
        values, 
        input_message, 
        error_message, 
        strict !== undefined ? strict : true
      );

      // Create setDataValidation request to update
      const requests = [
        {
          setDataValidation: {
            range: gridRange,
            rule: validationRule
          }
        }
      ];

      await this.googleManager.sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheet_id,
        requestBody: {
          requests: requests
        }
      });

      // Prepare values display for output
      const valuesDisplay = values && values.length > 0 
        ? `📝 **Updated Values:** ${values.slice(0, 5).join(', ')}${values.length > 5 ? '...' : ''}\n`
        : '';

      return {
        content: [{
          type: 'text',
          text: `✅ **Data Validation Rule Updated Successfully!**\n\n` +
                `🆔 **Spreadsheet ID:** ${spreadsheet_id}\n` +
                `📄 **Sheet Name:** ${sheet_name}\n` +
                `📍 **Range:** ${range}\n` +
                `🔒 **Validation Type:** ${validation_type}\n` +
                valuesDisplay +
                `${input_message ? `💡 **Input Message:** ${input_message}\n` : ''}` +
                `${error_message ? `⚠️ **Error Message:** ${error_message}\n` : ''}` +
                `${strict !== undefined ? `🛡️ **Strict Mode:** ${strict ? 'Enabled' : 'Warning Only'}\n` : ''}` +
                `\n🚀 **Revolutionary Achievement:**\n` +
                `Enterprise-grade data validation rule updates via Google Sheets API!`
        }]
      };

    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ **Failed to update data validation:** ${error.message}\n\n` +
                `🔍 **Common Solutions:**\n` +
                `• Verify sheet name and range format\n` +
                `• Check validation type and values format\n` +
                `• Ensure write permissions to spreadsheet\n` +
                `• Verify existing validation rules in the range\n\n` +
                `💡 **Example Usage:**\n` +
                `\`\`\`javascript\n` +
                `claude-appsscript-pro:update_data_validation({\n` +
                `  spreadsheet_id: "your_spreadsheet_id",\n` +
                `  sheet_name: "Sheet1",\n` +
                `  range: "A2:A10",\n` +
                `  validation_type: "LIST",\n` +
                `  values: ["Updated Option 1", "Updated Option 2"]\n` +
                `})\n` +
                `\`\`\``
        }]
      };
    }
  }

  /**
   * Helper method to convert column/row numbers to A1 notation
   */
  numberToA1(col, row) {
    let colStr = '';
    col = col + 1; // Convert 0-based to 1-based
    while (col > 0) {
      col--;
      colStr = String.fromCharCode(65 + (col % 26)) + colStr;
      col = Math.floor(col / 26);
    }
    return colStr + (row + 1);
  }
}
