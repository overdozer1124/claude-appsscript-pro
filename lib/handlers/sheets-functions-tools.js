/**
 * Google Sheets Functions Database Tools - Fixed Version
 * 関数データベース統合システム（修正版）
 * 514関数・90%削減達成 - MCP互換性完全対応
 * 
 * @description Claude認識エラー防止・関数データベース統合MCPツール
 * @author Claude-AppsScript-Pro Development Team  
 * @version Fixed-v2025.07.05
 */

import { GoogleAPIsManager } from '../core/google-apis-manager.js';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Google Sheets関数データベースツールクラス（server.js統合版）
 * server.jsからのexportを直接参照する方式
 */
export class SheetsFunctionsTools {
    constructor(googleManager = null, serverExports = null) {
        this.googleManager = googleManager;
        this.database = null;
        this.isInitialized = false;
        this.getFunctionInfo = null;
        this.searchFunctions = null;
        this.FunctionsDatabaseManager = null;
        this.serverExports = serverExports; // server.jsからのexport参照
        
        // ✅ 即座に初期化を試行（コンストラクタ内）
        if (serverExports && typeof serverExports === 'object') {
            console.error('[SHEETS-FUNCTIONS] Constructor: Immediate initialization attempt');
            this.immediateInit();
        }
    }
    
    /**
     * ✅ 即座初期化メソッド（同期処理）
     */
    immediateInit() {
        try {
            console.error('[SHEETS-FUNCTIONS] ImmediateInit: Starting...');
            console.error('[SHEETS-FUNCTIONS] ImmediateInit: serverExports keys:', Object.keys(this.serverExports));
            
            // 関数を直接代入
            this.getFunctionInfo = this.serverExports.getFunctionInfo;
            this.searchFunctions = this.serverExports.searchFunctions;
            this.FunctionsDatabaseManager = this.serverExports.FunctionsDatabaseManager;
            
            console.error('[SHEETS-FUNCTIONS] ImmediateInit: Function assignment complete:');
            console.error(`  getFunctionInfo: ${typeof this.getFunctionInfo}`);
            console.error(`  searchFunctions: ${typeof this.searchFunctions}`);
            
            if (typeof this.getFunctionInfo === 'function' && typeof this.searchFunctions === 'function') {
                this.isInitialized = true;
                console.error('[SHEETS-FUNCTIONS] ✅ ImmediateInit: SUCCESS - Functions ready');
                
                // 動作テスト
                const testResult = this.getFunctionInfo('VLOOKUP');
                console.error('[SHEETS-FUNCTIONS] ImmediateInit test result:', testResult ? 'SUCCESS' : 'FAILED');
            } else {
                console.error('[SHEETS-FUNCTIONS] ❌ ImmediateInit: FAILED - Functions not available');
            }
        } catch (error) {
            console.error('[SHEETS-FUNCTIONS] ImmediateInit error:', error.message);
        }
    }

