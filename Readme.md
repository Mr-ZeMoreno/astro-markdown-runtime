# Astro Markdown Runtime

[![npm version](https://img.shields.io/npm/v/%40ze-moreno%2Fastro-markdown-runtime)](https://www.npmjs.com/package/@ze-moreno/astro-markdown-runtime)
[![npm downloads](https://img.shields.io/npm/dm/%40ze-moreno%2Fastro-markdown-runtime)](https://www.npmjs.com/package/@ze-moreno/astro-markdown-runtime)
[![Astro](https://img.shields.io/badge/Astro-5.18%2B-BC52EE)](https://astro.build)
[![ISC License](https://img.shields.io/badge/license-ISC-8cf2b0)](./License.md)
[![CI](https://github.com/Mr-ZeMoreno/astro-markdown-runtime/actions/workflows/ci.yml/badge.svg)](https://github.com/Mr-ZeMoreno/astro-markdown-runtime/actions/workflows/ci.yml)

Render Markdown strings in Astro and map Markdown directives to explicitly registered Astro components.

Use it when your Markdown comes from an API, database, headless CMS, or another dynamic source and is not available as a local `.md` or `.mdx` file during compilation.

```md
:::alert{type="warning"}
Your subscription expires soon.
:::
```

```astro
<Alert type="warning">
  <p>Your subscription expires soon.</p>
</Alert>
```

No MDX compilation or Astro integration configuration is required.

## Features

- Render Markdown strings from dynamic or remote sources
- Use Astro components through Markdown directives
- Register only the components your content needs
- Forward directive attributes as component props
- Render nested Markdown inside component slots
- Support text, leaf, and container directives
- Parse content through a custom mdast → hast → Astro node pipeline
- Use the same renderer in prerendered and on-demand routes

## Requirements

- Astro `5.18.1` or later within the Astro 5 release line
- An ESM-based Astro project

## Installation

```bash
npm install @ze-moreno/astro-markdown-runtime
```

Other package managers:

```bash
pnpm add @ze-moreno/astro-markdown-runtime
```

```bash
yarn add @ze-moreno/astro-markdown-runtime
```

```bash
bun add @ze-moreno/astro-markdown-runtime
```

## Quick start

### 1. Create an Astro component

```astro
---
// src/components/Alert.astro

interface Props {
  type?: "info" | "warning" | "error";
  title?: string;
}

const {
  type = "info",
  title,
} = Astro.props;
---

<aside class="alert" data-type={type}>
  {title && <strong>{title}</strong>}
  <slot />
</aside>
```

### 2. Register and render the component

```astro
---
import {
  Renderer,
  type ComponentRecord,
} from "@ze-moreno/astro-markdown-runtime";

import Alert from "../components/Alert.astro";

const components = {
  Alert,
} satisfies ComponentRecord;

const markdown = `
# Account status

:::alert{type="warning" title="Action required"}
Update your billing information before Friday.
:::
`;
---

<Renderer text={markdown} components={components} />
```

The directive is resolved to the registered `Alert` component, its attributes are passed as props, and its Markdown content is rendered inside the component slot.

Conceptually, the result is:

```astro
<h1>Account status</h1>

<Alert type="warning" title="Action required">
  <p>Update your billing information before Friday.</p>
</Alert>
```

## Directive syntax

The package supports the three directive forms defined by the directive Markdown extension.

### Text directives

Use a text directive for inline content:

```md
This feature is currently :badge[experimental]{tone="warning"}.
```

Register the corresponding component:

```astro
---
import Badge from "../components/Badge.astro";

const components = {
  Badge,
};
---
```

Conceptual output:

```astro
<p>
  This feature is currently
  <Badge tone="warning">experimental</Badge>.
</p>
```

### Leaf directives

Use a leaf directive for a component without child content:

```md
::divider{size="large"}
```

Conceptual output:

```astro
<Divider size="large" />
```

### Container directives

Use a container directive for block content:

```md
:::callout{variant="info" title="Before you continue"}
This content can contain **Markdown**, links, lists, and other supported
directives.
:::
```

Conceptual output:

```astro
<Callout variant="info" title="Before you continue">
  <p>
    This content can contain <strong>Markdown</strong>, links, lists, and
    other supported directives.
  </p>
</Callout>
```

Container directives use three colons for both the opening and closing markers.

## Component names

Directive names are converted to PascalCase before component lookup.

| Directive name | Component key |
| --- | --- |
| `alert` | `Alert` |
| `my-component` | `MyComponent` |
| `my_component` | `MyComponent` |
| `feature-card` | `FeatureCard` |

Register the component under its converted name:

```astro
---
import FeatureCard from "../components/FeatureCard.astro";

const components = {
  FeatureCard,
};
---

<Renderer
  text={`::feature-card{title="Runtime Markdown"}`}
  components={components}
/>
```

Lowercase kebab-case directive names are recommended.

The conversion lowercases the complete directive name before producing PascalCase. For example, `xml-parser` becomes `XmlParser`.

## Attributes and props

Directive attributes are forwarded to the resolved Astro component:

```md
:::alert{type="warning" title="Review required"}
Check the configuration.
:::
```

```astro
---
interface Props {
  type?: string;
  title?: string;
}

const { type, title } = Astro.props;
---
```

Attribute values are parsed from Markdown and forwarded by the rendering pipeline. They are not evaluated as JavaScript expressions.

For complex values, pass a string and parse or validate it inside the component:

```md
::chart{height="320" legend="true"}
```

```astro
---
const height = Number(Astro.props.height);
const showLegend = Astro.props.legend === "true";
---
```

## API

### `<Renderer />`

```astro
<Renderer text={markdown} components={components} />
```

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | `string` | Yes | Markdown source to parse and render |
| `components` | `ComponentRecord` | No | Astro components available to directives. Defaults to an empty object |

### `ComponentRecord`

```ts
import type { ComponentRecord } from "@ze-moreno/astro-markdown-runtime";
```

`ComponentRecord` is a record whose keys are resolved directive names and whose values are Astro component factories.

```ts
const components = {
  Alert,
  Badge,
  FeatureCard,
} satisfies ComponentRecord;
```

## Unregistered directives

Only names found in `components` are rendered as Astro components.

An unregistered directive currently falls back to a regular element using its PascalCase name. It does not throw an unknown-component error.

For example:

```md
::unknown-widget{value="123"}
```

without an `UnknownWidget` entry in `components` is treated as a normal element rather than an Astro component.

Register every directive that is expected to represent an Astro component:

```astro
const components = {
  UnknownWidget,
};
```

Do not rely on the component record as a complete validation or security boundary. Validate directive names separately when accepting untrusted content.

## How it works

The renderer uses the following pipeline:

```text
Markdown string
    ↓
remark-parse
    ↓
mdast
    ↓
directive transformation
    ↓
remark-rehype
    ↓
hast
    ↓
custom Astro node tree
    ↓
recursive Astro rendering
```

During directive transformation:

1. Text, leaf, and container directives are detected.
2. Their names are converted to PascalCase.
3. Their attributes are attached as element properties.
4. The resulting hast elements are matched against `components`.
5. Registered names become Astro components.
6. Other names remain regular elements.
7. The final tree is rendered recursively by Astro.

## What “runtime” means

The Markdown string is parsed when the Astro component renders. The package does not compile the content as an `.md` or `.mdx` source file.

The exact execution time depends on the Astro route:

- In a prerendered route, Markdown is processed during the build.
- In an on-demand route, Markdown is processed when the server renders the request.

The parser does not run in the browser, and the renderer does not add client-side JavaScript by itself.

Astro or framework components registered in `components` can still use the normal Astro hydration directives where applicable.

## Supported Markdown

The current pipeline supports the Markdown syntax handled by `remark-parse`, including common constructs such as:

- Headings
- Paragraphs
- Emphasis and strong emphasis
- Links and images
- Ordered and unordered lists
- Blockquotes
- Inline code and fenced code blocks
- Thematic breaks
- Text, leaf, and container directives

## Current limitations

The following features are not currently configured by the rendering pipeline:

- MDX imports, exports, JSX, or JavaScript expressions
- GitHub Flavored Markdown tables
- GitHub task lists
- GitHub strikethrough syntax
- GitHub autolink literals
- Footnotes
- Frontmatter metadata
- Raw HTML embedded in Markdown
- User-provided remark or rehype plugins
- Custom handling for unregistered directives
- A renderer-level error boundary

These limitations describe the current implementation and may change in future releases.

## Security

This package should not be treated as a Markdown sanitizer.

The current pipeline does not include an explicit sanitization stage. Although raw HTML is not enabled by the current `remark-rehype` configuration, Markdown can still supply URLs and directive attributes that are forwarded into rendered elements or Astro component props.

When rendering content from users, external APIs, or an untrusted CMS:

1. Validate or sanitize the Markdown before passing it to `Renderer`.
2. Restrict which directive names are accepted.
3. Register only components designed to receive external values.
4. Validate component props before using them.
5. Validate URLs and other sensitive attributes.
6. Apply content-size limits to avoid excessive parsing work.

Example component-side validation:

```astro
---
const allowedTypes = new Set(["info", "warning", "error"]);

const type = allowedTypes.has(Astro.props.type)
  ? Astro.props.type
  : "info";
---
```

## Error behavior

The renderer does not add a custom error boundary.

- Markdown parsing follows the behavior of the underlying remark parser.
- Unregistered directive names fall back to regular elements.
- Errors thrown while rendering a registered component propagate through Astro.
- Invalid component props must be handled by the component receiving them.

Applications that require strict content validation should validate the Markdown and directive names before rendering.

## When to use this package

Use Astro Markdown Runtime when:

- Markdown is fetched from an API or headless CMS.
- Markdown is stored in a database.
- Content can change independently of the Astro source code.
- You need a controlled mapping from Markdown directives to Astro components.
- You do not need MDX expressions or arbitrary imports.

Consider Astro's built-in Markdown support when the content is stored locally and available during the build.

Consider MDX when authors need to import components, use JSX-like syntax, or evaluate JavaScript expressions in content.

| Capability | Local Astro Markdown | MDX | Astro Markdown Runtime |
| --- | --- | --- | --- |
| Local `.md` files | Yes | No | Not required |
| Local `.mdx` files | No | Yes | Not required |
| Markdown provided as a string | Requires a separate parser | Requires compilation | Yes |
| Astro components in content | No | Yes | Through registered directives |
| JavaScript expressions in content | No | Yes | No |
| Explicit component registry | No | Through imports | Yes |
| Parsing during component rendering | No | No | Yes |

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history.

## Contributing

Bug reports, feature proposals, and pull requests are welcome.

Before submitting a change, run:

```bash
npm run check
npm run check:format
```

Open an issue when proposing behavior that changes directive parsing, component resolution, or the public API.

## License

Distributed under the [ISC License](./License.md).
