#  React + TypeScript + Vite

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

A minimal, fast starter template for building React apps with TypeScript and Vite — featuring Hot Module Replacement (HMR) and opinionated ESLint rules out of the box.

---

##  Getting Started

```bash
npm install
npm run dev
```

---

##  Official Plugins

Choose one of the two official Vite React plugins:

| Plugin | Transformer | Notes |
|---|---|---|
| [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) | Babel / oxc (rolldown-vite) | Default, broad compatibility |
| [`@vitejs/plugin-react-swc`](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) | SWC | Faster builds |

---

##  React Compiler

> **Note:** The React Compiler is **not enabled** in this template due to its impact on dev and build performance.

To opt in, follow the [React Compiler installation guide](https://react.dev/learn/react-compiler/installation).

---

##  ESLint Configuration

### Recommended: Type-Aware Lint Rules

For production apps, upgrade to type-checked rules in `eslint.config.js`:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Replace tseslint.configs.recommended with one of:
      tseslint.configs.recommendedTypeChecked,   // recommended
      tseslint.configs.strictTypeChecked,        // stricter
      tseslint.configs.stylisticTypeChecked,     // + style rules (optional)
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

### Optional: React-Specific Lint Rules

Install and configure [`eslint-plugin-react-x`](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [`eslint-plugin-react-dom`](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for deeper React linting:

```bash
npm install -D eslint-plugin-react-x eslint-plugin-react-dom
```

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

##  License

MIT
