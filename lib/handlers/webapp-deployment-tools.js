#!/usr/bin/env node

/**
 * WebApp Deployment Tools Handler
 * Claude-AppsScript-Pro - WEBアプリデプロイ機能
 * 
 * 機能:
 * - Apps Script WebApp デプロイ・更新
 * - デプロイURL取得・管理
 * - バージョン管理・ロールバック
 * - アクセス権限設定・管理
 * - デプロイ状況監視・ログ
 */

/**
 * WebApp Deployment Tools ハンドラー
 * Apps Script WebApp のデプロイ・管理機能を提供
 */
export class WebAppDeploymentHandler {
  constructor(googleAPIsManager, diagnosticLogger) {
    this.googleAPIsManager = googleAPIsManager;
    this.diagnosticLogger = diagnosticLogger;
  }

  /**
   * Apps Script プロジェクトを Web アプリとしてデプロイ・公開
   */
  async deployWebapp(params) {
    try {
      this.diagnosticLogger.log('info', 'Starting WebApp deployment', { 
        scriptId: params.script_id,
        accessType: params.access_type,
        executeAs: params.execute_as 
      });

      const script = this.googleAPIsManager.getScriptApi();
      
      // 新しいバージョンを作成
      const versionResponse = await script.projects.versions.create({
        scriptId: params.script_id,
        resource: {
          description: params.version_description || 'Web App Deployment'
        }
      });

      this.diagnosticLogger.log('info', 'Version created', {
        versionNumber: versionResponse.data.versionNumber
      });

      // デプロイメントを作成（最新API仕様対応）
      const deploymentConfig = {
        versionNumber: versionResponse.data.versionNumber,
        description: params.version_description || 'Web App Deployment'
      };

      const deploymentResponse = await script.projects.deployments.create({
        scriptId: params.script_id,
        resource: deploymentConfig
      });

      this.diagnosticLogger.log('info', 'WebApp deployment completed', {
        deploymentId: deploymentResponse.data.deploymentId,
        webAppUrl: deploymentResponse.data.entryPoints?.[0]?.webApp?.url
      });

      return {
        success: true,
        deployment_id: deploymentResponse.data.deploymentId,
        web_app_url: deploymentResponse.data.entryPoints?.[0]?.webApp?.url,
        version_number: versionResponse.data.versionNumber,
        access_type: params.access_type || 'ANYONE_ANONYMOUS',
        execute_as: params.execute_as || 'USER_DEPLOYING',
        message: 'WebApp deployment completed successfully'
      };

    } catch (error) {
      this.diagnosticLogger.log('error', 'WebApp deployment failed', {
        error: error.message,
        scriptId: params.script_id
      });

      return {
        success: false,
        error: error.message,
        details: 'Failed to deploy WebApp. Check script permissions and configuration.'
      };
    }
  }

  /**
   * デプロイ済み Web アプリの URL を取得
   */
  async getWebappUrl(params) {
    try {
      this.diagnosticLogger.log('info', 'Getting WebApp URL', { 
        scriptId: params.script_id,
        deploymentId: params.deployment_id 
      });

      const script = this.googleAPIsManager.getScriptApi();

      if (params.deployment_id) {
        // 特定のデプロイメントの情報を取得
        const deploymentResponse = await script.projects.deployments.get({
          scriptId: params.script_id,
          deploymentId: params.deployment_id
        });

        const webAppUrl = deploymentResponse.data.entryPoints?.[0]?.webApp?.url;

        return {
          success: true,
          deployment_id: deploymentResponse.data.deploymentId,
          web_app_url: webAppUrl,
          access_type: deploymentResponse.data.entryPoints?.[0]?.webApp?.access,
          execute_as: deploymentResponse.data.entryPoints?.[0]?.webApp?.executeAs,
          version_number: deploymentResponse.data.versionNumber
        };
      } else {
        // 全デプロイメントを取得して最新のWebAppを見つける
        const deploymentsResponse = await script.projects.deployments.list({
          scriptId: params.script_id
        });

        const webAppDeployments = deploymentsResponse.data.deployments?.filter(
          deployment => deployment.entryPoints?.[0]?.entryPointType === 'WEB_APP'
        ) || [];

        if (webAppDeployments.length === 0) {
          return {
            success: false,
            error: 'No WebApp deployments found',
            message: 'This script has no active WebApp deployments'
          };
        }

        // 最新のデプロイメントを取得
        const latestDeployment = webAppDeployments.sort((a, b) => 
          new Date(b.updateTime) - new Date(a.updateTime)
        )[0];

        return {
          success: true,
          deployment_id: latestDeployment.deploymentId,
          web_app_url: latestDeployment.entryPoints?.[0]?.webApp?.url,
          access_type: latestDeployment.entryPoints?.[0]?.webApp?.access,
          execute_as: latestDeployment.entryPoints?.[0]?.webApp?.executeAs,
          version_number: latestDeployment.versionNumber,
          update_time: latestDeployment.updateTime
        };
      }

    } catch (error) {
      this.diagnosticLogger.log('error', 'Failed to get WebApp URL', {
        error: error.message,
        scriptId: params.script_id
      });

      return {
        success: false,
        error: error.message,
        details: 'Failed to retrieve WebApp URL. Check script ID and permissions.'
      };
    }
  }

