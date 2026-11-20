module.exports = {
  projects: [
    {
      displayName: 'app',
      preset: 'jest-expo',
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/modules/[^/]+/plugin/'],
    },
    {
      // Config plugins rodam no Node durante o prebuild, não no app.
      displayName: 'plugin',
      preset: 'jest-expo/node',
      testMatch: ['<rootDir>/modules/*/plugin/**/__tests__/**/*.test.ts'],
    },
  ],
};
