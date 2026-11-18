import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals", "next/typescript")];



// The local collector runs under Bun and is excluded from the Next build.
const eslintConfigWithIgnores = [...eslintConfig, { ignores: ["scripts/**"] }];

export default eslintConfigWithIgnores;
