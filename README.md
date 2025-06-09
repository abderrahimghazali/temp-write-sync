# temp-write-sync

Write temporary files synchronously with automatic cleanup. Simple, fast, and reliable temporary file management for Node.js.

## Why temp-write-sync?

Unlike complex temporary file libraries, `temp-write-sync` focuses on simplicity:

- ✅ **Simple API**: One function call to create temp files
- ✅ **Synchronous**: No callbacks or promises to handle
- ✅ **Automatic cleanup**: Files removed on process exit
- ✅ **Cross-platform**: Works on Windows, macOS, and Linux
- ✅ **Zero dependencies**: Lightweight and fast
- ✅ **TypeScript support**: Full type definitions included

## Installation

```bash
npm install temp-write-sync
```

## Quick Start

```javascript
const tempWriteSync = require('temp-write-sync');

// Write text content
const filePath = tempWriteSync('Hello, world!', '.txt');
console.log(filePath); // /tmp/temp-abc123.txt

// Write binary content
const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
const binPath = tempWriteSync(buffer, '.bin');

// Automatic cleanup happens on process exit
```

## API Reference

### tempWriteSync(content, extension?, options?)

Write content to a temporary file synchronously.

**Parameters:**
- `content` (string | Buffer): Content to write to the file
- `extension` (string, optional): File extension (e.g., '.txt', '.json')
- `options` (object, optional): Configuration options

**Options:**
- `dir` (string): Custom temporary directory (default: `os.tmpdir()`)
- `prefix` (string): Filename prefix (default: 'temp-')
- `cleanup` (boolean): Enable automatic cleanup (default: true)
- `mode` (number): File permissions (default: 0o600)

**Returns:** string - Path to the created temporary file

```javascript
const tempWriteSync = require('temp-write-sync');

// Basic usage
const path = tempWriteSync('content', '.txt');

// With options
const path = tempWriteSync('content', '.txt', {
  dir: '/custom/temp',
  prefix: 'my-app-',
  cleanup: true,
  mode: 0o644
});
```

### tempWriteJsonSync(obj, options?)

Write JSON content to a temporary file.

```javascript
const { tempWriteJsonSync } = require('temp-write-sync');

const data = { name: 'John', age: 30 };
const jsonPath = tempWriteJsonSync(data);
// File contains: {"name": "John", "age": 30}
```

### tempWriteCsvSync(data, options?)

Write CSV content to a temporary file.

```javascript
const { tempWriteCsvSync } = require('temp-write-sync');

// Array of arrays
const data1 = [
  ['Name', 'Age'],
  ['John', 30],
  ['Jane', 25]
];
const csvPath1 = tempWriteCsvSync(data1);

// Array of objects
const data2 = [
  { name: 'John', age: 30 },
  { name: 'Jane', age: 25 }
];
const csvPath2 = tempWriteCsvSync(data2, { delimiter: ';' });
```

### tempDirSync(options?)

Create a temporary directory.

```javascript
const { tempDirSync } = require('temp-write-sync');

const dirPath = tempDirSync({
  prefix: 'my-temp-dir-',
  cleanup: true
});
```

### tempCopySync(sourcePath, extension?, options?)

Copy an existing file to a temporary location.

```javascript
const { tempCopySync } = require('temp-write-sync');

const tempPath = tempCopySync('/path/to/source.txt', '.txt');
// Creates a temporary copy of the source file
```

### tempWritePatternSync(content, pattern, options?)

Write content with a custom filename pattern.

```javascript
const { tempWritePatternSync } = require('temp-write-sync');

const path = tempWritePatternSync(
  'content',
  'data-{timestamp}-{random}.txt'
);
// Creates: data-abc123-def456.txt
```

## Cleanup Functions

### cleanupSync(filePath)

Manually clean up a specific temporary file.

```javascript
const { cleanupSync } = require('temp-write-sync');

const path = tempWriteSync('content');
cleanupSync(path); // File is immediately deleted
```

### cleanupAllSync()

Clean up all registered temporary files.

```javascript
const { cleanupAllSync } = require('temp-write-sync');

const count = cleanupAllSync();
console.log(`Cleaned up ${count} temporary files`);
```

### excludeFromCleanup(filePath)

Exclude a file from automatic cleanup.

```javascript
const { excludeFromCleanup } = require('temp-write-sync');

const path = tempWriteSync('important data');
excludeFromCleanup(path); // File will persist after process exit
```

## Utility Functions

### getTempFiles()

Get list of all managed temporary files.

```javascript
const { getTempFiles } = require('temp-write-sync');

const files = getTempFiles();
console.log('Temporary files:', files);
```

### isTempFile(filePath)

Check if a path is managed by temp-write-sync.

```javascript
const { isTempFile } = require('temp-write-sync');

const path = tempWriteSync('content');
console.log(isTempFile(path)); // true
console.log(isTempFile('/some/other/file')); // false
```

## Usage Examples

### Basic Text File

```javascript
const tempWriteSync = require('temp-write-sync');

const content = 'Hello, world!\nThis is a test file.';
const filePath = tempWriteSync(content, '.txt');

console.log(`Created temp file: ${filePath}`);
// Use the file...
// Automatic cleanup on process exit
```

### JSON Configuration

```javascript
const { tempWriteJsonSync } = require('temp-write-sync');

const config = {
  database: {
    host: 'localhost',
    port: 5432,
    name: 'testdb'
  },
  debug: true
};

const configPath = tempWriteJsonSync(config);
// Pass configPath to another process or function
```

