/**
 * Google APIs Manager with OAuth Authentication
 * Claude-AppsScript-Pro Core Module
 * 
 * Handles OAuth authentication and Google APIs initialization
 * Extracted from main server.js for better modularity
 */

import { config } from 'dotenv';
import { google } from 'googleapis';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 現在のファイルのディレクトリを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// dotenv設定（明示的パス指定）
config({ path: join(__dirname, '../../.env') });

/**
 * Google APIs Manager with OAuth Authentication (Singleton)
 */
class GoogleAPIsManager {
  static instance = null;

  constructor() {
    this.auth = null;
    this.drive = null;
    this.script = null;
    this.sheets = null;
    this.slides = null;  // Google Slides API追加
    this.initialized = false;
    this.authMethod = 'oauth2';
  }

  /**
   * Singleton getInstance method
   */
  static getInstance() {
    if (!GoogleAPIsManager.instance) {
      GoogleAPIsManager.instance = new GoogleAPIsManager();
    }
    return GoogleAPIsManager.instance;
  }

  async initialize() {
    try {
      // OAuth認証情報の確認
      const clientId = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_APP_SCRIPT_API_CLIENT_SECRET;
      const refreshToken = process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN;

      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing OAuth credentials: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN required');
      }

      // OAuth2クライアント作成
      this.auth = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost:3001/oauth/callback'
      );

      // リフレッシュトークン設定
      this.auth.setCredentials({
        refresh_token: refreshToken
      });

      // アクセストークン取得（最新API使用）
      const { credentials } = await this.auth.getAccessToken();
      
      // Google APIs初期化
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.script = google.script({ version: 'v1', auth: this.auth });
      this.slides = google.slides({ version: 'v1', auth: this.auth });  // Google Slides API初期化

      // Apps Script API検証
      if (!this.script || !this.script.projects) {
        throw new Error('Apps Script API not properly initialized');
      }

      this.initialized = true;
      return true;
    } catch (error) {
      throw new Error(`OAuth initialization failed: ${error.message}`);
    }
  }

  async testBasicConnection() {
    try {
      const response = await this.drive.about.get({ fields: 'user' });
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async testAppsScriptAPI() {
    try {
      const projectRequest = {
        title: 'OAuth Test Project ' + Date.now()
      };
      
      const response = await this.script.projects.create({
        requestBody: projectRequest
      });
      
      return {
        success: true,
        projectId: response.data.scriptId,
        title: response.data.title
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        statusCode: error.status
      };
    }
  }

  getAuthInfo() {
    return {
      method: this.authMethod,
      initialized: this.initialized,
      authType: 'OAuth2',
      hasRefreshToken: !!process.env.GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN
    };
  }

  getServiceStatus() {
    return {
      script: { initialized: !!this.script },
      drive: { initialized: !!this.drive },
      sheets: { initialized: !!this.sheets },
      slides: { initialized: !!this.slides }  // Google Slides API状況追加
    };
  }

  // API accessor methods
  getDriveApi() {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Call initialize() first.');
    }
    return this.drive;
  }

  getSheetsApi() {
    if (!this.sheets) {
      throw new Error('Sheets API not initialized. Call initialize() first.');
    }
    return this.sheets;
  }

  getScriptApi() {
    if (!this.script) {
      throw new Error('Script API not initialized. Call initialize() first.');
    }
    return this.script;
  }

  getSlidesApi() {
    if (!this.slides) {
      throw new Error('Slides API not initialized. Call initialize() first.');
    }
    return this.slides;
  }
}

// ES Modules Export
export { GoogleAPIsManager };
