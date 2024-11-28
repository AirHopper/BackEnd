import globals from "globals";
import pluginJs from "@eslint/js";

// setting magic number check

/** @type {import('eslint').Linter.Config[]} */
export default [
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
];