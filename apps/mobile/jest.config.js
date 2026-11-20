module.exports = {
  projects: [
    {
      displayName: 'app',
      preset: 'jest-expo',
      // O pacote publica ESM (.mjs) para o bundler; o Jest usa a build CommonJS.
      moduleNameMapper: {
        '^lucide-react-native$': '<rootDir>/../../node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
      },
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