    /**
     * ✅ 緊急フォールバック機能: 直接データベースアクセス
     */
    async emergencyGetFunctionInfo(functionName) {
        try {
            console.error(`[SHEETS-FUNCTIONS] Emergency: Direct access for ${functionName}`);
            
            // ハードコードされた関数情報（最後の手段）
            const hardcodedFunctions = {
                'VLOOKUP': {
                    syntax: 'VLOOKUP(検索値, 表配列, 列番号, [範囲検索])',
                    description: '縦方向に値を検索し、同じ行の指定列から値を取得します',
                    category: '検索・参照',
                    examples: ['=VLOOKUP(A1, D:F, 3, FALSE)', '=VLOOKUP("太郎", A:C, 2, 0)'],
                    complexity: 4,
                    alternatives: ['XLOOKUP', 'INDEX+MATCH']
                },
                'SUMIF': {
                    syntax: 'SUMIF(範囲, 条件, [合計範囲])',
                    description: '指定した条件に一致するセルの値を合計します',
                    category: '数学・三角',
                    examples: ['=SUMIF(A:A, ">100", B:B)', '=SUMIF(A1:A10, "りんご", B1:B10)'],
                    complexity: 3,
                    alternatives: ['SUMIFS', 'FILTER+SUM']
                },
                'INDEX': {
                    syntax: 'INDEX(配列, 行, [列])',
                    description: '配列内の指定した行と列にあるセルの値を返します',
                    category: '検索・参照',
                    examples: ['=INDEX(A1:C10, 5, 2)', '=INDEX(A:A, 10)'],
                    complexity: 3,
                    alternatives: ['VLOOKUP', 'XLOOKUP']
                },
                'MATCH': {
                    syntax: 'MATCH(検索値, 検索範囲, [照合タイプ])',
                    description: '検索範囲内で値の位置を返します',
                    category: '検索・参照',
                    examples: ['=MATCH("東京", A1:A10, 0)', '=MATCH(100, B:B, 1)'],
                    complexity: 3,
                    alternatives: ['FIND', 'SEARCH']
                }
            };
            
            const result = hardcodedFunctions[functionName.toUpperCase()];
            
            if (result) {
                console.error(`[SHEETS-FUNCTIONS] Emergency: SUCCESS for ${functionName}`);
                return result;
            } else {
                console.error(`[SHEETS-FUNCTIONS] Emergency: NOT_FOUND for ${functionName}`);
                return null;
            }
            
        } catch (error) {
            console.error(`[SHEETS-FUNCTIONS] Emergency failed:`, error.message);
            return null;
        }
    }

    /**
     * ✅ 緊急検索フォールバック機能
     */
    async emergencySearchFunctions(query, maxResults = 5) {
        try {
            console.error(`[SHEETS-FUNCTIONS] Emergency search for: ${query}`);
            
            const functions = ['VLOOKUP', 'SUMIF', 'INDEX', 'MATCH'];
            const results = [];
            
            for (const func of functions) {
                if (func.toLowerCase().includes(query.toLowerCase()) || 
                    query.toLowerCase().includes(func.toLowerCase())) {
                    const info = await this.emergencyGetFunctionInfo(func);
                    if (info) {
                        results.push({
                            function_name: func,
                            ...info,
                            score: 80
                        });
                    }
                }
            }
            
            console.error(`[SHEETS-FUNCTIONS] Emergency search results: ${results.length}`);
            return {
                results: results.slice(0, maxResults),
                total_matches: results.length,
                query: query
            };
            
        } catch (error) {
            console.error(`[SHEETS-FUNCTIONS] Emergency search failed:`, error.message);
            return { results: [], total_matches: 0, query: query };
        }
    }

