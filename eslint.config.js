const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    rules: {
      // Wyłącz błąd dla importów z @env
      'import/no-unresolved': [
        'error',
        { ignore: ['^@env$'] }
      ],
      // Allow require() for dynamic module loading
      'import/no-commonjs': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-var-requires': 'off',
    },
  },
]);
