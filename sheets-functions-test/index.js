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

// デフォルトエクスポート
export default SheetsFunctionsDatabase;

// 便利な静的メソッド
export function createDatabase() {
  return new SheetsFunctionsDatabase();
}

/**
 * 使用例:
 * 
 * import { SheetsFunctionsDatabase } from './sheets-functions-test/index.js';
 * 
 * const db = new SheetsFunctionsDatabase();
 * const vlookupInfo = await db.getFunctionInfo('VLOOKUP');
 * const searchResults = await db.searchFunctions('条件付き平均');
 */
