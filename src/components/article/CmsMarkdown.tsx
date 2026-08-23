import Markdown from "react-markdown";
import { markdownComponents } from "@/components/article/mdx-map";
import { cmsRehypePlugins, cmsRemarkPlugins } from "@/components/article/cms-plugins";

export function CmsMarkdown({ children }: { children: string }) {
  return (
    <div className="max-w-none">
      <Markdown
        remarkPlugins={cmsRemarkPlugins}
        rehypePlugins={cmsRehypePlugins}
        components={markdownComponents}
      >
        {children}
      </Markdown>
    </div>
  );
}
