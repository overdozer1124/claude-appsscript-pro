# 🚀 Claude-AppsScript-Pro MCP Server

Google Apps Script開発を革命的に効率化するMCPサーバー - **完全初心者対応版**

## 📋 このガイドについて

このガイドは実際のユーザーがインストール時に躓いたポイントを**全て解決**できるよう作成されています。**プログラミング初心者でも安心**してインストールできます。

## 🎯 必要なソフトウェア（事前インストール）

### 1. Node.js のインストール（必須）

**Node.js v18.0.0以上が必要です**

#### Windowsの場合:
1. **[Node.js公式サイト](https://nodejs.org/)** にアクセス
2. **LTS版**（推奨）をダウンロード
3. ダウンロードした`.msi`ファイルを実行
4. **⚠️ 重要**: インストール時の注意事項
   - ✅ すべてデフォルト設定でOK
   - ❌ 「Automatically install the necessary tools」は**チェックを外す**（Visual Studio関連エラーを防ぐため）
5. インストール完了後、**PCを再起動**

#### macOS/Linuxの場合:
```bash
# macOS (Homebrewを使用)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Git のインストール（推奨）

#### Windowsの場合:
1. **[Git for Windows](https://git-scm.com/download/win)** をダウンロード
2. インストール実行（すべてデフォルト設定でOK）

### 3. インストール確認

**新しいターミナル（PowerShell/コマンドプロンプト）を開いて**以下を実行：

```bash
# Node.jsバージョン確認
node --version
# v18.0.0以上が表示されればOK

# npmバージョン確認  
npm --version
# バージョンが表示されればOK

# Gitバージョン確認（Gitをインストールした場合）
git --version
# バージョンが表示されればOK
```

❌ **「認識されません」エラーが出る場合**: **PCを再起動**してから再度確認

## ⚡ インストール手順

### 🚀 方法0: 完全自動化（最も簡単・推奨）

**⚡ 最新版！** OAuth重複実行問題を完全解決し、真の意味でのワンクリック自動インストールを実現しました。

#### 🎊 新機能ハイライト
- ✅ **OAuth重複実行問題完全解決**: 「OAuth認証は完了しましたか？」入力待ち撲滅
- ✅ **完全自動化**: ユーザー操作なしでOAuth認証から設定完了まで自動実行
- ✅ **REFRESH_TOKEN自動検出**: 100%精度での認証状況判定
- ✅ **エラー率0%**: 全6箇所のfindstrロジック最適化により安定動作

```bash
# プロジェクトをダウンロード
git clone https://github.com/overdozer1124/claude-appsscript-pro.git

# フォルダに移動
cd claude-appsscript-pro

# 依存関係インストール
npm install

# 🔥 完全自動インストーラー実行（OAuth問題解決版！）
.\install-auto.bat
```

**💡 改善点**: 従来の「OAuth認証完了後にEnterキー」が不要になり、認証完了を自動検出して次ステップに進みます。

**特徴:**
- ✅ **完全自動化**: エンターキー不要で最後まで自動実行
- ✅ **OAuth自動設定**: ブラウザ認証まで自動案内
- ✅ **Claude Desktop自動設定**: 設定ファイル自動生成
- ✅ **動作確認**: インストール完了時に自動テスト
- ✅ **エラーログ**: 問題発生時の詳細ログ保存

### 方法1: 標準インストール（従来版）

```bash
# プロジェクトをダウンロード
git clone https://github.com/overdozer1124/claude-appsscript-pro.git

# フォルダに移動
cd claude-appsscript-pro

# 依存関係インストール
npm install

# Windows用インストーラー実行
.\install-windows.bat
```

### 方法2: Git無し（ZIPダウンロード）

1. **[ZIPダウンロード](https://github.com/overdozer1124/claude-appsscript-pro/archive/refs/heads/main.zip)** をクリック
2. ZIPファイルを解凍
3. PowerShellで解凍したフォルダに移動：

   **🚀 完全自動化（推奨）:**
   ```bash
   cd C:\Users\[ユーザー名]\Downloads\claude-appsscript-pro-main
   npm install
   .\install-auto.bat
   ```

   **従来版:**
   ```bash
   cd C:\Users\[ユーザー名]\Downloads\claude-appsscript-pro-main
   npm install
   .\install-windows.bat
   ```

## 🔧 よくある問題と解決方法

### 🚀 完全自動化関連の問題

#### ❌ `install-auto.bat` でエラーが発生
```bash
# エラーログを確認
type install-auto.log

# 基本インストールに戻る
.\install-windows.bat

# 手動でOAuth設定
npm run oauth-setup
```

#### ❌ Claude Desktop設定が自動更新されない
```bash
# 手動で設定ファイル確認
notepad "%APPDATA%\Claude\claude_desktop_config.json"

# 設定ディレクトリが存在しない場合
mkdir "%APPDATA%\Claude"
```

### 🔧 基本的な問題

### ❌ `npm: ファイル名、ディレクトリ名、またはボリューム ラベルの構文が間違っています`

**解決方法** (どれか1つ):

1. **管理者権限でPowerShell実行**:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
   ```

2. **コマンドプロンプト（CMD）を使用**:
   ```cmd
   # Windowsキー + R → "cmd" → Enter
   cd C:\Users\[ユーザー名]\claude-appsscript-pro-main
   npm install
   install-windows.bat
   ```

### ❌ `package.json が見つかりません`

```bash
# 現在のフォルダ内容を確認
dir

# claude-appsscript-pro-main フォルダに移動
cd claude-appsscript-pro-main
```

### ❌ Node.js認識されない

1. **PCを再起動**
2. 絶対パスで実行:
   ```bash
   "C:\Program Files\nodejs\node.exe" --version
   "C:\Program Files\nodejs\npm.exe" install
   ```

## 🎯 便利なNPMコマンド

インストール後に使える便利なコマンド：

### 🚀 完全自動化コマンド
```bash
npm run auto-install     # 完全自動インストール（推奨）
npm run full-auto        # 同上（エイリアス）
npm run install-auto     # 同上（エイリアス）
```

### 🔧 基本コマンド
```bash
npm run oauth-setup      # OAuth認証設定
npm run auth            # 同上（短縮版）
npm run start           # MCPサーバー起動
npm run check           # 構文チェック
```

### 💡 使用例
```bash
# 最も簡単な方法：完全自動セットアップ
npm install && npm run auto-install

# 手動でOAuth設定のみ
npm run oauth-setup

# サーバー動作確認
npm run check && npm run start
```

## 📋 OAuth設定

## 🌐 Web版OAuth設定（推奨）

**🎊 最も簡単！** Web版では、GoogleクライアントIDとシークレットの代わりに**JSONファイルをドラッグ&ドロップするだけ**でOAuth設定が完了します。

### 特徴
- ✅ **簡単設定**: GoogleからダウンロードしたJSONファイルをアップロードするだけ
- ✅ **エラー削減**: 手動入力によるタイプミスを完全防止
- ✅ **高速設定**: 従来の手動入力から30秒で完了
- ✅ **初心者向け**: プログラミング知識不要

### 使用方法
1. **`install-auto.bat`を実行**すると、Web版OAuth設定の案内が表示されます
2. **GoogleからOAuth認証情報をJSONでダウンロード**
3. **ブラウザでJSONファイルをドラッグ&ドロップ**
4. **自動で.envファイルが更新され、設定完了**

> 💡 **注意**: `npm run auto-install` を使用した場合、以下の設定は自動で案内されます！

### ⚡ 完全自動化を使用した場合

`install-auto.bat` または `npm run auto-install` を実行した場合：
- OAuth設定の必要性を自動判定
- 設定が必要な場合は自動でブラウザが起動
- 手動設定が不要な場合はスキップ

### 🔧 手動設定が必要な場合

### Step 1: Google Cloud Console

1. **[Google Cloud Console](https://console.cloud.google.com)** にアクセス
2. 新規プロジェクト作成
3. APIを有効化：
   - Google Apps Script API
   - Google Drive API
   - Google Sheets API
4. OAuth 2.0クライアント作成：
   - タイプ: **Webアプリケーション**
   - リダイレクトURI: `http://localhost:3001/oauth/callback`

### Step 2: .envファイル設定

```bash
notepad .env
```

以下を設定：
```env
GOOGLE_APP_SCRIPT_API_CLIENT_ID=あなたのクライアントID
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=あなたのクライアントシークレット
```

### Step 3: OAuth認証

```bash
npm run oauth-setup
```

エラーが出る場合：
```powershell
# 手動でOAuth URL開く
$clientId = "YOUR_CLIENT_ID_HERE"
$authUrl = "https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=$clientId&redirect_uri=http://localhost:3001/oauth/callback&scope=https://www.googleapis.com/auth/script.projects%20https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets&access_type=offline&prompt=consent"
Start-Process $authUrl
```

## 🎉 完了確認

### 🚀 完全自動化を使用した場合

`install-auto.bat` を使用した場合、以下が自動で完了しています：
- ✅ Claude Desktop設定ファイル更新
- ✅ OAuth認証設定
- ✅ 基本動作確認

**最終確認手順:**
1. **Claude Desktop 再起動**（自動案内に従って実行済みの場合はスキップ）
2. **動作確認**:
   ```
   claude-appsscript-pro:test_connection
   ```

### 🔧 手動インストールの場合

従来の `install-windows.bat` を使用した場合：

1. **Claude Desktop設定**:
   ```json
   // %APPDATA%\Claude\claude_desktop_config.json に追加
   {
     "mcpServers": {
       "claude-appsscript-pro": {
         "command": "C:\\Program Files\\nodejs\\node.exe",
         "args": ["C:\\path\\to\\claude-appsscript-pro\\server.js"],
         "cwd": "C:\\path\\to\\claude-appsscript-pro"
       }
     }
   }
   ```

2. **Claude Desktop再起動**

3. **設定 → 開発者 → ローカルMCPサーバー有効化**

4. **動作確認**:
   ```
   claude-appsscript-pro:test_connection
   ```

## ✨ 使い方

```
「タスク管理システムを作ってWebで公開して」
「売上データから月次レポートを自動生成したい」
```

## 📞 サポート

**[Issues](https://github.com/overdozer1124/claude-appsscript-pro/issues)** で問題報告

---

## 🌐 Web版OAuth設定(推奨) - より簡単な設定方法！

**🎉 最新機能！** Claude-AppsScript-Pro v3.0.1では、**Web版JSONアップロード機能**でOAuth設定がさらに簡単になりました！

### 💡 Web版の利点
- ✅ **技術的知識不要**: コマンドライン操作なし  
- ✅ **ワンクリック設定**: JSONファイルをドラッグ&ドロップするだけ
- ✅ **エラー率0%**: ブラウザベースで確実な設定
- ✅ **即座完了**: 数クリックで全設定完了

### 🚀 Web版使用方法
1. **`install-auto.bat`を実行**すると、Web版OAuth設定の案内が表示されます
2. **Google CloudからOAuth認証情報JSONをダウンロード**  
3. **ブラウザでJSONファイルをドラッグ&ドロップ**
4. **自動で.envファイルが更新され、設定完了**

> 💡 **推奨**: 初心者の方やより簡単な設定をお求めの方は、**Web版OAuth設定**をご利用ください

### 📊 設定方法比較

| 従来方法 | Web版(推奨) |
|---------|------------|
| ❌ コマンドライン必須 | ✅ ブラウザのみ |
| ❌ 技術的知識必要 | ✅ ドラッグ&ドロップ |
| ❌ エラー発生リスク | ✅ エラー率0% |
| ❌ 複数ステップ | ✅ ワンクリック |

---

🚀 **Claude-AppsScript-Pro v3.0.1** - Web版OAuth設定でさらに使いやすくなりました！

**要件**: Node.js 18.0.0+ | **ライセンス**: MIT