    /**
     * 関数データベースの初期化（完全修正版）
     * server.jsからの関数参照を優先、フォールバックで直接読み込み
     */
    async initializeDatabase() {
        if (this.isInitialized && this.getFunctionInfo && this.searchFunctions) {
            console.error('[SHEETS-FUNCTIONS] Database already initialized');
            return true;
        }

        try {
            console.error('[SHEETS-FUNCTIONS] Starting database initialization...');
            
            // server.jsからのexportを最優先で使用
            if (this.serverExports && typeof this.serverExports === 'object') {
                console.error('[SHEETS-FUNCTIONS] Using server.js exports directly');
                console.error('[SHEETS-FUNCTIONS] Server exports keys:', Object.keys(this.serverExports));
                
                // 関数を直接代入
                this.getFunctionInfo = this.serverExports.getFunctionInfo;
                this.searchFunctions = this.serverExports.searchFunctions;
                this.FunctionsDatabaseManager = this.serverExports.FunctionsDatabaseManager;
                
                console.error('[SHEETS-FUNCTIONS] Function assignment complete:');
                console.error(`  getFunctionInfo: ${typeof this.getFunctionInfo}`);
                console.error(`  searchFunctions: ${typeof this.searchFunctions}`);
                console.error(`  FunctionsDatabaseManager: ${typeof this.FunctionsDatabaseManager}`);
                
                // 関数存在確認
                if (typeof this.getFunctionInfo !== 'function') {
                    throw new Error('getFunctionInfo is not a function');
                }
                if (typeof this.searchFunctions !== 'function') {
                    throw new Error('searchFunctions is not a function');
                }
                
                // 動作テスト
                console.error('[SHEETS-FUNCTIONS] Testing server export functions...');
                const testResult = this.getFunctionInfo('VLOOKUP');
                console.error('[SHEETS-FUNCTIONS] Server export test result:', testResult ? 'SUCCESS' : 'FAILED');
                
                if (testResult && typeof testResult === 'object') {
                    console.error('[SHEETS-FUNCTIONS] Test result properties:', Object.keys(testResult));
                }
                
                this.isInitialized = true;
                console.error('[SHEETS-FUNCTIONS] ✅ Database initialization via server exports successful');
                return true;
            }
            
            console.error('[SHEETS-FUNCTIONS] Server exports not available, using fallback...');
            throw new Error('Server exports not available, proceeding to fallback');
            
        } catch (error) {
            console.error('[SHEETS-FUNCTIONS] Server exports failed, using fallback import...');
            console.error('[SHEETS-FUNCTIONS] Error:', error.message);
            
            try {
                // フォールバック: 直接読み込み
                const dbPath = path.resolve(__dirname, '../../sheets-functions-test/functions-database/index-ultra-minimal.js');
                const dbUrl = pathToFileURL(dbPath).href;
                
                console.error(`[SHEETS-FUNCTIONS] Fallback loading from: ${dbPath}`);
                
                // ファイル存在確認
                const fs = await import('fs');
                if (!fs.existsSync(dbPath)) {
                    throw new Error(`Database file not found: ${dbPath}`);
                }
                
                // 動的インポート実行（キャッシュ回避）
                const dbModule = await import(dbUrl + '?v=' + Date.now());
                
                console.error('[SHEETS-FUNCTIONS] Fallback module imported successfully');
                console.error('[SHEETS-FUNCTIONS] Available exports:', Object.keys(dbModule));
                
                // 関数を直接参照
                this.getFunctionInfo = dbModule.getFunctionInfo;
                this.searchFunctions = dbModule.searchFunctions;
                this.FunctionsDatabaseManager = dbModule.FunctionsDatabaseManager;
                
                console.error('[SHEETS-FUNCTIONS] Fallback function assignment:');
                console.error(`  getFunctionInfo: ${typeof this.getFunctionInfo}`);
                console.error(`  searchFunctions: ${typeof this.searchFunctions}`);
                console.error(`  FunctionsDatabaseManager: ${typeof this.FunctionsDatabaseManager}`);
                
                // 関数存在確認
                if (typeof this.getFunctionInfo !== 'function') {
                    throw new Error('getFunctionInfo is not a function in fallback module');
                }
                if (typeof this.searchFunctions !== 'function') {
                    throw new Error('searchFunctions is not a function in fallback module');
                }
                
                // 動作テスト
                console.error('[SHEETS-FUNCTIONS] Testing fallback functions...');
                const testResult = this.getFunctionInfo('VLOOKUP');
                console.error('[SHEETS-FUNCTIONS] Fallback test result:', testResult ? 'SUCCESS' : 'FAILED');
                
                this.isInitialized = true;
                console.error('[SHEETS-FUNCTIONS] ✅ Database initialization via fallback successful');
                return true;
                
            } catch (fallbackError) {
                console.error('[SHEETS-FUNCTIONS] ❌ All initialization methods failed');
                console.error('[SHEETS-FUNCTIONS] Fallback error:', fallbackError.message);
                console.error('[SHEETS-FUNCTIONS] Fallback stack:', fallbackError.stack?.substring(0, 1000));
                
                // 最終フォールバック: ダミー関数設定
                this.getFunctionInfo = (functionName) => {
                    console.error(`[SHEETS-FUNCTIONS] Fallback dummy: getFunctionInfo called for ${functionName}`);
                    return null;
                };
                this.searchFunctions = (query) => {
                    console.error(`[SHEETS-FUNCTIONS] Fallback dummy: searchFunctions called for ${query}`);
                    return { results: [], total_matches: 0, query: query };
                };
                
                this.isInitialized = false;
                return false;
            }
        }
    }

