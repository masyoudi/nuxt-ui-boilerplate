// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt(
  {
    features: {
      stylistic: {
        semi: true,
        commaDangle: 'never',
        braceStyle: '1tbs',
        arrowParens: true,
        quoteProps: 'as-needed'
      },
      tooling: true
    },
    dirs: {
      src: ['./app', './server', './utils', './config', './types']
    }
  },
  {
    ignores: ['node_modules', 'public', '.nuxt', '.output', '.vscode']
  }
)
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@/quotes': ['error', 'single'],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      'no-extra-boolean-cast': 'off',
      '@typescript-eslint/no-invalid-void-type': 'off'
    }
  })
  .override('nuxt/vue/rules', {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/block-order': ['error', { order: ['style', 'template', 'script'] }],
      'vue/component-tags-order': ['error', { order: ['style', 'template', 'script'] }],
      'vue/multi-word-component-names': ['off', { ignores: [] }],
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: false
        }
      ],
      'vue/no-v-html': 'off',
      'vue/valid-v-for': 'off',
      'vue/no-reserved-props': 'off'
    }
  });
