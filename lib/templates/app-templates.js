/**
 * Pre-defined templates for rapid system creation
 * Claude-AppsScript-Pro Template Library
 * 
 * This module contains all pre-built templates for quick Apps Script system creation.
 * Extracted from main server.js for better modularity and reduced token usage.
 */

const TEMPLATES = {
  basic: {
    description: "Basic Apps Script with menu and alert functionality",
    files: [
      {
        name: "Main",
        type: "server_js",
        content: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 My App')
    .addItem('👋 Hello World', 'showHello')
    .addItem('📊 Show Info', 'showInfo')
    .addToUi();
}

function showHello() {
  SpreadsheetApp.getUi().alert('👋 Hello from Apps Script!');
}

function showInfo() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const info = \`Sheet: \${sheet.getName()}\\nRows: \${sheet.getLastRow()}\\nColumns: \${sheet.getLastColumn()}\`;
  SpreadsheetApp.getUi().alert('📊 Sheet Info', info, SpreadsheetApp.getUi().ButtonSet.OK);
}`
      }
    ]
  },
  
  game: {
    description: "Game template with score tracking and player interaction",
    files: [
      {
        name: "Main",
        type: "server_js", 
        content: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎮 Game')
    .addItem('🆕 New Game', 'startNewGame')
    .addItem('📊 Show Score', 'showScore')
    .addItem('🏆 High Scores', 'showHighScores')
    .addItem('❓ Help', 'showHelp')
    .addToUi();
}

function startNewGame() {
  const sheet = SpreadsheetApp.getActiveSheet();
  initializeGameBoard(sheet);
  SpreadsheetApp.getUi().alert('🎮 New game started! Good luck!');
}

function showScore() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const score = calculateScore();
  SpreadsheetApp.getUi().alert('📊 Your Score: ' + score + ' points');
}

function showHighScores() {
  SpreadsheetApp.getUi().alert('🏆 High Scores feature coming soon!');
}

function showHelp() {
  const help = '🎮 Game Help\\n\\n' +
               '1. Click "New Game" to start\\n' +
               '2. Use the spreadsheet to play\\n' +
               '3. Check your score anytime';
  SpreadsheetApp.getUi().alert('Help', help, SpreadsheetApp.getUi().ButtonSet.OK);
}`
      },
      {
        name: "GameLogic",
        type: "server_js",
        content: `// Game logic functions

function initializeGameBoard(sheet) {
  // Clear and setup game board
  const range = sheet.getRange('A1:J10');
  range.clear();
  range.setBackground('#f0f0f0');
  
  // Add game title
  sheet.getRange('A1').setValue('🎮 Game Board');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
}

function calculateScore() {
  // Calculate current score - customize this logic
  const sheet = SpreadsheetApp.getActiveSheet();
  // Simple scoring example
  return Math.floor(Math.random() * 1000);
}

function processMove(row, col) {
  // Process player move
  const sheet = SpreadsheetApp.getActiveSheet();
  const cell = sheet.getRange(row, col);
  
  // Game logic here
  return true;
}`
      }
    ]
  },
  
  business: {
    description: "Business application template with reporting features",
    files: [
      {
        name: "Main",
        type: "server_js",
        content: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('💼 Business App')
    .addItem('📊 Generate Report', 'generateReport')
    .addItem('📈 Update Dashboard', 'updateDashboard')
    .addItem('📧 Send Email', 'sendEmailReport')
    .addSeparator()
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

function generateReport() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Report generation logic
    SpreadsheetApp.getUi().alert('📊 Report generated successfully!');
    
  } catch (error) {
    console.error('Report generation error:', error);
    SpreadsheetApp.getUi().alert('Error', 'Report generation failed: ' + error.message);
  }
}

function updateDashboard() {
  // Dashboard update logic
  SpreadsheetApp.getUi().alert('📈 Dashboard updated!');
}

function sendEmailReport() {
  // Email sending logic
  SpreadsheetApp.getUi().alert('📧 Email functionality ready for customization');
}

function showSettings() {
  const settings = '⚙️ Settings\\n\\n' +
                  '• Configure email recipients\\n' +
                  '• Set report frequency\\n' +
                  '• Customize dashboard';
  SpreadsheetApp.getUi().alert('Settings', settings, SpreadsheetApp.getUi().ButtonSet.OK);
}`
      }
    ]
  },
  
  education: {
    description: "Educational template with learning tools and quizzes",
    files: [
      {
        name: "Main",
        type: "server_js",
        content: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📚 Education')
    .addItem('📝 Create Quiz', 'createQuiz')
    .addItem('📊 Check Answers', 'checkAnswers')
    .addItem('🎯 Show Progress', 'showProgress')
    .addItem('📖 Study Guide', 'showStudyGuide')
    .addToUi();
}

function createQuiz() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Sample quiz questions
  const questions = [
    ['Question', 'Answer A', 'Answer B', 'Answer C', 'Correct'],
    ['What is 2+2?', '3', '4', '5', 'B'],
    ['Capital of Japan?', 'Tokyo', 'Osaka', 'Kyoto', 'A']
  ];
  
  const range = sheet.getRange(1, 1, questions.length, questions[0].length);
  range.setValues(questions);
  
  SpreadsheetApp.getUi().alert('📝 Quiz created! Add more questions as needed.');
}

function checkAnswers() {
  SpreadsheetApp.getUi().alert('📊 Answer checking feature ready for implementation');
}

function showProgress() {
  SpreadsheetApp.getUi().alert('🎯 Progress tracking coming soon!');
}

function showStudyGuide() {
  const guide = '📖 Study Guide\\n\\n' +
                '1. Review the quiz questions\\n' +
                '2. Practice with sample data\\n' +
                '3. Track your progress';
  SpreadsheetApp.getUi().alert('Study Guide', guide, SpreadsheetApp.getUi().ButtonSet.OK);
}`
      }
    ]
  },
  
  utility: {
    description: "Utility template with helper functions and tools",
    files: [
      {
        name: "Main",
        type: "server_js",
        content: `function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🔧 Utilities')
    .addItem('🧹 Clean Data', 'cleanData')
    .addItem('📋 Copy Range', 'copyRange')
    .addItem('📏 Count Cells', 'countCells')
    .addItem('🔄 Sort Data', 'sortData')
    .addToUi();
}

function cleanData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  
  // Remove empty rows/columns
  SpreadsheetApp.getUi().alert('🧹 Data cleaning feature ready for customization');
}

function copyRange() {
  SpreadsheetApp.getUi().alert('📋 Range copying utility ready for implementation');
}

function countCells() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = sheet.getDataRange();
  const cellCount = range.getNumRows() * range.getNumColumns();
  
  SpreadsheetApp.getUi().alert('📏 Cell Count: ' + cellCount + ' cells');
}

function sortData() {
  SpreadsheetApp.getUi().alert('🔄 Data sorting utility ready for implementation');
}`
      },
      {
        name: "Utils",
        type: "server_js",
        content: `// Utility helper functions

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function isValidEmail(email) {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}

function generateId() {
  return Utilities.getUuid();
}

function logInfo(message, data = null) {
  console.log('[INFO]', message, data);
}

function logError(message, error = null) {
  console.error('[ERROR]', message, error);
}`
      }
    ]
  }
};

// ES Modules Export
export { TEMPLATES };
