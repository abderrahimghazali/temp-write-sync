const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// Global registry to track temporary files for cleanup
const tempFiles = new Set();
let cleanupRegistered = false;

/**
 * Write content to a temporary file synchronously
 * @param {string|Buffer} content - Content to write to the file
 * @param {string} extension - File extension (e.g., '.txt', '.json')
 * @param {Object} options - Configuration options
 * @param {string} options.dir - Custom temporary directory
 * @param {string} options.prefix - Filename prefix (default: 'temp-')
 * @param {boolean} options.cleanup - Enable automatic cleanup (default: true)
 * @param {number} options.mode - File permissions (default: 0o600)
 * @returns {string} Path to the created temporary file
 */
function tempWriteSync(content, extension = '', options = {}) {
  const {
    dir = os.tmpdir(),
    prefix = 'temp-',
    cleanup = true,
    mode = 0o600
  } = options;

  // Validate inputs
  if (content === null || content === undefined) {
    throw new Error('Content cannot be null or undefined');
  }

  if (typeof extension !== 'string') {
    throw new Error('Extension must be a string');
  }

  // Ensure extension starts with dot if provided
  if (extension && !extension.startsWith('.')) {
    extension = '.' + extension;
  }

  // Generate unique filename
  const randomId = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now().toString(36);
  const filename = `${prefix}${timestamp}-${randomId}${extension}`;
  const filePath = path.join(dir, filename);

  try {
    // Ensure temp directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write content to file
    fs.writeFileSync(filePath, content, { mode });

    // Register for cleanup if enabled
    if (cleanup) {
      registerCleanup();
      tempFiles.add(filePath);
    }

    return filePath;
  } catch (error) {
    throw new Error(`Failed to write temporary file: ${error.message}`);
  }
}

/**
 * Write JSON content to a temporary file
 * @param {Object} obj - Object to serialize as JSON
 * @param {Object} options - Configuration options
 * @returns {string} Path to the created temporary JSON file
 */
function tempWriteJsonSync(obj, options = {}) {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Input must be a valid object');
  }

  const jsonContent = JSON.stringify(obj, null, 2);
  return tempWriteSync(jsonContent, '.json', options);
}

/**
 * Write CSV content to a temporary file
 * @param {Array<Array>|Array<Object>} data - CSV data as array of arrays or objects
 * @param {Object} options - Configuration options
 * @param {string} options.delimiter - CSV delimiter (default: ',')
 * @returns {string} Path to the created temporary CSV file
 */
function tempWriteCsvSync(data, options = {}) {
  const { delimiter = ',' } = options;

  if (!Array.isArray(data)) {
    throw new Error('CSV data must be an array');
  }

  let csvContent = '';

  if (data.length > 0) {
    if (Array.isArray(data[0])) {
      // Array of arrays
      csvContent = data.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter)
      ).join('\n');
    } else if (typeof data[0] === 'object') {
      // Array of objects
      const headers = Object.keys(data[0]);
      const headerRow = headers.map(h => `"${h}"`).join(delimiter);
      const dataRows = data.map(row => 
        headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(delimiter)
      );
      csvContent = [headerRow, ...dataRows].join('\n');
    } else {
      throw new Error('Invalid CSV data format');
    }
  }

  return tempWriteSync(csvContent, '.csv', options);
}

/**
 * Create a temporary directory
 * @param {Object} options - Configuration options
 * @param {string} options.dir - Parent directory for temp dir
 * @param {string} options.prefix - Directory name prefix
 * @param {boolean} options.cleanup - Enable automatic cleanup (default: true)
 * @returns {string} Path to the created temporary directory
 */
function tempDirSync(options = {}) {
  const {
    dir = os.tmpdir(),
    prefix = 'temp-dir-',
    cleanup = true
  } = options;

  const randomId = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now().toString(36);
  const dirName = `${prefix}${timestamp}-${randomId}`;
  const dirPath = path.join(dir, dirName);

  try {
    fs.mkdirSync(dirPath, { recursive: true });

    if (cleanup) {
      registerCleanup();
      tempFiles.add(dirPath);
    }

    return dirPath;
  } catch (error) {
    throw new Error(`Failed to create temporary directory: ${error.message}`);
  }
}

