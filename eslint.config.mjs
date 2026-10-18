import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
export default [{
  files: ["**/*.{ts,tsx}"],
  ignores: [".next/**", "node_modules/**"],
  languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } } },
  plugins: { "@next/next": nextPlugin },
  rules: { ...nextPlugin.configs.recommended.rules, ...nextPlugin.configs["core-web-vitals"].rules, "no-unreachable": "error", "no-constant-binary-expression": "error" }
}];
