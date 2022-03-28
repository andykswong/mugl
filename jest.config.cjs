module.exports = {
  "collectCoverage": true,
  "collectCoverageFrom": [
    "js/**/*.ts"
  ],
  "coverageDirectory": "coverage",
  "extensionsToTreatAsEsm": [
    ".ts"
  ],
  "testEnvironment": "node",
  "testRegex": "js(/|/.*/)__tests__/.*\\.spec\\.ts$",
  "transformIgnorePatterns": [
    "/node_modules/"
  ]
};
