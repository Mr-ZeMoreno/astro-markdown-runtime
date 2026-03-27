import type { AstroComponentFactory } from "astro/runtime/server/render/astro/factory.js";

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
