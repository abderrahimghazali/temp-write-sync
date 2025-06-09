module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'index.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testMatch: [
    '**/test/**/*.test.js'
  ],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/test/setup.js']
};