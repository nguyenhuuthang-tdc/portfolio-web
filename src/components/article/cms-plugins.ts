import type { PluggableList } from "unified";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

const schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "div", "span"],
  attributes: {
    ...defaultSchema.attributes,
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "width",
      "height",
      "className",
      "class",
      "dataAlign",
      ["data-align"],
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      "className",
      "class",
      "dataAlign",
      ["data-align"],
    ],
  },
};

export const cmsRemarkPlugins: PluggableList = [remarkGfm];

export const cmsRehypePlugins: PluggableList = [
  rehypeRaw,
  [rehypeSanitize, schema],
];
