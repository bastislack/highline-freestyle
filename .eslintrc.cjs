module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-essential"
  ],
  overrides: [
    {
      env: {
        "node": true
      },
      files: [
        ".eslintrc.{js,cjs}"
      ],
      parserOptions: {
        "sourceType": "script"
      }
    }
  ],
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
    "vue"
  ],
  rules: {
    // argsIgnorePattern ist set to _ here. This is helpful especially when destructuring an Array
    // with const [_, bla] = ... it's more clear that bla is the second entry in the Array. If we would
    // have const [, bla] = ... instead there is the possibility to miss the Comma and assume that bla is
    // the first entry. 
    "@typescript-eslint/no-unused-vars": ["error", { "args": "after-used", "argsIgnorePattern": "^_" }],
    // vue/multi-word-component-names is disabled as it doesn't make much sense in our opinion.
    // "Navbar" for example is descriptive as-is and doesnt require another word.
    "vue/multi-word-component-names": "off"
  }
}
