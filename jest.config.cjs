module.exports = {
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/common/**/*.ts",
    "src/js/**/*.ts"
  ],
  "coverageDirectory": "coverage",
  "extensionsToTreatAsEsm": [
    ".ts"
  ],
  "testEnvironment": "node",
  "testRegex": "src(/|/.*/)__tests__/.*\\.spec\\.ts$",
  "transformIgnorePatterns": [
    "/node_modules/"
  ]
};
