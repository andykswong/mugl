/** @type {import('jest').Config} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  extensionsToTreatAsEsm: [
    '.ts'
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testEnvironment: 'node',
  testMatch: [
    '**/src/**/__tests__/*.spec.ts'
  ],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        'rootMode': 'upward'
      }
    ]
  }
};
