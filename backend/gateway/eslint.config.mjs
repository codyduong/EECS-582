import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettierConfig from "eslint-config-prettier";
import tsplugin from "@typescript-eslint/eslint-plugin";
// import reactHooks from "eslint-plugin-react-hooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    // "next/core-web-vitals",
    // "next/typescript",
    "plugin:prettier/recommended",
  ),
  {
    files: ["gateway.config.ts", "mesh.config.ts"],
    plugins: {
      // "react-hooks": reactHooks,
      "@typescript-eslint": tsplugin,
    },
    rules: {
      // ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  prettierConfig,
  {
    rules: {
      "prettier/prettier": "warn",
    },
  },
];

export default eslintConfig;