/**
 * Manually clean up a specific temporary file or directory
 * @param {string} filePath - Path to the file or directory to clean up
 * @returns {boolean} True if cleanup was successful
 */
function cleanupSync(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
    
    tempFiles.delete(filePath);
    return true;
  } catch (error) {
    console.warn(`Failed to cleanup ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Clean up all registered temporary files and directories
 * @returns {number} Number of items successfully cleaned up
 */
function cleanupAllSync() {
  let cleanedCount = 0;
  
  for (const filePath of tempFiles) {
    if (cleanupSync(filePath)) {
      cleanedCount++;
    }
  }
  
  tempFiles.clear();
  return cleanedCount;
}

/**
 * Get list of all registered temporary files
 * @returns {string[]} Array of temporary file paths
 */
function getTempFiles() {
  return Array.from(tempFiles);
}

/**
 * Copy an existing file to a temporary location
 * @param {string} sourcePath - Path to the source file
 * @param {string} extension - Extension for temp file
 * @param {Object} options - Configuration options
 * @returns {string} Path to the temporary copy
 */
function tempCopySync(sourcePath, extension = '', options = {}) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file does not exist: ${sourcePath}`);
  }

  const content = fs.readFileSync(sourcePath);
  
  // Use original extension if none provided
  if (!extension) {
    extension = path.extname(sourcePath);
  }

  return tempWriteSync(content, extension, options);
}

/**
 * Register cleanup handlers for process exit
 */
function registerCleanup() {
  if (cleanupRegistered) {
    return;
  }

  cleanupRegistered = true;

  // Clean up on normal exit
  process.on('exit', () => {
    cleanupAllSync();
  });

  // Clean up on SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    cleanupAllSync();
    process.exit(0);
  });

  // Clean up on SIGTERM
  process.on('SIGTERM', () => {
    cleanupAllSync();
    process.exit(0);
  });

  // Clean up on uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    cleanupAllSync();
    process.exit(1);
  });

  // Clean up on unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
    cleanupAllSync();
    process.exit(1);
  });
}

/**
 * Disable automatic cleanup for specific file
 * @param {string} filePath - Path to exclude from cleanup
 */
function excludeFromCleanup(filePath) {
  tempFiles.delete(filePath);
}

/**
 * Check if a path is managed by temp-write-sync
 * @param {string} filePath - Path to check
 * @returns {boolean} True if path is managed
 */
function isTempFile(filePath) {
  return tempFiles.has(filePath);
}

/**
 * Write content to a temporary file with a specific name pattern
 * @param {string|Buffer} content - Content to write
 * @param {string} pattern - Filename pattern with {random} placeholder
 * @param {Object} options - Configuration options
 * @returns {string} Path to the created file
 */
function tempWritePatternSync(content, pattern, options = {}) {
  const { dir = os.tmpdir(), cleanup = true } = options;
  
  const randomId = crypto.randomBytes(6).toString('hex');
  const timestamp = Date.now().toString(36);
  
  const filename = pattern
    .replace('{random}', randomId)
    .replace('{timestamp}', timestamp)
    .replace('{time}', timestamp);
    
  const filePath = path.join(dir, filename);

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content);

    if (cleanup) {
      registerCleanup();
      tempFiles.add(filePath);
    }

    return filePath;
  } catch (error) {
    throw new Error(`Failed to write temporary file: ${error.message}`);
  }
}

// Export main function and utilities
module.exports = tempWriteSync;
module.exports.tempWriteSync = tempWriteSync;
module.exports.tempWriteJsonSync = tempWriteJsonSync;
module.exports.tempWriteCsvSync = tempWriteCsvSync;
module.exports.tempDirSync = tempDirSync;
module.exports.tempCopySync = tempCopySync;
module.exports.tempWritePatternSync = tempWritePatternSync;
module.exports.cleanupSync = cleanupSync;
module.exports.cleanupAllSync = cleanupAllSync;
module.exports.getTempFiles = getTempFiles;
module.exports.excludeFromCleanup = excludeFromCleanup;
module.exports.isTempFile = isTempFile;