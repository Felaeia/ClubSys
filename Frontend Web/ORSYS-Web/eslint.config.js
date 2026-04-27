import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']), // Remove 'functions' from here so we can lint it!
  
  // --- FRONTEND CONFIG (React) ---
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // --- BACKEND CONFIG (Firebase Functions) ---
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs', // This tells ESLint to expect 'require'
      globals: {
        ...globals.node, // This defines 'module', 'require', and 'exports'
      },
    },
    rules: {
      'no-undef': 'error',
    },
  }
])