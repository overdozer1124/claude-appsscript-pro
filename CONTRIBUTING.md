# 🤝 Contributing to Claude-AppsScript-Pro v2.1.0 Portable

We welcome contributions to Claude-AppsScript-Pro! This guide will help you get started with contributing to our revolutionary Google Apps Script development platform.

## 🎯 **Project Vision**

Claude-AppsScript-Pro v2.1.0 Portable is designed as a **cost-efficiency optimized system** that solves Claude's output limitation problem while providing complete Google Apps Script development capabilities.

### **Core Principles**
- **75-99% Output Reduction**: Minimize Claude token usage through smart tools
- **Cost-Efficiency First**: Prioritize practical, high-value features
- **Reliability**: Enterprise-grade stability and error handling
- **Accessibility**: Easy for beginners, powerful for experts

## 🚀 **Getting Started**

### **Development Setup**

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/claude-appsscript-pro.git
cd claude-appsscript-pro
npm install
```

2. **Environment Setup**
```bash
# Copy example environment file
cp .env.example .env

# Configure your Google OAuth credentials
# See README.md for detailed OAuth setup instructions
```

3. **Test Your Setup**
```bash
# Start the MCP server
node server.js

# Test connection (requires Claude Desktop)
claude-appsscript-pro:test_connection
```

## 📋 **Development Guidelines**

### **v2.1.0 Portable Architecture**

Our modular architecture focuses on maintainability and cost-efficiency:

```
server.js                          # Main entry point
├── lib/core/                      # Core systems
│   ├── google-apis-manager.js     # Google API integration
│   └── diagnostic-logger.js       # Logging and diagnostics
└── lib/handlers/                  # Tool handlers (47 tools)
    ├── basic-tools.js             # Connection & diagnostics
    ├── system-tools.js            # System creation
    ├── sheet-tools.js             # Google Sheets operations
    ├── development-tools.js       # Continuous development
    ├── patch-tools.js             # Patch system
    ├── function-tools.js          # Function integrity
    ├── formula-tools.js           # Formula analysis
    ├── browser-debug-tools.js     # Browser debugging
    ├── webapp-deployment-tools.js # WebApp deployment
    ├── execution-tools.js         # Script execution
    └── intelligent-workflow-tools.js # AI autonomous workflow
