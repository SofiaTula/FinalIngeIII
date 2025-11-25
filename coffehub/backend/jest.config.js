export default {
  testEnvironment: "node",

  // Soporta ESM sin transformaciones
  transform: {},

  // Necesario para que Jest resuelva imports ESM
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1.js"
  },

  // Coverage
  coverageDirectory: "coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "server.js",
    "!node_modules/**",
    "!coverage/**",
    "!tests/**",
    "!jest.config.js"
  ],

  // Tests: unit, mocked, integration
  testMatch: [
    "**/tests/unit/**/*.test.js",
    "**/tests/unit-mocked/**/*.test.js",
    "**/tests/integration/**/*.test.js"
  ],

  // Setup
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Estabilidad
  verbose: true,
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,

  // Reporte JUnit para el pipeline
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./", outputName: "junit.xml" }]
  ]
};
