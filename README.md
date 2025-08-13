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

### 方法1: Git使用（推奨）

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
   ```bash
   cd C:\Users\[ユーザー名]\Downloads\claude-appsscript-pro-main
   npm install
   .\install-windows.bat
   ```

## 🔧 よくある問題と解決方法

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

## 📋 OAuth設定

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

1. **Claude Desktop再起動**
2. **設定 → 開発者 → ローカルMCPサーバー有効化**
3. **動作確認**:
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

**要件**: Node.js 18.0.0+ | **ライセンス**: MIT