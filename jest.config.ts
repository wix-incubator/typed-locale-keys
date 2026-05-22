import type { Config } from 'jest';

const jestConfig: Config = {
  testEnvironment: 'jsdom',
  testTimeout: 10000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: { warnOnly: true },
      },
    ],
  },
};

// eslint-disable-next-line import/no-default-export
export default jestConfig;
