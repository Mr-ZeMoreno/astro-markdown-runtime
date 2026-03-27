import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { AstroRootNode, ComponentRecord } from "./hast2astro";
import directives2tags from "./directives2tags";
import hast2astro from "./hast2astro";

export async function processMarkdown(
  markdown: string,
  components: ComponentRecord,
): Promise<AstroRootNode> {
  const processor = unified()
    .use(remarkParse) // markdown to mdast

    .use(directives2tags) // directives to tags (:example to <Example/>)

    .use(remarkRehype) // mdast to hast

    .use(hast2astro, components); // hast to self own tree

  const mdast = processor.parse(markdown);
  const astroast = (await processor.run(mdast)) as AstroRootNode;

  return astroast;
}
