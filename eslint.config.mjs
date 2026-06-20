import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "dist/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...tailwindPlugin.configs["flat/recommended"],
  eslintConfigPrettier, // Prettier와 충돌하는 규칙 비활성화 - 반드시 마지막
];

export default eslintConfig;
