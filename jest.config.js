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
  reporters: [['github-actions', { silent: false }], 'summary'],
};
