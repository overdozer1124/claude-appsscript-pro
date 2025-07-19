/**
 * 🚀 Claude-AppsScript-Pro Sheets Functions Database v2.1.0
 * 514 Google Sheets Functions Complete Database System
 * 
 * 核心価値提案:
 * ❌ Before: Claude関数認識エラー → 修正サイクル → 大量出力
 * ✅ After:  正確な関数情報 → 一発成功 → 86%削減達成
 */

import { FunctionsDatabaseManager } from './functions-database/index.js';

/**
 * メインエクスポート - 統合関数データベースシステム
 */
export class SheetsFunctionsDatabase {
  constructor() {
    this.manager = null;
    this.isInitialized = false;
  }

  /**
   * データベース初期化（遅延読み込み）
   */
  async initialize() {
    if (this.isInitialized) {
      return this.manager;
    }

    try {
      console.error('[SHEETS-DB] Initializing 514 functions database...');
      this.manager = new FunctionsDatabaseManager();
      await this.manager.initialize();
      this.isInitialized = true;
      console.error('[SHEETS-DB] ✅ Database initialized successfully');
      return this.manager;
    } catch (error) {
      console.error('[SHEETS-DB] ❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * 関数情報取得
   */
  async getFunctionInfo(functionName, options = {}) {
    const manager = await this.initialize();
    return manager.getFunctionInfo(functionName, options);
  }

  /**
   * 関数検索
   */
  async searchFunctions(query, options = {}) {
    const manager = await this.initialize();
    return manager.searchFunctions(query, options);
  }

  /**
   * 数式検証
   */
  async validateFormula(formula, options = {}) {
    const manager = await this.initialize();
    return manager.validateFormula(formula, options);
  }

  /**
   * 代替関数提案
   */
  async suggestAlternatives(functionName, options = {}) {
    const manager = await this.initialize();
    return manager.suggestAlternatives(functionName, options);
  }

  /**
   * 複雑度分析
   */
  async analyzeComplexity(functionName, options = {}) {
    const manager = await this.initialize();
    return manager.analyzeComplexity(functionName, options);
  }

  /**
   * データベース統計情報
   */
  async getStats() {
    const manager = await this.initialize();
    return manager.getStats();
  }
}

// 🔧 既存コード互換性のためのラッパー関数群
// lib/handlers/sheets-functions-tools.js が期待するexport構造に対応

// グローバルデータベースインスタンス（シングルトン）
let globalDatabase = null;

/**
 * グローバルデータベース取得（遅延初期化）
 */
async function getGlobalDatabase() {
  if (!globalDatabase) {
    globalDatabase = new SheetsFunctionsDatabase();
    await globalDatabase.initialize();
  }
  return globalDatabase;
}

/**
 * 既存コード互換: 関数情報取得（直接関数として）
 */
export async function getFunctionInfo(functionName, options = {}) {
  try {
    const db = await getGlobalDatabase();
    return await db.getFunctionInfo(functionName, options);
  } catch (error) {
    console.error('[COMPAT] getFunctionInfo error:', error);
    return {
      success: false,
      error: `Function info retrieval failed: ${error.message}`
    };
  }
}

/**
 * 既存コード互換: 関数検索（直接関数として）
 */
export async function searchFunctions(query, maxResults = 10, categoryFilter = null) {
  try {
    const db = await getGlobalDatabase();
    const options = { max_results: maxResults };
    if (categoryFilter) {
      options.category_filter = categoryFilter;
    }
    return await db.searchFunctions(query, options);
  } catch (error) {
    console.error('[COMPAT] searchFunctions error:', error);
    return {
      success: false,
      results: [],
      total_matches: 0,
      error: `Function search failed: ${error.message}`
    };
  }
}

/**
 * 既存コード互換: 数式検証（直接関数として）
 */
export async function validateFormula(formula, options = {}) {
  try {
    const db = await getGlobalDatabase();
    return await db.validateFormula(formula, options);
  } catch (error) {
    console.error('[COMPAT] validateFormula error:', error);
    return {
      success: false,
      is_valid: false,
      error: `Formula validation failed: ${error.message}`
    };
  }
}

/**
 * 既存コード互換: 代替案提案（直接関数として）
 */
export async function suggestAlternatives(functionName, options = {}) {
  try {
    const db = await getGlobalDatabase();
    return await db.suggestAlternatives(functionName, options);
  } catch (error) {
    console.error('[COMPAT] suggestAlternatives error:', error);
    return {
      success: false,
      alternatives: [],
      error: `Alternative suggestions failed: ${error.message}`
    };
  }
}

/**
 * 既存コード互換: 複雑度分析（直接関数として）
 */
export async function analyzeComplexity(functionName, options = {}) {
  try {
    const db = await getGlobalDatabase();
    return await db.analyzeComplexity(functionName, options);
  } catch (error) {
    console.error('[COMPAT] analyzeComplexity error:', error);
    return {
      success: false,
      complexity_score: 0,
      error: `Complexity analysis failed: ${error.message}`
    };
  }
}

// FunctionsDatabaseManagerを再エクスポート（既存コード互換性）
export { FunctionsDatabaseManager } from './functions-database/index.js';

// デフォルトエクスポート
export default SheetsFunctionsDatabase;

// 便利な静的メソッド
export function createDatabase() {
  return new SheetsFunctionsDatabase();
}

/**
 * 使用例:
 * 
 * // 新しいAPI（推奨）
 * import { SheetsFunctionsDatabase } from './sheets-functions-test/index.js';
 * const db = new SheetsFunctionsDatabase();
 * const vlookupInfo = await db.getFunctionInfo('VLOOKUP');
 * 
 * // 既存コード互換API
 * import { getFunctionInfo, searchFunctions } from './sheets-functions-test/index.js';
 * const info = await getFunctionInfo('VLOOKUP');
 * const results = await searchFunctions('条件付き平均');
 */
