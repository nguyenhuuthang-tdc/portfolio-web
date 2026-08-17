/**
 * Resolve a stored media path (relative `/uploads/...` or absolute URL)
 * into a browser-loadable URL.
 */
export function mediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) {
    return src;
  }
  const base = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "";
  return `${base}${src.startsWith("/") ? src : `/${src}`}`;
}
