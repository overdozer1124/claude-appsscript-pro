/**
 * HTML to Apps Script Code Sanitizer
 * Automatically fixes common HTML/Apps Script conversion issues
 */
export class CodeSanitizer {
  static sanitizeForAppsScript(content) {
    if (typeof content !== 'string') return content;
    
    let sanitized = content;
    const fixes = [];
    
    // 1. Fix double-escaped newlines (\\n → \n)
    if (sanitized.includes('\\\\\\\\n')) {
      sanitized = sanitized.replace(/\\\\\\\\n/g, '\\\\n');
      fixes.push('Fixed double-escaped newlines (\\\\\\\\n → \\\\n)');
    }
    
    // 2. Convert HTML line breaks to Apps Script newlines
    if (sanitized.includes('<br>') || sanitized.includes('<br/>') || sanitized.includes('<br />')) {
      sanitized = sanitized.replace(/<br\\s*\\/?>/gi, '\\\\n');
      fixes.push('Converted HTML <br> tags to \\\\n');
    }
    
    // 3. Fix UI.alert with 2 parameters (not supported in Apps Script)
    const alertPattern = /SpreadsheetApp\\.getUi\\(\\)\\.alert\\s*\\(\\s*['\"](.*?)['\"],\\s*['\"](.*?)['\"](?!\\s*,)/g;
    if (alertPattern.test(sanitized)) {
      sanitized = sanitized.replace(alertPattern, (match, title, message) => {
        // Combine title and message into single parameter
        const combined = `${title}: ${message}`;
        return `SpreadsheetApp.getUi().alert('${combined}')`;
      });
      fixes.push('Fixed UI.alert 2-parameter calls to 1-parameter format');
    }
    
    // 4. Fix common HTML entities
    const htmlEntities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&nbsp;': ' '
    };
    
    for (const [entity, replacement] of Object.entries(htmlEntities)) {
      if (sanitized.includes(entity)) {
        sanitized = sanitized.replace(new RegExp(entity, 'g'), replacement);
        fixes.push(`Decoded HTML entity: ${entity} → ${replacement}`);
      }
    }
    
    // 5. Fix excessive backslash escaping in strings
    if (sanitized.includes('\\\\\\\\\\\\\\\\')) {
      sanitized = sanitized.replace(/\\\\\\\\\\\\\\\\+/g, '\\\\\\\\');
      fixes.push('Fixed excessive backslash escaping');
    }
    
    // 6. Normalize line endings (CRLF → LF)
    if (sanitized.includes('\\\\r\\\\n')) {
      sanitized = sanitized.replace(/\\\\r\\\\n/g, '\\\\n');
      fixes.push('Normalized line endings (CRLF → LF)');
    }
    
    return {
      content: sanitized,
      fixes: fixes,
      wasModified: fixes.length > 0
    };
  }
  
  static sanitizeScriptFiles(scriptFiles) {
    if (!Array.isArray(scriptFiles)) return { files: scriptFiles, totalFixes: 0, fixedFiles: [] };
    
    const sanitizedFiles = [];
    let totalFixes = 0;
    const fixedFiles = [];
    
    for (const file of scriptFiles) {
      if (file && typeof file.content === 'string') {
        const result = this.sanitizeForAppsScript(file.content);
        
        sanitizedFiles.push({
          ...file,
          content: result.content
        });
        
        if (result.wasModified) {
          totalFixes += result.fixes.length;
          fixedFiles.push({
            fileName: file.name || 'unnamed',
            fixes: result.fixes
          });
        }
      } else {
        sanitizedFiles.push(file);
      }
    }
    
    return {
      files: sanitizedFiles,
      totalFixes,
      fixedFiles
    };
  }
}
