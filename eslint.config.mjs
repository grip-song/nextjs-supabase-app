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
  {
    ...tailwindPlugin.configs.recommended,
    settings: {
      tailwindcss: {
        cssConfigPath: "./app/globals.css",
      },
    },
    rules: {
      ...tailwindPlugin.configs.recommended.rules,
      // Tailwind v4의 translate-[value]는 CSS translate 축약 속성이라 X축에만 적용된다.
      // 이 규칙은 translate-x-[]/translate-y-[]를 translate-[]로 잘못 병합해
      // 세로 이동이 사라지는 회귀를 유발하므로 비활성화한다.
      "tailwindcss/enforces-shorthand": "off",
    },
  },
  eslintConfigPrettier, // Prettier와 충돌하는 규칙 비활성화 - 반드시 마지막
];

export default eslintConfig;
