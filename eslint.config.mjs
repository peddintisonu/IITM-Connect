import js from "@eslint/js";
import globals from "globals";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
    // 1. Global Ignores
    {
        ignores: ["**/node_modules/**", "**/dist/**", "**/build/**", ".env"],
    },

    // 2. Base JS Config
    js.configs.recommended,
    {
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            "prettier/prettier": "error",
            "no-unused-vars": "warn",
            "no-console": "off",
        },
    },

    // 3. Client Specific (React + Browser)
    {
        files: ["client/**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
    },

    // 4. Server Specific (Node + TypeScript)
    {
        files: ["server/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": "warn",
            "no-unused-vars": "off", // turn off base rule, TS one handles it
        },
    },

    // 5. Prettier Last
    prettierConfig,
];
