module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: ["eslint:recommended"],
  plugins: ["security"],
  parserOptions: {
    ecmaVersion: 2022,
  },
  rules: {
    // Security rules
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-child-process": "warn",

    // General quality
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off", // server-side logging is acceptable
    "no-var": "error",
    "prefer-const": "warn",
    eqeqeq: ["error", "always"],
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
  },
};
