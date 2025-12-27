module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^(\\..+)\\.js$': '$1',
  },
  roots: ['<rootDir>/tests'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'lcov', 'html'],
  reporters: [[process.env.CI ? 'github-actions' : 'default', { silent: false }], 'summary'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
