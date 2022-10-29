export default {
  preset: 'ts-jest',
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['dist'],
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
}
