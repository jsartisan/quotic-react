module.exports = {
  parser: 'babel-eslint',
  "extends": "airbnb",
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      "react/jsx-filename-extension":  [1, { "extensions": [".js", ".jsx"] }],
      'react/prefer-stateless-function': 'off',
      "react/prop-types": 'off',
      'jsx-a11y/anchor-is-valid': [
        'error',
        {
          components: ['Link'],
          specialLink: ['to'],
          aspects: ['noHref', 'invalidHref', 'preferButton'],
        },
      ],
      'global-require': 'off',
  }
};
