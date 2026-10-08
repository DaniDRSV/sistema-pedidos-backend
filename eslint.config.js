const nodeGlobals = {
  require: 'readonly',
  module: 'writable',
  process: 'readonly',
  console: 'readonly',
  __dirname: 'readonly',
  Buffer: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly'
};

module.exports = [
  {
    ignores: ['node_modules/**']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { args: 'none' }],
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-dupe-class-members': 'error',
      'no-const-assign': 'error',
      'no-redeclare': 'error',
      'eqeqeq': ['error', 'smart']
    }
  }
];
