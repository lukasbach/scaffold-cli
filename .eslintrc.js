module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "airbnb",
    "airbnb-typescript",
    "prettier",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json'
  },
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "import/prefer-default-export": "off",
    "no-console": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-continue": "off",
    "no-await-in-loop": "off",
    "react/function-component-definition": "off",
    "react/jsx-props-no-spreading": "off",
    "no-nested-ternary": "off",
    "react/require-default-props": "off",
    "@typescript-eslint/ban-types": "off",
    "no-restricted-syntax": "off",
    "@typescript-eslint/no-shadow": "off",
    "no-plusplus": "off",
    "class-methods-use-this": "off"
  },
  ignorePatterns: ["lib", "*.js"],
};
