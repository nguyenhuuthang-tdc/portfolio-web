import type { MDXComponents } from "mdx/types";
import { articleComponents } from "@/components/article/mdx-map";

export function useMDXComponents(): MDXComponents {
  return articleComponents;
}
