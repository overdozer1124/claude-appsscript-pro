# 🚀 Claude-AppsScript-Pro v3.0.1
## Google Apps Script開発を革命的に効率化するMCPサーバー

Claude-AppsScript-Pro は、**61ツール統合**・**AI自律開発**・**リアルタイムブラウザデバッグ**により、Google Apps Script開発の**99%出力削減**と**10倍デバッグ効率向上**を実現する革命的プラットフォームです。

### ✨ 主要機能・革新的価値

| 機能カテゴリ | ツール数 | 革新的価値 |
|-------------|---------|------------|
| 🤖 **AI自律ワークフロー** | 4 | 自然言語指示→完全システム構築 |
| 🌐 **WebApp完全統合** | 6 | ワンクリックデプロイ・本格運用 |
| 🔍 **リアルタイムデバッグ** | 8 | 実ブラウザ制御・即時エラー特定 |
| 📊 **Spreadsheet高度操作** | 18 | 読み書き・分析・最適化・権限管理 |
| 🎯 **継続開発支援** | 25 | パッチ・検証・最適化・実行制御 |

**🎯 実現できること：**
- 「タスク管理システムを作ってWebで公開して」→ 5分で完全なシステム構築
- 「売上データから月次レポートを自動生成したい」→ AI が最適ツールチェーンを自動実行
- 「WebアプリでJavaScriptエラーが出てる」→ 実ブラウザでリアルタイムデバッグ・自動修正

---

## 🛠️ 事前準備（5分）

### 必須ソフトウェア

