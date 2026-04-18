import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt().overrideRules({
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
  '@typescript-eslint/unified-signatures': 'off',
  '@typescript-eslint/consistent-type-imports': ['error', {
    disallowTypeAnnotations: false,
    fixStyle: 'separate-type-imports',
    prefer: 'type-imports'
  }]
});
