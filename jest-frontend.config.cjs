module.exports = {
    displayName: "frontend",
    testEnvironment: "jest-environment-jsdom",
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    moduleNameMapper: {
      "\\.(css|scss)$": "identity-obj-proxy"
    },
    transformIgnorePatterns: [
      "/node_modules/(?!(styleMock\\.js)$)"
    ],
    testMatch: [
      "<rootDir>/client/**/*.test.js"
    ],
    globals: {
      'jest': {
        'useESM': true  // To enforce module handling for the frontend
      }
    }
  };
  