# 🔧 TROUBLESHOOTING.md - Comprehensive Problem Resolution Guide
## Claude-AppsScript-Pro MCP Server

This guide helps you resolve common issues when setting up and using Claude-AppsScript-Pro.

## 🚨 **Quick Diagnostics (Start Here)**

### **Step 1: Run Connection Test**
```javascript
claude-appsscript-pro:test_connection
```

**Expected Success Response:**
```
✅ MCP Server Connection: OK
✅ OAuth Authentication: Valid
✅ Google APIs: Initialized
🚀 Claude-AppsScript-Pro ready for use!
```

**If this fails, see:** [MCP Connection Issues](#mcp-connection-issues)

### **Step 2: Run Detailed Diagnostics**
```javascript
claude-appsscript-pro:diagnostic_info
```

**What this tells you:**
- OAuth authentication status
- Google API initialization
- Permission scopes
- Token validity
- Configuration errors

---

## 🔐 **OAuth Authentication Issues**

### **Problem 1: "OAuth credentials missing"**

**Error Message:**
```
❌ Error: Missing OAuth credentials: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN required
```

**Solution:**
1. **Create .env file** in your claude-appsscript-pro directory:
```bash
GOOGLE_APP_SCRIPT_API_CLIENT_ID=your_client_id_here
GOOGLE_APP_SCRIPT_API_CLIENT_SECRET=your_client_secret_here
GOOGLE_APP_SCRIPT_API_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_APP_SCRIPT_API_REDIRECT_URI=http://localhost:3001/oauth/callback
LOG_LEVEL=error
```

2. **Get OAuth credentials** from Google Cloud Console:
   - Go to https://console.cloud.google.com/
   - Create new project or select existing
   - Enable "Apps Script API" and "Google Drive API"
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3001/oauth/callback` as redirect URI

3. **Generate refresh token** using OAuth 2.0 Playground or custom script

### **Problem 2: "Invalid redirect URI"**

**Error Message:**
```
❌ Error: redirect_uri_mismatch
```

**Solution:**
1. **Check your Google Cloud Console:**
   - Go to APIs & Services → Credentials
   - Find your OAuth 2.0 Client ID
   - Authorized redirect URIs must include: `http://localhost:3001/oauth/callback`

2. **Verify .env file** has exact match:
```bash
GOOGLE_APP_SCRIPT_API_REDIRECT_URI=http://localhost:3001/oauth/callback
```

3. **Common mistakes:**
   - ❌ `https://localhost:3001/oauth/callback` (https instead of http)
   - ❌ `http://localhost:3000/oauth/callback` (wrong port)
   - ❌ Missing trailing slash or extra characters

### **Problem 3: "Refresh token expired"**

**Error Message:**
```
❌ Error: invalid_grant: Token has been expired or revoked
```

**Solution:**
1. **Generate new refresh token** through OAuth 2.0 flow
2. **Update .env file** with new refresh token
3. **Restart Claude Desktop** after updating .env

### **Problem 4: "Insufficient permissions"**

**Error Message:**
```
❌ Error: Insufficient authentication scopes
```

**Solution:**
1. **Ensure your OAuth consent screen** includes these scopes:
   - `https://www.googleapis.com/auth/script.projects`
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/spreadsheets`

2. **Re-generate refresh token** with all required scopes

---

## 🔌 **MCP Connection Issues**

### **Problem 1: Tool not found**

**Error Message:**
```
Error: Tool 'claude-appsscript-pro:test_connection' not found
```

**Solution:**
1. **Check Claude Desktop configuration** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "claude-appsscript-pro": {
      "command": "node",
      "args": ["server.js"],
      "cwd": "/full/path/to/claude-appsscript-pro"
    }
  }
}
```

2. **Verify file paths:**
   - **Windows:** `C:\Users\YourName\AppData\Roaming\Claude\MCP\claude-appsscript-pro`
   - **macOS:** `/Users/YourName/.claude/MCP/claude-appsscript-pro`
   - **Linux:** `/home/YourName/.claude/MCP/claude-appsscript-pro`

3. **Restart Claude Desktop** completely (quit and reopen)

### **Problem 2: Server startup failure**

**Error Message:**
```
❌ MCP Server failed to start
```

**Solution:**
1. **Check Node.js installation:**
```bash
node --version
# Should show v18.0.0 or higher
```

2. **Verify dependencies installed:**
```bash
cd claude-appsscript-pro
npm install
```

3. **Test server manually:**
```bash
node server.js
# Should start without errors
```

4. **Check for port conflicts** (server uses stdio, no ports needed)

### **Problem 3: Configuration file issues**

**Error Message:**
```
❌ Failed to load claude_desktop_config.json
```

**Solution:**
1. **Find correct config location:**
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. **Validate JSON syntax:**
```bash
# Use online JSON validator or:
node -e "console.log(JSON.parse(require('fs').readFileSync('claude_desktop_config.json')))"
```

3. **Use absolute paths** (avoid relative paths)

---

## 🏗️ **System Creation Issues**

### **Problem 1: "Project contents must include a manifest file"**

**Error Message:**
```
❌ Error: Project contents must include a manifest file named appsscript
```

**Solution:**
✅ **This is automatically fixed!** The system now auto-generates `appsscript.json`

If you still see this error:
1. **Update to latest version** of claude-appsscript-pro
2. **Use `create_from_template`** instead of manual creation:
```javascript
claude-appsscript-pro:create_from_template({
  template: "basic",
  system_name: "My Project"
})
```

### **Problem 2: "Cannot convert undefined or null to object"**

**Error Message:**
```
❌ Error: Cannot convert undefined or null to object
```

**Solution:**
This indicates malformed `script_files` parameter:

**❌ Wrong format:**
```javascript
script_files: "some string"  // Wrong: should be array
```

**✅ Correct format:**
```javascript
script_files: [
  {
    name: "Main",
    content: "function onOpen() { /* code */ }"
  }
]
```

**✅ Even better - use templates:**
```javascript
claude-appsscript-pro:create_from_template({
  template: "basic",
  system_name: "My Project"
})
```

### **Problem 3: Permission denied errors**

**Error Message:**
```
❌ Error: The caller does not have permission
```

**Solution:**
1. **Check Google Drive access:**
   - Go to https://drive.google.com/
   - Verify you can create folders/files

2. **Verify OAuth scopes** include:
   - Apps Script API access
   - Google Drive file creation
   - Spreadsheet creation

3. **Re-authenticate** if permissions changed

---

## 📊 **Google APIs Issues**

### **Problem 1: API not enabled**

**Error Message:**
```
❌ Error: Google Apps Script API has not been used in project
```

**Solution:**
1. **Go to Google Cloud Console** (https://console.cloud.google.com/)
2. **Enable required APIs:**
   - Google Apps Script API
   - Google Drive API  
   - Google Sheets API (optional but recommended)

3. **Wait 5-10 minutes** for APIs to become active

### **Problem 2: Quota exceeded**

**Error Message:**
```
❌ Error: Quota exceeded for quota metric
```

**Solution:**
1. **Check API quotas** in Google Cloud Console
2. **Wait for quota reset** (usually daily)
3. **Request quota increase** if needed for production use

### **Problem 3: Rate limiting**

**Error Message:**
```
❌ Error: Rate Limit Exceeded
```

**Solution:**
1. **Wait 1-2 minutes** before retrying
2. **Use incremental development** instead of bulk operations
3. **Implement retry logic** if building custom integrations

---

## 🐛 **Common Error Messages & Solutions**

### **"Cannot read properties of null"**
```javascript
// ❌ Problem: Missing null checks
const data = sheet.getRange('A1').getValue();
return data.toUpperCase(); // Crashes if data is null

// ✅ Solution: Use template-generated code with proper error handling
```

### **"Function not found"**
```javascript
// ❌ Problem: Function name typo or missing function
onOpen() // Missing 'function' keyword

// ✅ Solution: Use proper function syntax
function onOpen() {
  // code here
}
```

### **"Script function not found"**
- **Cause:** Function name in menu doesn't match actual function name
- **Solution:** Verify menu item function names match exactly

### **"Execution timeout"**
- **Cause:** Function runs too long (>6 minutes limit)
- **Solution:** Break into smaller functions or use time-based triggers

---

## 📋 **Diagnostic Checklist**

### **Before Asking for Help:**

**✅ Environment Check:**
- [ ] Node.js 18.0.0+ installed
- [ ] Claude Desktop latest version
- [ ] All dependencies installed (`npm install`)

**✅ Authentication Check:**
- [ ] `.env` file exists with all required variables
- [ ] OAuth credentials valid and not expired
- [ ] Google Cloud APIs enabled
- [ ] Correct redirect URI configured

**✅ Configuration Check:**
- [ ] `claude_desktop_config.json` has correct paths
- [ ] Claude Desktop restarted after config changes
- [ ] `test_connection` returns success

**✅ Project Check:**
- [ ] Using templates for new projects
- [ ] Project permissions allow editing
- [ ] Internet connection stable

---

## 🔍 **Advanced Debugging**

### **Enable Debug Logging**
Update `.env` file:
```bash
LOG_LEVEL=debug
```

**Restart Claude Desktop** to see detailed logs.

### **Manual Server Testing**
```bash
cd claude-appsscript-pro
node server.js
# Watch for startup errors
```

### **Check Google Cloud Logs**
1. Go to Google Cloud Console
2. Navigate to "Logging" → "Logs Explorer"  
3. Filter for your project
4. Look for authentication or API errors

### **Verify Network Connectivity**
```bash
# Test Google APIs access
curl "https://www.googleapis.com/discovery/v1/apis/script/v1/rest"
```

---

## 📞 **Getting Additional Help**

### **Step 1: Gather Information**
Before asking for help, collect:

1. **System information:**
```bash
node --version
npm --version
```

2. **Error messages** (exact text)

3. **Configuration files** (remove sensitive data):
   - `claude_desktop_config.json` (paths only)
   - `.env` (structure only, no actual credentials)

4. **Diagnostic output:**
```javascript
claude-appsscript-pro:diagnostic_info
```

### **Step 2: Check Common Solutions**
- Review this troubleshooting guide
- Check [EXAMPLES.md](EXAMPLES.md) for similar use cases
- Verify against [README.md](README.md) setup instructions

### **Step 3: Provide Detailed Information**
When asking for help, include:
- Operating system and version
- Exact error messages
- Steps to reproduce the issue
- What you've already tried

---

## 🚀 **Success Tips**

### **For Beginners:**
1. **Start with templates** - they handle 95% of setup automatically
2. **Always run `test_connection` first**
3. **Use `diagnostic_info` when things go wrong**
4. **Follow examples exactly** before customizing

### **For Advanced Users:**
1. **Use patch system** for maximum efficiency
2. **Enable debug logging** for complex issues
3. **Monitor Google Cloud quotas** for production use
4. **Implement proper error handling** in custom code

### **For Everyone:**
1. **Keep .env file secure** (never share credentials)
2. **Use absolute paths** in configurations
3. **Restart Claude Desktop** after major changes
4. **Back up working configurations**

---

💡 **Remember:** Claude-AppsScript-Pro is designed to eliminate most common problems automatically. If you're having issues, there's usually a simple configuration fix that resolves them quickly!