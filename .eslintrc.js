module.exports = {
  extends: ['./node_modules/@tkvlnk/configs/eslint/react.js'],
  parserOptions: {
    ecmaVersion: 11,
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/no-explicit-any': [2],
    'import/prefer-default-export': 0,
    'import/no-default-export': 1
  }
};