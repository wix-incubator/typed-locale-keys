import { InitialOptionsTsJest } from 'ts-jest/dist/types';

const jestConfig: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    'ts-jest': {
      diagnostics: {
        warnOnly: true
      }
    }
  }
};

// eslint-disable-next-line import/no-default-export
export default jestConfig;
