const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_URL = configuredSiteUrl.replace(/\/$/, "");
export const SITE_NAME = "Winphony";
export const OWNER_NAME = "Tommy";
export const DEFAULT_DESCRIPTION =
  "Portfolio of Tommy, a full-stack developer building thoughtful web experiences, scalable applications, and practical software products.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export function socialImageUrl(src: string | null | undefined): string {
  if (!src || src.startsWith("data:")) return absoluteUrl("/opengraph-image");

  const pathname = src.split(/[?#]/, 1)[0].toLowerCase();
  return pathname.endsWith(".svg") ? absoluteUrl("/opengraph-image") : src;
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
