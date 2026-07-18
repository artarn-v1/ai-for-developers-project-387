export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', [
      'backend',
      'frontend',
      'api',
      'tests',
      'infra',
      'deps',
      'release',
      'main',
    ]],
    'scope-empty': [1, 'never'],
    'header-max-length': [2, 'always', 72],
  },
};
