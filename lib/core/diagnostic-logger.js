/**
 * Diagnostic Logger for detailed debugging
 */
export class DiagnosticLogger {
  constructor() {
    this.logs = [];
    this.logLevel = process.env.LOG_LEVEL || 'info';
  }

  log(level, message, data = null) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    
    this.logs.push(entry);
    
    if (this.shouldLog(level)) {
      console.error(`[${level}] ${message}`, data || '');
    }
  }

  shouldLog(level) {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  error(message, data = null) { this.log('error', message, data); }
  warn(message, data = null) { this.log('warn', message, data); }
  info(message, data = null) { this.log('info', message, data); }
  debug(message, data = null) { this.log('debug', message, data); }

  getLogs() { return this.logs; }
}