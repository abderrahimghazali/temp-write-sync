// Global test setup
beforeAll(() => {
  // Set up any global test configuration
});

afterAll(() => {
  // Global cleanup
  const {cleanupAllSync} = require('../index');
  cleanupAllSync();
});

// examples/basic-usage.js
const tempWriteSync = require('../index');

console.log('=== Basic temp-write-sync Examples ===\n');

// Example 1: Simple text file
console.log('1. Creating a simple text file:');
const textPath = tempWriteSync('Hello, World!', '.txt');
console.log(`Created: ${textPath}`);
console.log(`Content: ${require('fs').readFileSync(textPath, 'utf8')}`);
console.log();

// Example 2: Binary data
console.log('2. Writing binary data:');
const binaryData = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
const binaryPath = tempWriteSync(binaryData, '.bin');
console.log(`Created binary file: ${binaryPath}`);
console.log();

// Example 3: JSON data
console.log('3. Writing JSON data:');
const {tempWriteJsonSync} = require('../index');
const jsonData = {
  name: 'John Doe',
  age: 30,
  skills: ['JavaScript', 'Node.js', 'React']
};
const jsonPath = tempWriteJsonSync(jsonData);
console.log(`Created JSON file: ${jsonPath}`);
console.log();

// Example 4: CSV data
console.log('4. Writing CSV data:');
const {tempWriteCsvSync} = require('../index');
const csvData = [
  {name: 'Alice', score: 95},
  {name: 'Bob', score: 87},
  {name: 'Charlie', score: 92}
];
const csvPath = tempWriteCsvSync(csvData);
console.log(`Created CSV file: ${csvPath}`);
console.log();

// Example 5: Custom options
console.log('5. Using custom options:');
const customPath = tempWriteSync('Custom content', '.txt', {
  prefix: 'my-app-',
  dir: require('os').tmpdir()
});
console.log(`Created with custom prefix: ${customPath}`);
console.log();

// Example 6: Check tracked files
console.log('6. Currently tracked temp files:');
const {getTempFiles} = require('../index');
console.log(getTempFiles());
console.log();

console.log('All files will be automatically cleaned up when the process exits.');

// examples/advanced-usage.js
const {
  tempDirSync,
  tempCopySync,
  tempWritePatternSync,
  cleanupSync,
  excludeFromCleanup
} = require('../index');
const fs = require('fs');
const path = require('path');

console.log('=== Advanced temp-write-sync Examples ===\n');

// Example 1: Temporary directory
console.log('1. Creating temporary directory:');
const tempDir = tempDirSync({prefix: 'work-dir-'});
console.log(`Created temp directory: ${tempDir}`);

// Create files in the temp directory
const file1 = tempWriteSync('File 1 content', '.txt', {dir: tempDir, cleanup: false});
const file2 = tempWriteSync('File 2 content', '.txt', {dir: tempDir, cleanup: false});
console.log(`Created files: ${path.basename(file1)}, ${path.basename(file2)}`);
console.log();

// Example 2: Copy existing file
console.log('2. Copying existing file:');
const sourceFile = path.join(__dirname, '../package.json');
if (fs.existsSync(sourceFile)) {
  const copiedFile = tempCopySync(sourceFile, '.json');
  console.log(`Copied ${sourceFile} to ${copiedFile}`);
} else {
  console.log('Source file not found, skipping copy example');
}
console.log();

// Example 3: Custom filename pattern
console.log('3. Custom filename pattern:');
const patternFile = tempWritePatternSync(
  'Generated content',
  'report-{timestamp}-{random}.txt'
);
console.log(`Created with pattern: ${path.basename(patternFile)}`);
console.log();

// Example 4: Manual cleanup
console.log('4. Manual cleanup example:');
const tempFile = tempWriteSync('Temporary data', '.tmp');
console.log(`Created: ${tempFile}`);
console.log(`File exists: ${fs.existsSync(tempFile)}`);

cleanupSync(tempFile);
console.log(`After cleanup, file exists: ${fs.existsSync(tempFile)}`);
console.log();

// Example 5: Exclude from automatic cleanup
console.log('5. Excluding file from cleanup:');
const persistentFile = tempWriteSync('This will persist', '.txt');
excludeFromCleanup(persistentFile);
console.log(`Created persistent file: ${persistentFile}`);
console.log('This file will NOT be cleaned up automatically');
console.log();

// Example 6: Build process simulation
console.log('6. Build process simulation:');

function simulateBuild() {
  // Create source files
  const srcDir = tempDirSync({prefix: 'build-src-'});
  const sourceFile = tempWriteSync('console.log("Hello, World!");', '.js', {
    dir: srcDir,
    cleanup: false
  });

  // Create output directory
  const outDir = tempDirSync({prefix: 'build-out-'});

  // Simulate build process
  const sourceContent = fs.readFileSync(sourceFile, 'utf8');
  const minifiedContent = sourceContent.replace(/\s+/g, ' ').trim();

  const outputFile = tempWriteSync(minifiedContent, '.min.js', {
    dir: outDir,
    cleanup: false
  });

  console.log(`Build process:`);
  console.log(`  Source: ${sourceFile}`);
  console.log(`  Output: ${outputFile}`);
  console.log(`  Original: ${sourceContent.length} chars`);
  console.log(`  Minified: ${minifiedContent.length} chars`);
}

simulateBuild();
console.log();

console.log('Note: Some files excluded from cleanup will remain after exit.');