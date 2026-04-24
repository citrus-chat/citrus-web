import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";

export default tseslint.config(
  // 1. Ignorar carpetas generadas para no evaluarlas
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },

  // 2. Definir en qué archivos se aplicará ESLint
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
  },

  // 3. Entorno global del navegador (para 'window', 'document', etc.)
  {
    languageOptions: {
      globals: globals.browser,
    },
  },

  // 4. Cargar configuraciones recomendadas
  eslint.configs.recommended, // Recomendado para JS puro
  ...tseslint.configs.recommended, // Recomendado para TS puro
  ...pluginVue.configs["flat/recommended"], // Recomendado para Vue 3

  // 5. CONFIGURACIÓN CLAVE: Habilitar el Parser de TypeScript dentro de Vue
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser, // Permite leer TS en el bloque <script lang="ts">
        sourceType: "module",
      },
    },
  },

  // 6. Reglas personalizadas (Añade, apaga o edita las que necesites)
  {
    rules: {
      // Vue ya no obliga a usar nombres de más de una palabra en componentes
      "vue/multi-word-component-names": "off",

      // Ejemplo: Warn si dejas un console.log, pero sin romper el build
      "no-console": "warn",

      // Ejemplo: Desactivar una regla de TypeScript si te resulta muy estricta
      // '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
