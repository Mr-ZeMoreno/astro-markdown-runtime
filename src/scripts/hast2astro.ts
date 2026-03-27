// types.ts
import type { AstroComponentFactory } from "astro/runtime/server/render/astro/factory.js";
import type { Plugin } from "unified";
import type { Root as HastRoot } from "hast";

export type ComponentRecord = Record<string, AstroComponentFactory>;

export type AstroTextNode = {
  type: "text";
  value: string;
};

export type AstroElementNode = {
  type: "element";
  tag: string;
  props: Record<string, any>;
  children: AstroNode[];
};

export type AstroComponentNode = {
  type: "component";
  Component: AstroComponentFactory;
  props: Record<string, any>;
  children: AstroNode[];
};

export type AstroRootNode = {
  type: "root";
  children: AstroNode[];
};

export type AstroNode =
  | AstroTextNode
  | AstroElementNode
  | AstroComponentNode
  | AstroRootNode;

const hast2astro: Plugin<[ComponentRecord], HastRoot, AstroRootNode> =
  function (components) {
    return (tree: HastRoot) => {
      return {
        type: "root",
        children: transformNode(tree, components),
      } as AstroRootNode;
    };
  };

function transformNode(node: any, components: ComponentRecord): AstroNode[] {
  if (!node) return [];

  if (node.type === "text") {
    return [
      {
        type: "text",
        value: node.value,
      },
    ];
  }

  if (node.type === "root") {
    return (
      node.children
        ?.flatMap((child: any) => transformNode(child, components))
        .filter(Boolean) || []
    );
  }

  if (node.type === "element") {
    const children =
      node.children
        ?.flatMap((child: any) => transformNode(child, components))
        .filter(Boolean) || [];

    const name = node.tagName;

    if (components[name]) {
      const Component = components[name];

      if (Component != null) {
        return [
          {
            type: "component",
            Component,
            props: node.properties || {},
            children,
          },
        ];
      }
    }

    return [
      {
        type: "element",
        tag: node.tagName,
        props: node.properties || {},
        children,
      },
    ];
  }

  return [];
}

export default hast2astro;