  /**
   * 既存の Web アプリデプロイメントを更新
   */
  async updateWebappDeployment(params) {
    try {
      this.diagnosticLogger.log('info', 'Updating WebApp deployment', { 
        scriptId: params.script_id,
        deploymentId: params.deployment_id 
      });

      const script = this.googleAPIsManager.getScriptApi();
      
      // 新しいバージョンを作成
      const versionResponse = await script.projects.versions.create({
        scriptId: params.script_id,
        resource: {
          description: params.version_description || 'Updated Web App'
        }
      });

      // デプロイメントを更新
      const updateResponse = await script.projects.deployments.update({
        scriptId: params.script_id,
        deploymentId: params.deployment_id,
        resource: {
          versionNumber: versionResponse.data.versionNumber,
          description: params.version_description || 'Updated Web App'
        }
      });

      this.diagnosticLogger.log('info', 'WebApp deployment updated', {
        deploymentId: updateResponse.data.deploymentId,
        versionNumber: versionResponse.data.versionNumber
      });

      return {
        success: true,
        deployment_id: updateResponse.data.deploymentId,
        version_number: versionResponse.data.versionNumber,
        web_app_url: updateResponse.data.entryPoints?.[0]?.webApp?.url,
        message: 'WebApp deployment updated successfully'
      };

    } catch (error) {
      this.diagnosticLogger.log('error', 'WebApp deployment update failed', {
        error: error.message,
        scriptId: params.script_id,
        deploymentId: params.deployment_id
      });

      return {
        success: false,
        error: error.message,
        details: 'Failed to update WebApp deployment. Check deployment ID and permissions.'
      };
    }
  }

  /**
   * Apps Script プロジェクトの全デプロイメント一覧を取得
   */
  async listWebappDeployments(params) {
    try {
      this.diagnosticLogger.log('info', 'Listing WebApp deployments', { 
        scriptId: params.script_id,
        includeInactive: params.include_inactive 
      });

      const script = this.googleAPIsManager.getScriptApi();
      
      const deploymentsResponse = await script.projects.deployments.list({
        scriptId: params.script_id
      });

      const deployments = deploymentsResponse.data.deployments || [];
      
      // WebApp デプロイメントのみフィルター
      const webAppDeployments = deployments.filter(deployment => {
        const isWebApp = deployment.entryPoints?.[0]?.entryPointType === 'WEB_APP';
        const isActive = !params.include_inactive ? deployment.deploymentId !== 'HEAD' : true;
        return isWebApp && isActive;
      });

      const formattedDeployments = webAppDeployments.map(deployment => ({
        deployment_id: deployment.deploymentId,
        description: deployment.description,
        version_number: deployment.versionNumber,
        web_app_url: deployment.entryPoints?.[0]?.webApp?.url,
        access_type: deployment.entryPoints?.[0]?.webApp?.access,
        execute_as: deployment.entryPoints?.[0]?.webApp?.executeAs,
        create_time: deployment.createTime,
        update_time: deployment.updateTime
      }));

      this.diagnosticLogger.log('info', 'WebApp deployments listed', {
        count: formattedDeployments.length
      });

      return {
        success: true,
        deployments: formattedDeployments,
        total_count: formattedDeployments.length,
        message: `Found ${formattedDeployments.length} WebApp deployments`
      };

    } catch (error) {
      this.diagnosticLogger.log('error', 'Failed to list WebApp deployments', {
        error: error.message,
        scriptId: params.script_id
      });

      return {
        success: false,
        error: error.message,
        details: 'Failed to list WebApp deployments. Check script ID and permissions.'
      };
    }
  }

  /**
   * Web アプリデプロイメントを削除
   */
  async deleteWebappDeployment(params) {
    try {
      this.diagnosticLogger.log('info', 'Deleting WebApp deployment', { 
        scriptId: params.script_id,
        deploymentId: params.deployment_id 
      });

      const script = this.googleAPIsManager.getScriptApi();
      
      await script.projects.deployments.delete({
        scriptId: params.script_id,
        deploymentId: params.deployment_id
      });

      this.diagnosticLogger.log('info', 'WebApp deployment deleted', {
        deploymentId: params.deployment_id
      });

      return {
        success: true,
        deployment_id: params.deployment_id,
        message: 'WebApp deployment deleted successfully'
      };

    } catch (error) {
      this.diagnosticLogger.log('error', 'WebApp deployment deletion failed', {
        error: error.message,
        scriptId: params.script_id,
        deploymentId: params.deployment_id
      });

      return {
        success: false,
        error: error.message,
        details: 'Failed to delete WebApp deployment. Check deployment ID and permissions.'
      };
    }
  }