✅ **Node.js v18.0.0以上** - [ダウンロード](https://nodejs.org/)  
✅ **Git** - [ダウンロード](https://git-scm.com/)  
✅ **Claude Desktop 最新版** - [ダウンロード](https://claude.ai/download)

**⚠️ Windows重要注意事項：**
- Node.jsインストール時：「Automatically install the necessary tools」は**チェック外す**
- インストール完了後：**PC再起動必須**

### Google Cloud Platform準備

1. **GCPアカウント作成** - [console.cloud.google.com](https://console.cloud.google.com)
2. **新規プロジェクト作成**
3. **3つのAPI有効化**：
   - Google Apps Script API
   - Google Drive API  
   - Google Sheets API
4. **OAuth 2.0 クライアント作成**：
   - タイプ：**「Webアプリケーション」**（重要）
   - リダイレクトURI：`http://localhost:3001/oauth/callback`

### チェックリスト

- [ ] Node.js インストール確認：`node --version`
- [ ] Git インストール確認：`git --version`
- [ ] Claude Desktop インストール完了
- [ ] GCPプロジェクト作成完了
- [ ] OAuth クライアントID・シークレット取得完了

---

## ⚡ ワンクリックインストール

### Windows（完全自動・最推奨）🔥

```powershell
# 🚀 PowerShell で実行（ノンストップ実行・最推奨）
powershell -Command "& { git clone https://github.com/overdozer1124/claude-appsscript-pro.git; cd claude-appsscript-pro; npm install; .\install-auto.bat }"

```

### macOS

```bash
# ターミナルで実行
curl -fsSL https://raw.githubusercontent.com/overdozer1124/claude-appsscript-pro/main/install.sh | bash
```

### Linux

```bash
# ターミナルで実行
curl -fsSL https://raw.githubusercontent.com/overdozer1124/claude-appsscript-pro/main/install.sh | bash
```

### Git未インストールの場合（ZIPダウンロード版）

1. **[ZIPダウンロード](https://github.com/overdozer1124/claude-appsscript-pro/archive/refs/heads/main.zip)**
2. 解凍後、フォルダ内で：

**Windows：**
```powershell
npm install; .\install-auto.bat
```

**macOS/Linux：**
```bash
npm install && chmod +x install.sh && ./install.sh
```

---

## 🔐 OAuth認証設定（自動起動）

上記のインストールコマンド実行後、OAuth認証設定が自動的に開始されます。

### Windows版 - WebアプリOAuth設定 🚀

**✨ 革命的JSONアップロード機能**

ワンクリックコマンド実行後、自動的に以下が起動します：

1. **Webブラウザ自動起動**
   - `http://localhost:3001/setup` が自動で開きます
   - 美しいUI付きのOAuth設定画面が表示

2. **Google Cloud Console準備**
   ```
   📋 事前準備（上記で完了済み）：
   ✅ GCPプロジェクト作成
   ✅ 3つのAPI有効化  
   ✅ OAuth 2.0 クライアント作成（Webアプリケーション）
   ✅ リダイレクトURI: http://localhost:3001/oauth/callback
   ```

3. **JSONファイルダウンロード**
   - Google Cloud Console → APIs & Services → Credentials
   - 作成したOAuth 2.0 クライアントIDの右端「⬇️」ボタンクリック
   - JSONファイルダウンロード

4. **JSONファイルアップロード**
   - ダウンロードしたJSONファイルを画面にドラッグ&ドロップ
   - または「クリックしてファイル選択」
   - 自動検証・設定確認

5. **Google認証完了**
   - 「Google認証を開始」ボタンクリック
   - ブラウザでGoogle認証完了
   - 自動的に設定保存・完了

**⚡ 所要時間：2-3分**

### macOS/Linux版 - ターミナルOAuth設定

インストール後、ターミナルで対話的なOAuth設定が開始されます：

1. **Client ID入力**：Google Cloud Consoleからコピペ
2. **Client Secret入力**：非表示で安全入力
3. **ブラウザ認証**：自動起動でGoogle認証
4. **設定完了**：自動的に.envファイル更新

**⚡ 所要時間：5-8分**

---

## ✅ インストール成功確認

### 1. Claude Desktop再起動

1. Claude Desktop を完全終了
2. Claude Desktop を再起動
3. 設定 → 開発者 → 「ローカルMCPサーバーを有効化」をオン

### 2. 接続テスト

Claude内で以下を実行：

```
claude-appsscript-pro:test_connection
```

**成功時の表示：**
```
✅ MCP接続：正常
✅ Google APIs：認証済み
✅ ツール数：61個
✅ 準備完了：Claude-AppsScript-Pro v3.0.1
```

### 3. 基本操作テスト

```
「簡単なタスク管理システムを作ってWebで使えるようにして」
```

→ 5分以内に完全なシステムが構築されれば成功🎉

---

## 🔧 トラブルシューティング

### よくある問題TOP5

#### 1. Node.jsが認識されない（Windows）
**症状：** `'node' is not recognized as an internal or external command`

**解決策：**
```powershell
# 絶対パスで実行
"C:\Program Files\nodejs\node.exe" --version

# または環境変数PATHに追加後、PC再起動
```

**根本解決：** Node.jsをPATHに追加（詳細：setup-windows-path.md参照）

#### 2. MCPサーバーが認識されない
**症状：** Claude内でツールが表示されない

**解決策：**
```bash
# Claude Desktop設定確認
notepad "%APPDATA%\Claude\claude_desktop_config.json"  # Windows
open ~/Library/Application\ Support/Claude/claude_desktop_config.json  # macOS
nano ~/.config/Claude/claude_desktop_config.json  # Linux
```

**設定例：**
```json
{
  "mcpServers": {
    "claude-appsscript-pro": {
      "command": "/絶対パス/to/node",
      "args": ["/絶対パス/to/claude-appsscript-pro/server.js"],
      "cwd": "/絶対パス/to/claude-appsscript-pro"
    }
  }
}
```

#### 3. OAuth認証エラー
**症状：** `redirect_uri_mismatch`

**解決策：**
- GCPでOAuthクライアントを**「Webアプリケーション」**として再作成
- リダイレクトURI：`http://localhost:3001/oauth/callback`

**Windows版：**
- WebアプリOAuth設定（JSONアップロード）を利用
- 自動起動しない場合：`node scripts/oauth-setup.cjs --web`

**macOS/Linux版：**
- ターミナルでの対話的設定
- 再実行：`npm run oauth-setup`

#### 4. 構文エラー
**症状：** `SyntaxError: Invalid regular expression flags`

**解決策：**
```bash
# Node.jsバージョン確認（v18.0.0以上必要）
node --version

# v18未満の場合はアップデート
```

#### 5. 大容量ファイルエラー
**症状：** GitHub push時 100MB超過エラー

**解決策：**
```bash
# .gitignore確認・追加
echo "node_modules/" >> .gitignore
echo "*.log" >> .gitignore
git rm --cached [大容量ファイル]
```

### 詳細サポート

**Windows版問題：**
- 📄 **Windows用Node.js PATH設定ガイド.txt**：PATH設定詳細
- 🔧 **install-auto.bat問題**：`type install-auto.log` でログ確認

**全プラットフォーム共通：**
- 📄 **TROUBLESHOOTING.md**：詳細トラブルシューティング
- 🐛 **GitHub Issues**：バグ報告・機能要請
- 💬 **GitHub Discussions**：コミュニティサポート

---

## 📚 使用方法・実践例

### 🤖 AI自律開発（最大の特徴）

```
「顧客管理システムを作成してリアルタイムでデータを確認したい」
→ Claude が自動的に最適なツールチェーンを選択・実行

「売上データから月次レポートを自動生成したい」  
→ データ分析・レポート作成・自動配信まで完全自動化

「WebアプリでJavaScriptエラーが出てるから調べて直して」
→ 実ブラウザでのエラー監視・修正コード適用・動作確認まで自動実行
```

### 🎯 実現可能なシステム例

#### 📈 ビジネスシステム
- **顧客管理システム**：顧客情報管理・履歴追跡・自動メール送信
- **経費精算システム**：申請フォーム・承認フロー・自動計算
- **プロジェクト管理**：タスク管理・進捗可視化・メンバー協働
- **予約管理システム**：リアルタイム空き状況・自動確認メール

#### 📊 データ分析・レポート  
- **売上分析ダッシュボード**：リアルタイム売上・トレンド分析
- **在庫管理**：自動発注アラート・在庫推移グラフ
- **アンケート集計**：自動集計・結果可視化・回答者管理
- **勤怠管理**：出退勤記録・残業時間集計・休暇管理

### ⏰ 開発時間目安

| システム規模 | 開発時間 | 機能数 | 複雑度 |
|-------------|----------|--------|--------|
| **シンプル** | 3-5分 | 基本機能のみ | フォーム+データ保存 |
| **標準** | 5-10分 | 中程度機能 | 分析+レポート+UI |
| **高機能** | 10-20分 | 高度機能 | AI分析+自動化+連携 |
| **企業レベル** | 20-30分 | 包括的システム | 権限管理+監査+最適化 |

---

## 🌟 開発ロードマップ

### Phase 1 ✅ **完了**: 詳細README・初心者対応完全化（2025.08.17）
- ✅ **包括的ドキュメント作成**：初心者が5分でセットアップ可能
- ✅ **プラットフォーム別手順明確化**：Windows/macOS/Linux完全対応
- ✅ **トラブルシューティング統合**：よくある問題TOP5解決策
- ✅ **ワンクリックコマンド整備**：技術知識不要のインストール

### Phase 2 ✅ **完了**: クロスプラットフォーム完全統合（2025.08.17）
- ✅ **WebアプリOAuth設定**：JSONアップロード全OS対応
- ✅ **OAuth重複実行防止**：革新的アルゴリズム全OS移植
- ✅ **MCP安全更新機能**：既存設定保護システム全OS統合
- ✅ **エラー自動復旧**：全OS統一エラーハンドリング
- ✅ **真のプラットフォーム統一**：Windows版同等機能をmacOS/Linux完全実現

### Phase 3: 高度機能統合（進行中）🔄

**目標：** エンタープライズレベル機能・CI/CD統合

**開発予定機能：**
- 🔄 **CI/CD統合**：GitHub Actions・自動テスト・デプロイ
- 🔄 **Docker統合**：コンテナ化自動デプロイ・Kubernetes対応
- 🔄 **チーム開発機能**：権限管理・コラボレーション・監査ログ
- 🔄 **パフォーマンス最適化**：大規模データ処理・高速化

### Phase 4: 多言語・グローバル展開（予定）🌐

- **多言語対応**：英語・中国語・韓国語・スペイン語UI
- **地域最適化**：各国Google Workspace設定対応
- **グローバルコミュニティ**：各国開発者コミュニティ構築
- **エンタープライズ版**：企業向け高度機能・SLA対応

### Phase 5: AI/ML・次世代技術統合（予定）🤖

- **予測分析**：AIによるデータ傾向予測・自動レポート
- **自動最適化**：システム自動改善・パフォーマンス向上
- **音声制御**：「売上レポート作って」音声指示対応
- **ビジュアルプログラミング**：ドラッグ&ドロップでのシステム作成
- **GPT-4o統合**：高度なコード生成・自動デバッグ機能

---

## 🤝 コントリビューション・サポート

### 🌟 コミュニティ貢献募集

macOS/Linux版の機能完全化にコミュニティの力をお借りしています：

**求める貢献：**
- 🍎 **macOS環境**でのテスト・フィードバック
- 🐧 **Linux環境**でのテスト・フィードバック  
- 🎨 **UI/UX改善**提案
- 🌐 **多言語翻訳**協力
- 📚 **ドキュメント改善**
- 💡 **新機能アイデア**

**貢献方法：**
1. 🐛 **GitHub Issues**：バグ報告・機能要請
2. 🔧 **Pull Requests**：コード貢献
3. 💬 **GitHub Discussions**：アイデア・質問・サポート

### 📞 サポート窓口

**技術的問題：**
- 📄 **TROUBLESHOOTING.md**：詳細トラブルシューティング
- 🔧 **GitHub Issues**：バグ報告専用
- 💭 **GitHub Discussions**：質問・相談

**コミュニティ：**
- 🌟 **Star this repo**：プロジェクト支援
- 🔄 **Share & Fork**：拡散・改良歓迎
- 📢 **SNS投稿**：体験談・作品紹介

---

## 🎊 まとめ

**Claude-AppsScript-Pro v3.0.1** は、Google Apps Script開発の新時代を切り開く革命的プラットフォームです。

### ✨ 実現する価値

**開発者にとって：**
- 🚀 **10倍の開発効率**：AI自律システム・リアルタイムデバッグ
- 💡 **創造性の解放**：技術的制約から解放されたアイデア実現
- 🎓 **スキル向上**：高度なシステム開発を通じた学習効果

**ビジネスにとって：**
- ⏰ **即座のシステム構築**：アイデアから運用まで数分
- 💰 **コスト削減**：開発外注不要・内製化支援
- 📈 **競争優位性**：迅速なシステム開発による市場優位

**社会にとって：**
- 🌐 **技術民主化**：プログラミング初心者でも高度システム開発
- 🚀 **イノベーション加速**：アイデア実現の障壁撤廃
- 🤝 **コミュニティ価値**：オープンソースによる知識共有

### 🔥 今すぐ始めましょう！

```powershell
# Windows（最推奨・完全ノンストップ自動化）
powershell -Command "& { git clone https://github.com/overdozer1124/claude-appsscript-pro.git; cd claude-appsscript-pro; npm install; .\install-auto.bat }"
```

```bash
# macOS/Linux（完全版・2025.08.17実装完了！）
git clone https://github.com/overdozer1124/claude-appsscript-pro.git && cd claude-appsscript-pro && npm install && chmod +x install-complete.sh && ./install-complete.sh
```

```bash
# 全OS統合版（最高機能版・推奨）
git clone https://github.com/overdozer1124/claude-appsscript-pro.git && cd claude-appsscript-pro && npm install && node install-complete.js
```

**🎯 5分後、あなたは真のクロスプラットフォーム統一・次世代Google Apps Script開発を体験しています。**

---


**📋 要件**: Node.js 18.0.0+ | **🏷️ ライセンス**: MIT | **⭐ バージョン**: v3.0.1