    /**
     * フォールバック関数：データベース読み込み失敗時の代替処理
     */
    createFallbackResponse(functionName, error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `❌ **エラー**: ${error}\n\n💡 **ヒント**: 関数名は正確に入力してください（例：VLOOKUP, SUMIF）`
                }
            ]
        };
    }

    /**
     * 軽量化されたツール定義一覧取得
     */
    getToolDefinitions() {
        return [
            {
                name: 'get_sheets_function_info',
                description: '📊 Google Sheets関数の詳細情報取得・Claude認識エラー防止',
                inputSchema: {
                    type: 'object',
                    properties: {
                        function_name: {
                            type: 'string',
                            description: '取得したい関数名（例：VLOOKUP, SUMIF, INDEX）'
                        },
                        include_examples: {
                            type: 'boolean',
                            description: '使用例を含めるか（デフォルト：true）',
                            default: true
                        },
                        include_alternatives: {
                            type: 'boolean', 
                            description: '代替関数を含めるか（デフォルト：true）',
                            default: true
                        }
                    },
                    required: ['function_name'],
                    additionalProperties: false
                }
            },
            {
                name: 'search_sheets_functions',
                description: '🔍 Google Sheets関数検索・Claude知識補完システム',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '検索クエリ（関数名・機能・用途）'
                        },
                        max_results: {
                            type: 'number',
                            description: '最大結果数（デフォルト：10）',
                            default: 10,
                            minimum: 1,
                            maximum: 50
                        },
                        category_filter: {
                            type: 'string',
                            description: 'カテゴリフィルター（optional）'
                        }
                    },
                    required: ['query'],
                    additionalProperties: false
                }
            },
            {
                name: 'validate_sheets_formula',
                description: '✅ Google Sheets数式検証・正確な対応状況確認',
                inputSchema: {
                    type: 'object',
                    properties: {
                        formula: {
                            type: 'string',
                            description: '検証する数式（例：=VLOOKUP(A1,D:F,3,FALSE)）'
                        },
                        context_info: {
                            type: 'string',
                            description: '追加のコンテキスト情報（optional）'
                        }
                    },
                    required: ['formula'],
                    additionalProperties: false
                }
            },
            {
                name: 'suggest_function_alternatives',
                description: '💡 関数代替案提案・最適化選択肢提供',
                inputSchema: {
                    type: 'object', 
                    properties: {
                        function_name: {
                            type: 'string',
                            description: '基準関数名（例：VLOOKUP）'
                        },
                        purpose: {
                            type: 'string',
                            description: '用途・目的（例：データ検索）'
                        },
                        complexity_level: {
                            type: 'string',
                            description: '希望する複雑度レベル（optional）',
                            enum: ['beginner', 'intermediate', 'advanced', 'expert']
                        }
                    },
                    required: ['function_name'],
                    additionalProperties: false
                }
            },
            {
                name: 'analyze_function_complexity',
                description: '📈 関数複雑度分析・学習難易度指標提供',
                inputSchema: {
                    type: 'object',
                    properties: {
                        function_name: {
                            type: 'string',
                            description: '分析する関数名（例：LAMBDA, ARRAYFORMULA）'
                        },
                        context: {
                            type: 'string',
                            description: '分析コンテキスト（optional）'
                        }
                    },
                    required: ['function_name'],
                    additionalProperties: false
                }
            }
        ];
    }

    /**
     * ツール処理判定
     */
    canHandle(toolName) {
        const handledTools = [
            'get_sheets_function_info',
            'search_sheets_functions', 
            'validate_sheets_formula',
            'suggest_function_alternatives',
            'analyze_function_complexity'
        ];
        return handledTools.includes(toolName);
    }

    /**
     * ツール実行ハンドラー（修正版）
     */
    async handleTool(toolName, args) {
        try {
            console.error(`[SHEETS-FUNCTIONS] Tool ${toolName} called`);
            
            // データベース初期化を最初の使用時に実行
            const initialized = await this.initializeDatabase();
            console.error(`[SHEETS-FUNCTIONS] Database initialized: ${initialized}`);
            
            if (!initialized) {
                console.error('[SHEETS-FUNCTIONS] Database initialization failed, returning fallback');
                return this.createFallbackResponse(toolName, '関数データベースの初期化に失敗しました。ログを確認してください。');
            }

            // 初期化後の状態確認
            console.error(`[SHEETS-FUNCTIONS] Post-init state check:`);
            console.error(`  getFunctionInfo: ${typeof this.getFunctionInfo}`);
            console.error(`  searchFunctions: ${typeof this.searchFunctions}`);
            console.error(`  isInitialized: ${this.isInitialized}`);

            switch (toolName) {
                case 'get_sheets_function_info':
                    return await this.handleGetFunctionInfo(args);
                case 'search_sheets_functions':
                    return await this.handleSearchFunctions(args);
                case 'validate_sheets_formula':
                    return await this.handleValidateFormula(args);
                case 'suggest_function_alternatives':
                    return await this.handleSuggestAlternatives(args);
                case 'analyze_function_complexity':
                    return await this.handleAnalyzeComplexity(args);
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }
        } catch (error) {
            console.error(`[SHEETS-FUNCTIONS] Tool execution error for ${toolName}:`, error);
            console.error(`[SHEETS-FUNCTIONS] Error stack:`, error.stack?.substring(0, 500));
            return this.createFallbackResponse(toolName, `実行エラー: ${error.message}`);
        }
    }

    /**
     * 関数詳細情報取得処理（緊急フォールバック版）
     */
    async handleGetFunctionInfo(args) {
        const { function_name, include_examples = true, include_alternatives = true } = args;
        
        try {
            // データベース初期化確認
            await this.initializeDatabase();
            
            let functionInfo = null;
            
            // 通常の関数実行を試行
            if (typeof this.getFunctionInfo === 'function') {
                console.error(`[SHEETS-FUNCTIONS] Using normal getFunctionInfo for: ${function_name}`);
                try {
                    functionInfo = this.getFunctionInfo(function_name);
                } catch (error) {
                    console.error(`[SHEETS-FUNCTIONS] Normal getFunctionInfo failed: ${error.message}`);
                }
            }
            
            // 緊急フォールバック: 直接データベース読み込み
            if (!functionInfo) {
                console.error(`[SHEETS-FUNCTIONS] ⚠️ Activating emergency fallback for: ${function_name}`);
                functionInfo = await this.emergencyGetFunctionInfo(function_name);
            }
            
            if (!functionInfo) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ **関数が見つかりません**: ${function_name}\n\n💡 **提案**: \n• 関数名のスペルを確認してください\n• 大文字・小文字を確認してください（例：VLOOKUP）\n• \`search_sheets_functions\` で関連関数を検索してみてください`
                        }
                    ]
                };
            }

            let responseText = `📊 **${function_name}** - Google Sheets関数情報\n\n**📝 説明**: ${functionInfo.description}\n\n**⚙️ 構文**: \`${functionInfo.syntax}\`\n\n**📋 パラメータ**:\n${functionInfo.parameters ? functionInfo.parameters.map(p => `• **${p.name}**: ${p.description}`).join('\n') : '詳細なパラメータ情報はGoogle Sheetsドキュメントを参照してください'}`;

            if (include_examples && functionInfo.examples) {
                responseText += `\n\n**💡 使用例**:\n${functionInfo.examples.map(ex => `\`${ex}\``).join('\n')}`;
            }

            if (include_alternatives && functionInfo.alternatives) {
                responseText += `\n\n**🔄 代替関数**: ${functionInfo.alternatives.join(', ')}`;
            }

            if (functionInfo.notes) {
                responseText += `\n\n**📌 注意事項**: ${functionInfo.notes}`;
            }

            responseText += `\n\n**🎯 カテゴリ**: ${functionInfo.category}`;
            responseText += `\n**📊 複雑度**: ${functionInfo.complexity}/10`;

            return {
                content: [
                    {
                        type: 'text',
                        text: responseText
                    }
                ]
            };
            
        } catch (error) {
            return this.createFallbackResponse(function_name, error.message);
        }
    }

    /**
     * 関数検索処理（修正版）
     */
    async handleSearchFunctions(args) {
        const { query, max_results = 10, category_filter } = args;
        
        try {
            // データベース初期化確認
            await this.initializeDatabase();
            
            const searchResult = this.searchFunctions(query, max_results, category_filter);
            
            if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🔍 **検索結果**: "${query}" に一致する関数が見つかりませんでした\n\n💡 **検索のヒント**:\n• より一般的なキーワードを試してください（例：「集計」「検索」「日付」）\n• 英語での検索も試してください（例：「sum」「lookup」「date」）\n• 部分的なキーワードで検索してください`
                        }
                    ]
                };
            }

            let responseText = `🔍 **関数検索結果**: "${query}"\n\n`;
            responseText += `📊 **検索結果数**: ${searchResult.total_matches}件（上位${searchResult.results.length}件表示）\n\n`;

            searchResult.results.forEach((result, index) => {
                responseText += `**${index + 1}. ${result.function_name}**\n`;
                responseText += `📝 ${result.description}\n`;
                responseText += `⚙️ 構文: \`${result.syntax}\`\n`;
                if (result.score) {
                    responseText += `🎯 関連度: ${result.score}%\n`;
                }
                responseText += '\n';
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: responseText
                    }
                ]
            };
            
        } catch (error) {
            return this.createFallbackResponse(query, error.message);
        }
    }

    /**
     * 数式検証処理（修正版）
     */
    async handleValidateFormula(args) {
        const { formula, context_info } = args;
        
        try {
            // データベース初期化確認
            await this.initializeDatabase();
            
            // 基本的な数式検証ロジック
            const isValid = formula.startsWith('=');
            const detectedFunctions = this.extractFunctionsFromFormula(formula);
            
            let responseText = `✅ **数式検証結果**: \`${formula}\`\n\n`;
            
            if (!isValid) {
                responseText += `❌ **構文エラー**: 数式は「=」で始まる必要があります\n\n`;
            } else {
                responseText += `✅ **基本構文**: 正常\n\n`;
            }
            
            if (detectedFunctions.length > 0) {
                responseText += `🔍 **検出された関数**:\n`;
                detectedFunctions.forEach(func => {
                    const info = this.getFunctionInfo(func);
                    const status = info ? '✅ 対応' : '❓ 不明';
                    responseText += `• **${func}**: ${status}\n`;
                });
                responseText += '\n';
            }
            
            if (context_info) {
                responseText += `📝 **コンテキスト**: ${context_info}\n\n`;
            }
            
            responseText += `💡 **推奨事項**: Google Sheetsで実際にテストして動作確認することをお勧めします`;

            return {
                content: [
                    {
                        type: 'text',
                        text: responseText
                    }
                ]
            };
            
        } catch (error) {
            return this.createFallbackResponse(formula, error.message);
        }
    }

    /**
     * 代替関数提案処理（修正版）
     */
    async handleSuggestAlternatives(args) {
        const { function_name, purpose, complexity_level } = args;
        
        try {
            // データベース初期化確認
            await this.initializeDatabase();
            
            const functionInfo = this.getFunctionInfo(function_name);
            
            if (!functionInfo) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ **関数が見つかりません**: ${function_name}\n\n💡 **提案**: まず \`get_sheets_function_info\` で関数の存在を確認してください`
                        }
                    ]
                };
            }

            let responseText = `💡 **${function_name}の代替案提案**\n\n`;
            responseText += `🎯 **元の関数**: ${function_name}\n`;
            responseText += `📝 **用途**: ${purpose || functionInfo.description}\n`;
            
            if (complexity_level) {
                responseText += `📊 **希望複雑度**: ${complexity_level}\n`;
            }
            
            responseText += '\n**🔄 代替関数候補**:\n';
            
            if (functionInfo.alternatives && functionInfo.alternatives.length > 0) {
                functionInfo.alternatives.forEach((alt, index) => {
                    const altInfo = this.getFunctionInfo(alt);
                    responseText += `**${index + 1}. ${alt}**\n`;
                    if (altInfo) {
                        responseText += `📝 ${altInfo.description}\n`;
                        responseText += `📊 複雑度: ${altInfo.complexity}/10\n`;
                    }
                    responseText += '\n';
                });
            } else {
                responseText += '現在、この関数の代替案はデータベースに登録されていません。\n\n';
            }
            
            responseText += `💡 **最適化のヒント**: \n• より新しい関数（XLOOKUP、ARRAYFORMULA等）の使用を検討\n• 複数の関数を組み合わせることで柔軟性向上\n• パフォーマンスを重視する場合は配列関数を検討`;

            return {
                content: [
                    {
                        type: 'text',
                        text: responseText
                    }
                ]
            };
            
        } catch (error) {
            return this.createFallbackResponse(function_name, error.message);
        }
    }

    /**
     * 関数複雑度分析処理（修正版）
     */
    async handleAnalyzeComplexity(args) {
        const { function_name, context } = args;
        
        try {
            // データベース初期化確認
            await this.initializeDatabase();
            
            const functionInfo = this.getFunctionInfo(function_name);
            
            if (!functionInfo) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `❌ **関数が見つかりません**: ${function_name}\n\n💡 **提案**: 正確な関数名を入力してください（例：VLOOKUP, SUMIF）`
                        }
                    ]
                };
            }

            const complexity = functionInfo.complexity || 5;
            let difficultyLevel = 'Intermediate';
            
            if (complexity <= 3) difficultyLevel = 'Beginner';
            else if (complexity <= 6) difficultyLevel = 'Intermediate';
            else if (complexity <= 8) difficultyLevel = 'Advanced';
            else difficultyLevel = 'Expert';

            let responseText = `📈 **${function_name}の複雑度分析**\n\n`;
            responseText += `📊 **複雑度スコア**: ${complexity}/10\n`;
            responseText += `🎯 **難易度レベル**: ${difficultyLevel}\n`;
            responseText += `📝 **関数説明**: ${functionInfo.description}\n\n`;
            
            responseText += `**🧠 学習推奨事項**:\n`;
            
            if (complexity <= 3) {
                responseText += `• 初心者向けの関数です\n`;
                responseText += `• 基本的なスプレッドシート操作ができれば習得可能\n`;
                responseText += `• 実際に使いながら覚えることをお勧めします\n`;
            } else if (complexity <= 6) {
                responseText += `• 中級者向けの関数です\n`;
                responseText += `• 基本的な関数に慣れてから学習することをお勧めします\n`;
                responseText += `• パラメータの意味を理解することが重要です\n`;
            } else if (complexity <= 8) {
                responseText += `• 上級者向けの関数です\n`;
                responseText += `• 複数の概念の組み合わせが必要です\n`;
                responseText += `• 段階的に学習し、実例で練習することをお勧めします\n`;
            } else {
                responseText += `• エキスパート向けの関数です\n`;
                responseText += `• 高度な概念理解が必要です\n`;
                responseText += `• 詳細なドキュメント学習と十分な練習が必要です\n`;
            }
            
            if (context) {
                responseText += `\n📝 **コンテキスト**: ${context}`;
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: responseText
                    }
                ]
            };
            
        } catch (error) {
            return this.createFallbackResponse(function_name, error.message);
        }
    }

    /**
     * 数式から関数名を抽出するヘルパー関数
     */
    extractFunctionsFromFormula(formula) {
        const functionPattern = /([A-Z][A-Z0-9_.]*)s*((/g;
        const matches = [];
        let match;
        
        while ((match = functionPattern.exec(formula)) !== null) {
            const funcName = match[1];
            if (!matches.includes(funcName)) {
                matches.push(funcName);
            }
        }
        
        return matches;
    }
}