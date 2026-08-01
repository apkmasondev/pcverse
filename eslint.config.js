import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    // React Three Fiber intentionally mutates Three.js objects in frame callbacks.
    // These objects live outside React state, so the React immutability rule does
    // not model their lifecycle correctly. Keep every other hooks rule enabled.
    files: [
      'src/components/PCModel/**/*.tsx',
      'src/components/Scene3D/DeskScenery.tsx',
    ],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
])
