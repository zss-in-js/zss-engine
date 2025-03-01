module.exports = {
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  roots: ['<rootDir>/tests'],
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'html'],
  reporters: [['github-actions', { silent: false }], 'summary'],
};