  /**
   * 利用可能なツール一覧を取得（MCP SDK互換）
   */
  getAvailableTools() {
    return [
      {
        name: 'deploy_webapp',
        description: 'Apps Script プロジェクトを Web アプリとしてデプロイ・公開',
        parameters: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            access_type: { type: 'string', enum: ['MYSELF', 'DOMAIN', 'ANYONE'], description: 'アクセス権限タイプ' },
            execute_as: { type: 'string', enum: ['USER_ACCESSING', 'USER_DEPLOYING'], description: '実行者設定' },
            version_description: { type: 'string', description: 'バージョンの説明' }
          },
          required: ['script_id']
        }
      },
      {
        name: 'update_webapp_deployment',
        description: '既存の Web アプリデプロイメントを更新',
        parameters: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            deployment_id: { type: 'string', description: 'デプロイメント ID' },
            access_type: { type: 'string', enum: ['MYSELF', 'DOMAIN', 'ANYONE'], description: 'アクセス権限タイプ' },
            version_description: { type: 'string', description: 'バージョンの説明' }
          },
          required: ['script_id', 'deployment_id']
        }
      },
      {
        name: 'list_webapp_deployments',
        description: 'Apps Script プロジェクトのデプロイメント一覧を取得',
        parameters: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' }
          },
          required: ['script_id']
        }
      },
      {
        name: 'get_webapp_deployment_info',
        description: '特定のデプロイメントの詳細情報を取得',
        parameters: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            deployment_id: { type: 'string', description: 'デプロイメント ID' }
          },
          required: ['script_id', 'deployment_id']
        }
      },
      {
        name: 'delete_webapp_deployment',
        description: 'Web アプリデプロイメントを削除',
        parameters: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            deployment_id: { type: 'string', description: 'デプロイメント ID' }
          },
          required: ['script_id', 'deployment_id']
        }
      }
    ];
  }

  /**
   * ツール呼び出しハンドラー（MCP SDK v1系互換）
   */
  async handleToolCall(name, args) {
    try {
      this.diagnosticLogger.log('info', `WebApp tool ${name} called`, { args });

      switch (name) {
        case 'deploy_webapp':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await this.deployWebapp(args), null, 2)
            }]
          };

        case 'get_webapp_url':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await this.getWebappUrl(args), null, 2)
            }]
          };

        case 'update_webapp_deployment':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await this.updateWebappDeployment(args), null, 2)
            }]
          };

        case 'list_webapp_deployments':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await this.listWebappDeployments(args), null, 2)
            }]
          };

        case 'get_webapp_deployment_info':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await this.getWebappUrl(args), null, 2)
            }]
          };

        case 'delete_webapp_deployment':
          return {
            content: [{
              type: 'text',
              text: JSON.stringify(await this.deleteWebappDeployment(args), null, 2)
            }]
          };

        default:
          throw new Error(`Unknown WebApp deployment tool: ${name}`);
      }

    } catch (error) {
      this.diagnosticLogger.log('error', `WebApp tool ${name} failed`, {
        error: error.message,
        args
      });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            details: `Failed to execute ${name}`
          }, null, 2)
        }]
      };
    }
  }

  /**
   * 利用可能なツール定義を取得
   */
  getToolDefinitions() {
    return [
      {
        name: 'deploy_webapp',
        description: '🚀 Apps Script プロジェクトを Web アプリとしてデプロイ・公開',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            access_type: { 
              type: 'string', 
              enum: ['PRIVATE', 'DOMAIN', 'ANYONE', 'ANYONE_ANONYMOUS'],
              description: 'アクセス権限設定' 
            },
            execute_as: { 
              type: 'string', 
              enum: ['USER_ACCESSING', 'USER_DEPLOYING'],
              description: '実行ユーザー設定' 
            },
            version_description: { type: 'string', description: 'バージョン説明（任意）' }
          },
          required: ['script_id', 'access_type', 'execute_as']
        }
      },
      {
        name: 'update_webapp_deployment',
        description: '🔄 既存 Web アプリデプロイの更新・設定変更',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            deployment_id: { type: 'string', description: 'デプロイメント ID' },
            access_type: { 
              type: 'string', 
              enum: ['PRIVATE', 'DOMAIN', 'ANYONE', 'ANYONE_ANONYMOUS'],
              description: '新しいアクセス権限設定' 
            }
          },
          required: ['script_id', 'deployment_id']
        }
      },
      {
        name: 'list_webapp_deployments',
        description: '📋 Apps Script プロジェクトのデプロイメント一覧取得',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' }
          },
          required: ['script_id']
        }
      },
      {
        name: 'get_webapp_deployment_info',
        description: '📄 特定デプロイメントの詳細情報・URL取得',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            deployment_id: { type: 'string', description: 'デプロイメント ID' }
          },
          required: ['script_id', 'deployment_id']
        }
      },
      {
        name: 'delete_webapp_deployment',
        description: '🗑️ Web アプリデプロイメントの削除',
        inputSchema: {
          type: 'object',
          properties: {
            script_id: { type: 'string', description: 'Apps Script プロジェクト ID' },
            deployment_id: { type: 'string', description: 'デプロイメント ID' }
          },
          required: ['script_id', 'deployment_id']
        }
      }
    ];
  }
}