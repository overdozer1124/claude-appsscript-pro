# 🚀 Claude-AppsScript-Pro

Google Apps Script開発を革命的に効率化するMCPサーバー

## ⚡ 2分でインストール

### Windows
```bash
git clone https://github.com/overdozer1124/claude-appsscript-pro.git
cd claude-appsscript-pro
install-windows.bat
```
※または `npm install` → `npm run quick-install-win`

### macOS/Linux
```bash
git clone https://github.com/overdozer1124/claude-appsscript-pro.git
cd claude-appsscript-pro
chmod +x install.sh && ./install.sh
```
※または `npm install` → `npm run quick-install`

**インストーラーが自動的に実行:**
- ✅ Node.jsパス自動検出・設定
- ✅ 依存関係インストール
- ✅ 既知のエラー自動修正
- ✅ Claude Desktop設定自動更新
- ✅ OAuth設定ガイド表示

## 📋 OAuth設定（唯一の手動作業）

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新規プロジェクト作成
3. 以下のAPIを有効化：
   - Google Apps Script API
   - Google Drive API  
   - Google Sheets API
4. OAuth 2.0 クライアントID作成（**Webアプリケーション**タイプ）
5. リダイレクトURI: `http://localhost:3001/oauth/callback`
6. インストーラーの指示に従って認証完了

## ✨ 使い方

Claude内で自然言語で指示するだけ：

```
「タスク管理システムを作ってWebで公開して」
「売上データから月次レポートを自動生成したい」
「WebアプリのJavaScriptエラーを調べて直して」
```

## 🎯 主な機能

| 機能 | 説明 |
|------|------|
| **61個の統合ツール** | Apps Script開発の全工程をカバー |
| **99%出力削減** | 継続開発での革命的効率化 |
| **AI自律実行** | 自然言語で完全システム構築 |
| **実ブラウザデバッグ** | Playwright統合で10倍効率 |
| **ワンクリックデプロイ** | 即座にWebアプリ公開 |

## 🔧 トラブルシューティング

よくある問題と解決方法：

| 問題 | 解決方法 |
|------|----------|
| Node.jsが認識されない | インストーラーが自動で解決、または[手動設定ガイド](docs/Windows用%20Node.js%20PATH設定ガイド.txt) |
| MCP接続エラー | Claude Desktop再起動 → 設定 → 開発者 → ローカルMCPサーバー有効化 |
| OAuth認証エラー | クライアントタイプは必ず「Webアプリケーション」を選択 |

詳細は [TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照

## 📚 ドキュメント

- [完全版README](docs/README_FULL.md) - 詳細な機能説明
- [セットアップガイド](docs/Claude-AppsScript-Pro%20v2.1.0%20完全セットアップガイド.md)
- [ナレッジベース](docs/) - 開発ノウハウ集

## 📄 ライセンス

MIT License

---

**要件**: Node.js 18.0.0+ | **サポート**: [Issues](https://github.com/overdozer1124/claude-appsscript-pro/issues) | **開発者**: [@overdozer1124](https://github.com/overdozer1124)
