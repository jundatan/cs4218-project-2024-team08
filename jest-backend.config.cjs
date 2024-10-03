module.exports = {
    displayName: "backend",
    testEnvironment: "node",
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    testMatch: [
      "<rootDir>/**/*.test.js"
    ],
    testPathIgnorePatterns: [
      "<rootDir>/client/"
    ]
  };
  