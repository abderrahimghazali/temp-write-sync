const fs = require('fs');
const path = require('path');
const os = require('os');
const tempWriteSync = require('../index');
const {
  tempWriteJsonSync,
  tempWriteCsvSync,
  tempDirSync,
  tempCopySync,
  tempWritePatternSync,
  cleanupSync,
  cleanupAllSync,
  getTempFiles,
  excludeFromCleanup,
  isTempFile
} = require('../index');

describe('temp-write-sync', () => {
  let createdFiles = [];

  beforeEach(() => {
    createdFiles = [];
  });

  afterEach(() => {
    // Clean up any files created during tests
    createdFiles.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    });
    
    // Clean up any temp files created by the module
    cleanupAllSync();
  });

  describe('basic functionality', () => {
    test('should create temporary file with content', () => {
      const content = 'Hello, world!';
      const filePath = tempWriteSync(content, '.txt');
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
      expect(filePath.endsWith('.txt')).toBe(true);
    });

    test('should create file without extension', () => {
      const content = 'test content';
      const filePath = tempWriteSync(content);
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    });

    test('should handle Buffer content', () => {
      const buffer = Buffer.from('binary content', 'utf8');
      const filePath = tempWriteSync(buffer, '.bin');
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(Buffer.compare(fs.readFileSync(filePath), buffer)).toBe(0);
    });

    test('should auto-add dot to extension', () => {
      const filePath = tempWriteSync('content', 'txt');
      
      createdFiles.push(filePath);
      
      expect(filePath.endsWith('.txt')).toBe(true);
    });

    test('should register file for cleanup by default', () => {
      const filePath = tempWriteSync('content', '.txt');
      
      createdFiles.push(filePath);
      
      expect(isTempFile(filePath)).toBe(true);
      expect(getTempFiles()).toContain(filePath);
    });
  });

  describe('options', () => {
    test('should use custom directory', () => {
      const customDir = path.join(os.tmpdir(), 'custom-temp-test');
      const filePath = tempWriteSync('content', '.txt', { dir: customDir });
      
      createdFiles.push(filePath, customDir);
      
      expect(filePath.startsWith(customDir)).toBe(true);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    test('should use custom prefix', () => {
      const filePath = tempWriteSync('content', '.txt', { prefix: 'custom-' });
      
      createdFiles.push(filePath);
      
      const fileName = path.basename(filePath);
      expect(fileName.startsWith('custom-')).toBe(true);
    });

    test('should skip cleanup when disabled', () => {
      const filePath = tempWriteSync('content', '.txt', { cleanup: false });
      
      createdFiles.push(filePath);
      
      expect(isTempFile(filePath)).toBe(false);
      expect(getTempFiles()).not.toContain(filePath);
    });

    test('should set file permissions', () => {
      const filePath = tempWriteSync('content', '.txt', { mode: 0o644 });
      
      createdFiles.push(filePath);
      
      const stats = fs.statSync(filePath);
      // Check that file is readable (exact permissions may vary by system)
      expect(stats.mode & 0o400).toBeTruthy();
    });
  });

  describe('error handling', () => {
    test('should throw error for null content', () => {
      expect(() => tempWriteSync(null, '.txt')).toThrow('Content cannot be null or undefined');
    });

    test('should throw error for undefined content', () => {
      expect(() => tempWriteSync(undefined, '.txt')).toThrow('Content cannot be null or undefined');
    });

    test('should throw error for non-string extension', () => {
      expect(() => tempWriteSync('content', 123)).toThrow('Extension must be a string');
    });

    test('should handle write errors gracefully', () => {
      // Try to write to an invalid directory
      expect(() => {
        tempWriteSync('content', '.txt', { dir: '/invalid/path/that/does/not/exist' });
      }).toThrow('Failed to write temporary file');
    });
  });

  describe('tempWriteJsonSync', () => {
    test('should create JSON file from object', () => {
      const obj = { name: 'John', age: 30, active: true };
      const filePath = tempWriteJsonSync(obj);
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(filePath.endsWith('.json')).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(obj);
    });

    test('should format JSON with proper indentation', () => {
      const obj = { key: 'value' };
      const filePath = tempWriteJsonSync(obj);
      
      createdFiles.push(filePath);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('  '); // Should have indentation
    });

    test('should throw error for invalid input', () => {
      expect(() => tempWriteJsonSync(null)).toThrow('Input must be a valid object');
      expect(() => tempWriteJsonSync('string')).toThrow('Input must be a valid object');
    });
  });

  describe('tempWriteCsvSync', () => {
    test('should create CSV from array of arrays', () => {
      const data = [
        ['Name', 'Age'],
        ['John', 30],
        ['Jane', 25]
      ];
      const filePath = tempWriteCsvSync(data);
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(filePath.endsWith('.csv')).toBe(true);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toBe('"Name","Age"\n"John","30"\n"Jane","25"');
    });

    test('should create CSV from array of objects', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      const filePath = tempWriteCsvSync(data);
      
      createdFiles.push(filePath);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('"name","age"');
      expect(content).toContain('"John","30"');
    });

    test('should use custom delimiter', () => {
      const data = [['A', 'B'], ['1', '2']];
      const filePath = tempWriteCsvSync(data, { delimiter: ';' });
      
      createdFiles.push(filePath);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toBe('"A";"B"\n"1";"2"');
    });

    test('should handle empty array', () => {
      const filePath = tempWriteCsvSync([]);
      
      createdFiles.push(filePath);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toBe('');
    });

    test('should escape quotes in CSV data', () => {
      const data = [['Quote: "Hello"', 'Normal']];
      const filePath = tempWriteCsvSync(data);
      
      createdFiles.push(filePath);
      
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('""Hello""');
    });

    test('should throw error for invalid input', () => {
      expect(() => tempWriteCsvSync('not an array')).toThrow('CSV data must be an array');
      expect(() => tempWriteCsvSync(['invalid item'])).toThrow('Invalid CSV data format');
    });
  });

  describe('tempDirSync', () => {
    test('should create temporary directory', () => {
      const dirPath = tempDirSync();
      
      createdFiles.push(dirPath);
      
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    test('should use custom options', () => {
      const dirPath = tempDirSync({ prefix: 'test-dir-' });
      
      createdFiles.push(dirPath);
      
      const dirName = path.basename(dirPath);
      expect(dirName.startsWith('test-dir-')).toBe(true);
    });
  });

  describe('tempCopySync', () => {
    test('should copy existing file to temp location', () => {
      // Create a source file first
      const sourceContent = 'Source file content';
      const sourcePath = path.join(os.tmpdir(), 'source-test.txt');
      fs.writeFileSync(sourcePath, sourceContent);
      createdFiles.push(sourcePath);
      
      const tempPath = tempCopySync(sourcePath, '.txt');
      createdFiles.push(tempPath);
      
      expect(fs.existsSync(tempPath)).toBe(true);
      expect(fs.readFileSync(tempPath, 'utf8')).toBe(sourceContent);
      expect(tempPath.endsWith('.txt')).toBe(true);
      expect(tempPath).not.toBe(sourcePath);
    });

    test('should use original extension when none provided', () => {
      const sourcePath = path.join(os.tmpdir(), 'source-test.md');
      fs.writeFileSync(sourcePath, 'content');
      createdFiles.push(sourcePath);
      
      const tempPath = tempCopySync(sourcePath);
      createdFiles.push(tempPath);
      
      expect(tempPath.endsWith('.md')).toBe(true);
    });

    test('should throw error for non-existent source', () => {
      expect(() => tempCopySync('/non/existent/file.txt'))
        .toThrow('Source file does not exist');
    });
  });

  describe('tempWritePatternSync', () => {
    test('should create file with custom pattern', () => {
      const filePath = tempWritePatternSync('content', 'data-{random}.txt');
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(path.basename(filePath)).toMatch(/^data-.+\.txt$/);
    });

    test('should replace multiple placeholders', () => {
      const filePath = tempWritePatternSync('content', '{timestamp}-{random}-file.txt');
      
      createdFiles.push(filePath);
      
      const fileName = path.basename(filePath);
      expect(fileName).toMatch(/^\w+-\w+-file\.txt$/);
    });
  });

  describe('cleanup functions', () => {
    test('cleanupSync should remove specific file', () => {
      const filePath = tempWriteSync('content', '.txt');
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(isTempFile(filePath)).toBe(true);
      
      const result = cleanupSync(filePath);
      
      expect(result).toBe(true);
      expect(fs.existsSync(filePath)).toBe(false);
      expect(isTempFile(filePath)).toBe(false);
    });

    test('cleanupAllSync should remove all tracked files', () => {
      const file1 = tempWriteSync('content1', '.txt');
      const file2 = tempWriteSync('content2', '.txt');
      
      expect(getTempFiles()).toContain(file1);
      expect(getTempFiles()).toContain(file2);
      
      const count = cleanupAllSync();
      
      expect(count).toBe(2);
      expect(fs.existsSync(file1)).toBe(false);
      expect(fs.existsSync(file2)).toBe(false);
      expect(getTempFiles()).toHaveLength(0);
    });

    test('excludeFromCleanup should remove file from tracking', () => {
      const filePath = tempWriteSync('content', '.txt');
      
      createdFiles.push(filePath); // Add to manual cleanup
      
      expect(isTempFile(filePath)).toBe(true);
      
      excludeFromCleanup(filePath);
      
      expect(isTempFile(filePath)).toBe(false);
      expect(getTempFiles()).not.toContain(filePath);
    });

    test('cleanupSync should handle non-existent files gracefully', () => {
      const result = cleanupSync('/non/existent/file.txt');
      expect(result).toBe(true); // Should not throw, should return true
    });
  });

  describe('utility functions', () => {
    test('getTempFiles should return array of tracked files', () => {
      const file1 = tempWriteSync('content1', '.txt');
      const file2 = tempWriteSync('content2', '.txt');
      
      createdFiles.push(file1, file2);
      
      const files = getTempFiles();
      expect(Array.isArray(files)).toBe(true);
      expect(files).toContain(file1);
      expect(files).toContain(file2);
    });

    test('isTempFile should correctly identify tracked files', () => {
      const tempFile = tempWriteSync('content', '.txt');
      const normalFile = path.join(os.tmpdir(), 'normal-file.txt');
      
      createdFiles.push(tempFile);
      
      expect(isTempFile(tempFile)).toBe(true);
      expect(isTempFile(normalFile)).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle empty string content', () => {
      const filePath = tempWriteSync('', '.txt');
      
      createdFiles.push(filePath);
      
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe('');
    });

    test('should handle very long content', () => {
      const longContent = 'x'.repeat(10000);
      const filePath = tempWriteSync(longContent, '.txt');
      
      createdFiles.push(filePath);
      
      expect(fs.readFileSync(filePath, 'utf8')).toBe(longContent);
    });

    test('should handle special characters in content', () => {
      const specialContent = '🚀 Hello 世界 \n\t\r special chars! @#$%^&*()';
      const filePath = tempWriteSync(specialContent, '.txt');
      
      createdFiles.push(filePath);
      
      expect(fs.readFileSync(filePath, 'utf8')).toBe(specialContent);
    });

    test('should handle multiple cleanup calls safely', () => {
      const filePath = tempWriteSync('content', '.txt');
      
      cleanupSync(filePath);
      cleanupSync(filePath); // Second cleanup should not throw
      
      expect(fs.existsSync(filePath)).toBe(false);
    });
  });
});