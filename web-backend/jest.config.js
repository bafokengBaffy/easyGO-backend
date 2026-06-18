module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  verbose: true,
  
  // Test patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
    '**/src/**/*.test.js'
  ],
  
  // Coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/config/**',
    '!node_modules/**'
  ],
  
  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0
    }
  },
  
  // Logging
  errorOnDeprecated: false,
  bail: 0,
  maxWorkers: '50%'
  ,
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml'
      }
    ]
  ]
};
