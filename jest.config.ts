import { InitialOptionsTsJest } from 'ts-jest/dist/types';

const jestConfig: InitialOptionsTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
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