### CSV Data Export

```javascript
const { tempWriteCsvSync } = require('temp-write-sync');

const salesData = [
  { product: 'Widget A', quantity: 100, price: 9.99 },
  { product: 'Widget B', quantity: 50, price: 19.99 },
  { product: 'Widget C', quantity: 75, price: 14.99 }
];

const csvPath = tempWriteCsvSync(salesData);
console.log(`CSV exported to: ${csvPath}`);
```

### Build Process

```javascript
const tempWriteSync = require('temp-write-sync');
const { execSync } = require('child_process');

// Create temporary input file
const inputPath = tempWriteSync(sourceCode, '.js');

// Process file with external tool
execSync(`uglifyjs ${inputPath} -o output.min.js`);

// File automatically cleaned up when process exits
```

### Test Data

```javascript
const { tempWriteSync, tempDirSync } = require('temp-write-sync');

function createTestData() {
  const testDir = tempDirSync({ prefix: 'test-' });
  
  const data1 = tempWriteSync('test data 1', '.txt', { dir: testDir });
  const data2 = tempWriteSync('test data 2', '.txt', { dir: testDir });
  
  return { testDir, files: [data1, data2] };
}

// All files cleaned up automatically
```

### Image Processing

```javascript
const { tempCopySync } = require('temp-write-sync');
const { execSync } = require('child_process');

function resizeImage(inputPath, outputPath) {
  // Create temporary copy for processing
  const tempPath = tempCopySync(inputPath, '.jpg');
  
  // Process with ImageMagick
  execSync(`convert ${tempPath} -resize 800x600 ${outputPath}`);
  
  // Temp file cleaned up automatically
}
```

### Configuration Templates

```javascript
const { tempWritePatternSync } = require('temp-write-sync');

function createConfigFromTemplate(template, variables) {
  let config = template;
  
  for (const [key, value] of Object.entries(variables)) {
    config = config.replace(`{{${key}}}`, value);
  }
  
  return tempWritePatternSync(
    config,
    'config-{timestamp}.ini'
  );
}
```

### Log File Processing

```javascript
const tempWriteSync = require('temp-write-sync');

function processLogs(logEntries) {
  // Create temporary log file
  const logContent = logEntries
    .map(entry => `${entry.timestamp} ${entry.level} ${entry.message}`)
    .join('\n');
    
  const logPath = tempWriteSync(logContent, '.log', {
    prefix: 'processed-log-'
  });
  
  return logPath;
}
```

### Manual Cleanup Example

```javascript
const { tempWriteSync, cleanupSync } = require('temp-write-sync');

function processWithManualCleanup() {
  const tempFiles = [];
  
  try {
    // Create temporary files
    tempFiles.push(tempWriteSync('data 1', '.txt'));
    tempFiles.push(tempWriteSync('data 2', '.txt'));
    
    // Process files...
    
  } catch (error) {
    console.error('Processing failed:', error);
  } finally {
    // Manual cleanup
    tempFiles.forEach(file => cleanupSync(file));
  }
}
```

## Error Handling

```javascript
const tempWriteSync = require('temp-write-sync');

try {
  const path = tempWriteSync('content', '.txt');
  console.log(`Created: ${path}`);
} catch (error) {
  console.error('Failed to create temp file:', error.message);
  // Possible errors:
  // - "Content cannot be null or undefined"
  // - "Extension must be a string"
  // - "Failed to write temporary file: ..."
}
```

## TypeScript Usage

```typescript
import tempWriteSync, { 
  TempWriteOptions, 
  tempWriteJsonSync,
  cleanupAllSync 
} from 'temp-write-sync';

const options: TempWriteOptions = {
  dir: '/custom/temp',
  prefix: 'app-',
  cleanup: true
};

const filePath: string = tempWriteSync('content', '.txt', options);

const jsonPath: string = tempWriteJsonSync({ key: 'value' });

const cleanedCount: number = cleanupAllSync();
```

## Platform Support

- ✅ **Windows**: Full support with proper path handling
- ✅ **macOS**: Full support using system temp directory
- ✅ **Linux**: Full support with standard temp directories
- ✅ **Docker**: Works in containerized environments

## Performance

- **Fast**: Synchronous operations with minimal overhead
- **Memory efficient**: No file caching or buffering
- **Small footprint**: Zero dependencies, ~200 lines of code
- **Scalable**: Handles thousands of temp files efficiently

## Security

- **Safe permissions**: Files created with mode 0o600 (owner read/write only)
- **Unique names**: Cryptographically random filenames prevent collisions
- **Automatic cleanup**: No temp files left behind
- **Input validation**: Prevents path traversal and injection attacks

## Comparison with Alternatives

| Feature | temp-write-sync | tmp | temp-fs | os.tmpdir |
|---------|----------------|-----|---------|-----------|
| Sync API | ✅ | ✅ | ❌ | ✅ |
| Auto cleanup | ✅ | ✅ | ✅ | ❌ |
| Simple API | ✅ | ❌ | ❌ | ✅ |
| Zero deps | ✅ | ❌ | ❌ | ✅ |
| JSON/CSV helpers | ✅ | ❌ | ❌ | ❌ |


## Contributing

Pull requests welcome! Please ensure tests pass:

```bash
npm test
```