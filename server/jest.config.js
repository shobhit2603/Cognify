export default {
  testEnvironment: "node",
  testTimeout: 30000,
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.js"],
  transform: {},
  moduleNameMapper: {
    "^@langchain/classic/document_loaders/fs/buffer$": "<rootDir>/node_modules/@langchain/classic/dist/document_loaders/fs/buffer.cjs",
    "^@langchain/classic/agents$": "<rootDir>/node_modules/@langchain/classic/dist/agents/index.cjs"
  }
};
