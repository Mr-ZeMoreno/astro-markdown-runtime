# Astro Markdown Runtime

[![npm version](https://img.shields.io/npm/v/%40ze-moreno%2Fastro-markdown-runtime)](https://www.npmjs.com/package/@ze-moreno/astro-markdown-runtime)
[![npm downloads](https://img.shields.io/npm/dm/%40ze-moreno%2Fastro-markdown-runtime)](https://www.npmjs.com/package/@ze-moreno/astro-markdown-runtime)
[![Astro](https://img.shields.io/badge/Astro-compatible-BC52EE)](https://astro.build)
[![ISC License](https://img.shields.io/badge/license-ISC-8cf2b0)](./License.md)
[![CI](https://github.com/Mr-ZeMoreno/astro-markdown-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/Mr-ZeMoreno/astro-markdown-runtime/actions/workflows/ci.yml)

Render Markdown **at runtime** in Astro using a custom AST pipeline that turns Markdown directives into real Astro components.

Built for projects that need **dynamic Markdown rendering** without relying on build-time compilation.

---

## ✨ Features

* 🧩 Render Markdown inside Astro components at runtime
* 🔁 Convert custom Markdown directives into Astro components
* 🌳 Custom AST pipeline (mdast → hast → Astro AST)
* 🧱 Bring your own components
* ⚡ No MDX required

---

## 📦 Installation

```bash
npm install @ze-moreno/astro-markdown-runtime
```

---

## 🚀 Usage

```astro
---
import { Renderer } from "@ze-moreno/astro-markdown-runtime";
import MyComponent from "../components/MyComponent.astro";

const components = {
  MyComponent,
};

const markdown = `
# Hello

::my-component{title="Hola"}
Contenido dentro del componente
::
`;
---

<Renderer content={markdown} components={components} />
```

---

## 🧠 Directive → Component

Markdown:

```
::alert{type="warning"}
Be careful!
::
```

Becomes:

```astro
<Alert type="warning">Be careful!</Alert>
```

Component names are automatically converted to **PascalCase**.

---

## 📄 License

ISC

---

This README was created with AI assistance.
