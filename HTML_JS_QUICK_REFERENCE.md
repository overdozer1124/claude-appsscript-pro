# 🚨 HTML/JavaScript修正 クイックリファレンスカード
## Claude-AppsScript-Pro 安全修正ガイド

> **🎯 目標**: コード破損率0%・修復成功率95%以上の安全な修正

---

## ⚡ **5秒診断チェック**

### **修正前の必須確認**
```
❓ ファイルタイプは？
   📄 .html → [HTMLファイル戦略](#html-modification-strategy)
   📄 .js → [JavaScriptファイル戦略](#javascript-modification-strategy)

❓ 変更規模は？
   🟢 5行以下 → パッチ可能
   🟡 6-20行 → ファイル全体更新推奨
   🔴 21行以上 → 新規ファイル作成推奨

❓ 変更内容は？
   ✅ 新機能追加 → 新規ファイル作成
   ⚠️ 既存機能修正 → ファイル全体更新
   🚨 構造変更 → 必須ファイル全体更新
```

---

## 🛠️ **HTML修正戦略**

### **✅ 安全パターン（推奨）**
```javascript
// 🎯 ファイル全体更新（最安全）
claude-appsscript-pro:update_script_file({
  script_id: "your_id",
  file_name: "index.html",
  content: `<!DOCTYPE html>
<html>
<head><base target="_top"><title>Safe HTML</title></head>
<body>
    <!-- 完全なHTML構造 -->
</body>
</html>`
})
```

### **❌ 危険パターン（回避）**
```javascript
// 🚨 部分的な修正（構文破損リスク）
❌ <div class="old"> → <div class="new">
❌ HTML内のJavaScript部分修正
❌ 属性の個別追加・削除
```

---

## 🔧 **JavaScript修正戦略**

### **✅ 安全パターン（推奨）**
```javascript
// 🎯 新機能は新規ファイル（最安全）
claude-appsscript-pro:add_script_file({
  script_id: "your_id",
  file_name: "NewFeatures",
  content: `function newSafeFunction() {
    return "新機能";
  }`,
  file_type: "server_js"
})

// 🎯 既存修正はファイル全体更新
claude-appsscript-pro:update_script_file({
  script_id: "your_id",
  file_name: "Main",
  content: `// 完全なJavaScriptファイル
function existingFunction() {
  return "更新された機能";
}`
})
```

### **❌ 危険パターン（回避）**
```javascript
// 🚨 部分的な修正（破損リスク）
❌ 関数の一部のみ変更
❌ import/export文の部分修正
❌ 変数名の一括置換
```

---

## 🚨 **緊急復旧手順**

### **エラー発生時の即座対応**
```javascript
// Step 1: 問題箇所特定（99%削減）
claude-appsscript-pro:diagnose_script_issues({
  script_id: "your_id",
  error_message: "実際のエラーメッセージ"
})

// Step 2: 最小限復旧
claude-appsscript-pro:update_script_file({
  script_id: "your_id", 
  file_name: "broken_file.html",
  content: `<!DOCTYPE html>
<html><head><base target="_top"></head>
<body><h1>復旧完了</h1></body></html>`
})

// Step 3: 段階的再構築
// 新規ファイルで機能を安全に再実装
```

---

## 📋 **戦略選択マトリックス**

| 状況 | 推奨戦略 | 使用ツール | 成功率 |
|------|---------|----------|-------|
| 新機能追加 | 新規ファイル作成 | `add_script_file` | 98% |
| HTML構造変更 | ファイル全体更新 | `update_script_file` | 95% |
| JS関数修正 | ファイル全体更新 | `update_script_file` | 95% |
| 5行以下変更 | パッチ適用 | `apply_code_patch` | 90% |
| エラー修正 | 統合診断修復 | `smart_fix_script` | 93% |
| 緊急復旧 | 診断→復旧 | `diagnose_script_issues` | 97% |

---

## 🎯 **Claude学習パターン**

### **推奨フロー**
```
1. 📊 事前診断: get_script_info
2. 🎯 戦略選択: 上記マトリックス参照
3. 🛠️ 安全実装: update_script_file/add_script_file
4. ✅ 事後確認: validate_function_consistency
5. 🚀 動作テスト: debug_web_app（該当時）
```

### **禁止パターン**
```
❌ HTMLタグの部分修正
❌ JavaScript関数の複数行部分変更
❌ import/export文の部分変更
❌ 文字エンコーディング関連の部分修正
❌ エラー発生時のパッチ強行
```

---

## 💡 **成功のコツ**

### **安全性優先の思考**
1. **完全性** > パッチの効率性
2. **新規ファイル** > 既存ファイル修正
3. **事前診断** > 試行錯誤
4. **段階的実装** > 一括変更

### **エラー回避チェックリスト**
- [ ] ファイルタイプ確認（.html/.js）
- [ ] 変更規模評価（行数・複雑度）
- [ ] 構造変更の有無確認
- [ ] バックアップ自動作成確認
- [ ] 事後検証手順準備

---

## 🔄 **典型的な成功パターン**

### **HTML Webアプリ開発**
```javascript
// 1. 最小HTMLから開始
claude-appsscript-pro:update_script_file({
  script_id: "id", file_name: "index.html",
  content: "<!DOCTYPE html>..."
})

// 2. JavaScript機能は別ファイル
claude-appsscript-pro:add_script_file({
  script_id: "id", file_name: "Features",
  content: "function feature() {...}"
})

// 3. 統合・テスト
claude-appsscript-pro:debug_web_app({
  web_app_url: "your_webapp_url"
})
```

---

**💡 覚えておくべき鉄則**: 
「疑ったらファイル全体更新。新機能は新規ファイル。エラーは診断から。」