```

### **Code Quality Standards**

#### **JavaScript Standards**
- Use ES6+ features (async/await, destructuring, modules)
- Implement comprehensive error handling
- Follow consistent naming conventions
- Add JSDoc comments for public methods

#### **Error Handling Pattern**
```javascript
async handleToolName(args) {
  try {
    // Validate input
    if (!args.required_param) {
      return { success: false, error: 'Missing required parameter' };
    }

    // Main logic
    const result = await this.performOperation(args);

    // Return success response
    return {
      success: true,
      data: result,
      message: 'Operation completed successfully'
    };
  } catch (error) {
    this.logger.error(`Error in handleToolName: ${error.message}`);
    return {
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
}
```

#### **Tool Definition Pattern**
```javascript
// In handler class
getToolDefinitions() {
  return [
    {
      name: 'tool_name',
      description: '🎯 Clear, actionable description with emoji',
      inputSchema: {
        type: 'object',
        properties: {
          required_param: {
            type: 'string',
            description: 'Clear parameter description'
          },
          optional_param: {
            type: 'boolean',
            description: 'Optional parameter with default behavior'
          }
        },
        required: ['required_param']
      }
    }
  ];
}
```

## 🔧 **Contributing Process**

### **1. Issue Reporting**

#### **Bug Reports**
Use our bug report template:
```markdown
**Bug Description**
Clear description of the issue

**Environment**
- OS: Windows/macOS/Linux
- Node.js version: 
- Claude Desktop version:

**Steps to Reproduce**
1. Step one
2. Step two
3. Expected vs actual behavior

**Error Messages**
```
Include any error logs or screenshots
```

**Tool Affected**
Which MCP tool(s) are involved
```

#### **Feature Requests**
```markdown
**Feature Description**
What functionality would you like to see?

**Use Case**
How would this feature improve the development workflow?

**Output Reduction Impact**
How does this feature contribute to our 75-99% output reduction goal?

**Implementation Ideas**
Any technical suggestions or considerations
```

### **2. Pull Request Process**

#### **Branch Naming**
- `feature/tool-name` - New tool implementations
- `fix/bug-description` - Bug fixes
- `docs/section-name` - Documentation updates
- `refactor/component-name` - Code improvements

#### **Commit Message Format**
```
type(scope): description

Examples:
feat(browser-debug): add network monitoring capability
fix(oauth): resolve token refresh issue
docs(readme): update tool count to 47
refactor(sheet-tools): improve error handling
```

#### **PR Requirements**
- [ ] Code follows our standards
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Error handling implemented
- [ ] Tool count updated if applicable
- [ ] Performance impact considered

### **3. Code Review Checklist**

#### **Functionality**
- [ ] Tool works as described
- [ ] Input validation implemented
- [ ] Error cases handled gracefully
- [ ] Output format consistent

#### **Performance**
- [ ] Memory usage optimized
- [ ] No unnecessary API calls
- [ ] Async operations properly handled
- [ ] Resource cleanup implemented

#### **Integration**
- [ ] Compatible with existing tools
- [ ] Follows MCP protocol standards
- [ ] OAuth integration working
- [ ] Logging properly implemented

## 🛠️ **Tool Development**

### **Adding New Tools**

1. **Identify Need**
   - Solves real Google Apps Script development problem
   - Contributes to output reduction goal
   - Fits v2.1.0 Portable philosophy

2. **Design Tool**
   - Clear, specific purpose
   - Minimal input parameters
   - Comprehensive output
   - Error resilience

3. **Implementation Steps**
   ```bash
   # 1. Create/modify appropriate handler file
   # 2. Add tool definition
   # 3. Implement handler method
   # 4. Update tool registration
   # 5. Test thoroughly
   # 6. Update documentation
   ```

### **Tool Categories Priority**

1. **High Priority**: Tools that directly reduce Claude output
2. **Medium Priority**: Developer experience improvements
3. **Low Priority**: Nice-to-have features

### **Performance Guidelines**

- **Memory**: Each tool should use <10MB additional memory
- **Response Time**: <5 seconds for most operations
- **API Calls**: Minimize Google API usage
- **Error Recovery**: Graceful degradation on failures

## 📚 **Documentation Standards**

### **README.md Updates**
When adding tools, update:
- Tool count in badges and headers
- Tool reference section
- Workflow examples if applicable
- Performance metrics if significant

### **Code Documentation**
- JSDoc for all public methods
- Inline comments for complex logic
- Error handling explanations
- API usage examples

### **Tool Documentation**
Each tool should have:
- Clear purpose statement
- Parameter descriptions
- Return format specification
- Usage examples
- Error scenarios

## 🔍 **Testing Guidelines**

### **Required Tests**
- Unit tests for new tools
- Integration tests with Google APIs
- Error handling verification
- Performance benchmarks

### **Test Environment**
```bash
# Set up test environment
cp .env.example .env.test
# Configure test credentials

# Run tests
npm test

# Run specific tool tests
npm test -- --grep "tool-name"
```

### **Manual Testing Checklist**
- [ ] Tool executes successfully
- [ ] Error cases handled properly
- [ ] OAuth authentication works
- [ ] Output format correct
- [ ] Performance acceptable

## 🚨 **Important Considerations**

### **Cost-Efficiency Focus**
v2.1.0 Portable prioritizes practical value:
- Features must solve real problems
- Avoid feature creep
- Optimize for common use cases
- Balance functionality vs. complexity

### **Backward Compatibility**
- Existing tool interfaces should remain stable
- New features should be additive
- Breaking changes require major version bump
- Migration guides for significant changes

### **Security Guidelines**
- Never log sensitive credentials
- Validate all user inputs
- Use OAuth 2.0 properly
- Minimize permission scope
- Handle credentials securely

## 🤔 **Questions or Need Help?**

- **General Questions**: Open a GitHub Discussion
- **Bug Reports**: Create an Issue
- **Feature Ideas**: Start with a Discussion
- **Implementation Help**: Comment on relevant Issues

## 🏆 **Recognition**

Contributors will be:
- Listed in README.md contributors section
- Mentioned in release notes
- Credited in tool documentation (for major contributions)

Thank you for helping make Claude-AppsScript-Pro the best Google Apps Script development platform for Claude users!

---

## 📋 **Quick Reference**

### **Common Commands**
```bash
# Development
npm install
node server.js
npm test

# Git workflow
git checkout -b feature/my-feature
git commit -m "feat(scope): description"
git push origin feature/my-feature
```

### **Key Files**
- `server.js` - Main entry point
- `lib/handlers/` - Tool implementations
- `package.json` - Dependencies and scripts
- `.env` - Local configuration
- `README.md` - Project documentation

### **Tool Count Tracking**
Current: **47 tools**
- Update badges when adding/removing tools
- Update headers and descriptions
- Maintain accurate counts in documentation
