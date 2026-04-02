// ... existing imports

export default [
  js.configs.recommended,
  solid,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        // The "Loot Drop" Globals:
        crypto: "readonly",           // For your UUIDs
        requestAnimationFrame: "readonly", // For the smooth 60fps game loop
        cancelAnimationFrame: "readonly",  // To stop the loop when paused
      },
    },
    rules: {
      "solid/no-destructure": "error", 
      "solid/self-closing-comp": "warn",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-undef": "error",
    },
  },
];