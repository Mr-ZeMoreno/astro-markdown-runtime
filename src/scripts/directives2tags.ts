import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { directiveFromMarkdown } from "mdast-util-directive";
import { directive } from "micromark-extension-directive";
import { toPascalCase } from "./utilities";
import type { Parent, Data } from "unist";
import type { Properties } from "hast";

declare module "unist" {
  interface Data {
    hName?: string;
    hProperties?: Properties;
  }
}

interface DirectiveNode extends Parent {
  type: "containerDirective" | "leafDirective" | "textDirective";
  name: string;
  attributes?: Record<string, any>;
  data?: Data;
}

function isDirectiveNode(node: any): node is DirectiveNode {
  return (
    node.type === "containerDirective" ||
    node.type === "leafDirective" ||
    node.type === "textDirective"
  );
}

export const remarkDirectivesToTags: Plugin = function () {
  const self = this;
  const data = self.data();

  // 🔹 1. Habilita sintaxis de directives en el parser
  const micromarkExtensions =
    data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions =
    data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);

  micromarkExtensions.push(directive());
  fromMarkdownExtensions.push(directiveFromMarkdown());

  // 🔹 2. Transformer que corre después de parsear
  return (tree) => {
    visit(tree, isDirectiveNode, (node) => {
      const data = node.data || (node.data = {});

      // Convertimos :alert → <Alert />
      data.hName = toPascalCase(node.name);

      // Props del directive → props del componente
      data.hProperties = node.attributes || {};
    });
  };
};

export default remarkDirectivesToTags;
