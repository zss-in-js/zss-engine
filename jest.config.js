module.exports = {
  transform: {
    '^.+\\.ts?$': '@swc/jest',
  },
  roots: ['<rootDir>/tests'],
  testEnvironment: 'jsdom',
  coverageReporters: ['text', 'html'],
  reporters: [['github-actions', { silent: false }], 'summary'],
};
