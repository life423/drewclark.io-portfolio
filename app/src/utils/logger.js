/**
 * Logger Utility
 * 
 * A centralized logging utility that provides consistent logging across the application.
 * It allows for controlled log levels based on environment and provides additional context.
 */

// Current environment
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_TEST = process.env.NODE_ENV === 'test';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Default log level based on environment
const DEFAULT_LOG_LEVEL = IS_PRODUCTION ? LOG_LEVELS.ERROR : 
                         IS_TEST ? LOG_LEVELS.NONE : LOG_LEVELS.DEBUG;

// Set this to control logging verbosity
let currentLogLevel = DEFAULT_LOG_LEVEL;

/**
 * Creates a timestamp string in the format [HH:MM:SS.mmm]
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  
  return `[${hours}:${minutes}:${seconds}.${milliseconds}]`;
};

/**
 * Formats a log message with timestamp, level, and module name
 * @param {string} level - Log level label
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @returns {string} Formatted log message
 */
const formatLogMessage = (level, module, message) => {
  return `${getTimestamp()} [${level}] ${module ? `[${module}] ` : ''}${message}`;
};

// The logger object
const logger = {
  /**
   * Set the current log level
   * @param {number} level - Log level from LOG_LEVELS
   */
  setLogLevel(level) {
    if (Object.values(LOG_LEVELS).includes(level)) {
      currentLogLevel = level;
    }
  },
  
  /**
   * Get the current log level
   * @returns {number} Current log level
   */
  getLogLevel() {
    return currentLogLevel;
  },
  
  /**
   * Debug level log - for detailed debugging information
   * @param {string} message - The message to log
   * @param {string} [module] - Optional module name for context
   * @param {...any} args - Additional arguments to log
   */
  debug(message, module, ...args) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.debug(formatLogMessage('DEBUG', module, message), ...args);
    }
  },
  
  /**
   * Info level log - for general information
   * @param {string} message - The message to log
   * @param {string} [module] - Optional module name for context
   * @param {...any} args - Additional arguments to log
   */
  info(message, module, ...args) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(formatLogMessage('INFO', module, message), ...args);
    }
  },
  
  /**
   * Warn level log - for warnings that don't prevent operation
   * @param {string} message - The message to log
   * @param {string} [module] - Optional module name for context
   * @param {...any} args - Additional arguments to log
   */
  warn(message, module, ...args) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(formatLogMessage('WARN', module, message), ...args);
    }
  },
  
  /**
   * Error level log - for errors that affect operation
   * @param {string} message - The message to log
   * @param {string} [module] - Optional module name for context
   * @param {...any} args - Additional arguments to log including error objects
   */
  error(message, module, ...args) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(formatLogMessage('ERROR', module, message), ...args);
    }
  },
  
  /**
   * Create a logger instance for a specific module
   * @param {string} moduleName - The module name
   * @returns {Object} A logger instance bound to the module
   */
  getLogger(moduleName) {
    return {
      debug: (message, ...args) => logger.debug(message, moduleName, ...args),
      info: (message, ...args) => logger.info(message, moduleName, ...args),
      warn: (message, ...args) => logger.warn(message, moduleName, ...args),
      error: (message, ...args) => logger.error(message, moduleName, ...args)
    };
  }
};

// Expose log levels
logger.LOG_LEVELS = LOG_LEVELS;

export default logger;
