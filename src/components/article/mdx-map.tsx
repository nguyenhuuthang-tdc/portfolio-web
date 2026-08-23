import type { MDXComponents } from "mdx/types";
import type { Components } from "react-markdown";
import type { ImgHTMLAttributes } from "react";
import { mediaUrl } from "@/lib/media";

type Align = "center" | "left" | "right" | "inline";

function readAlign(props: Record<string, unknown>): Align {
  const raw = props["data-align"] ?? props.dataAlign;
  if (raw === "left" || raw === "right" || raw === "inline" || raw === "center") return raw;
  return "center";
}

function sizeStyle(width?: string | number, height?: string | number) {
  const w = width === undefined || width === "" ? undefined : width;
  const h = height === undefined || height === "" ? "auto" : height;
  return {
    width: w ?? "100%",
    height: h,
    maxWidth: "100%",
  } as const;
}

function alignClass(align: Align) {
  switch (align) {
    case "left":
      return "mr-auto ml-0 block";
    case "right":
      return "ml-auto mr-0 block";
    case "inline":
      return "mx-1 inline-block align-middle";
    default:
      return "mx-auto block";
  }
}

function ArticleImage({
  src,
  alt,
  width,
  height,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const url = mediaUrl(typeof src === "string" ? src : undefined);
  if (!url) return null;
  const align = readAlign(props as Record<string, unknown>);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt ?? ""}
      width={width}
      height={height}
      data-align={align}
      style={sizeStyle(width, height)}
      className={`my-6 rounded-2xl border border-neutral-200 object-contain shadow-lg dark:border-neutral-800 ${alignClass(align)}`}
    />
  );
}

export const articleComponents = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-5 text-3xl font-bold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-100">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-neutral-900 first:mt-0 dark:text-neutral-100">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 leading-7 text-neutral-600 dark:text-neutral-100">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-6 list-disc space-y-2 pl-6 text-neutral-600 marker:text-violet-500 dark:text-neutral-100">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 list-decimal space-y-2 pl-6 text-neutral-600 marker:font-mono marker:text-violet-500 dark:text-neutral-100">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-medium text-violet-600 underline decoration-violet-400/40 underline-offset-4 transition-colors hover:text-violet-500 dark:text-violet-400"
    >
      {children}
    </a>
  ),
  img: ArticleImage,
  div: ({ children, ...props }) => {
    const align = readAlign(props as Record<string, unknown>);
    const cls =
      align === "left"
        ? "text-left"
        : align === "right"
          ? "text-right"
          : align === "center"
            ? "text-center [&_img]:mx-auto"
            : "";
    return <div className={cls}>{children}</div>;
  },
  strong: ({ children }) => (
    <strong className="font-semibold text-neutral-900 dark:text-neutral-100">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-7 border-l-4 border-violet-400 bg-violet-50/70 px-5 py-4 italic text-neutral-600 dark:border-violet-600 dark:bg-violet-950/20 dark:text-neutral-300">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-7 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950 p-5 text-sm leading-6 text-neutral-200 shadow-lg [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[0.9em] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
      {children}
    </code>
  ),
  hr: () => <hr className="my-10 border-neutral-200 dark:border-neutral-800" />,
  del: ({ children }) => (
    <del className="text-neutral-500 dark:text-neutral-400">{children}</del>
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-neutral-100 dark:bg-neutral-900">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border border-neutral-200 px-3 py-2 font-semibold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-neutral-200 px-3 py-2 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300">
      {children}
    </td>
  ),
} satisfies MDXComponents;

export const markdownComponents = articleComponents as Components;
