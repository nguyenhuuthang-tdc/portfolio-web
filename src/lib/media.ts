function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "").replace(/\/$/, "");
}

/**
 * Resolve a stored media path (relative `/uploads/...` or absolute URL)
 * into a browser-loadable URL. Legacy rows that stored a full API origin
 * are rewritten to the current API host when the path is `/uploads/...`.
 */
export function mediaUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith("data:")) return src;

  const base = apiOrigin();

  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const parsed = new URL(src);
      if (parsed.pathname.startsWith("/uploads/") && base) {
        return `${base}${parsed.pathname}`;
      }
    } catch {
      return src;
    }
    return src;
  }

  // Files outside the upload namespace are local assets served from /public.
  if (!src.startsWith("/uploads/") && !src.startsWith("uploads/")) {
    return src.startsWith("/") ? src : `/${src}`;
  }

  const path = src.startsWith("/") ? src : `/${src}`;
  return base ? `${base}${path}` : path;
}
