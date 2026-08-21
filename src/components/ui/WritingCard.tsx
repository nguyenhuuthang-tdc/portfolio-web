import Link from "next/link";
import { Blog } from "@/types/api";
import { mediaUrl } from "@/lib/media";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function readingTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} minute`;
}

type WritingCardProps = {
  post: Blog;
  featured?: boolean;
};

export function WritingCard({ post, featured = false }: WritingCardProps) {
  const thumb = mediaUrl(post.thumbnail);

  return (
    <Link
      href={`/writings/${post.slug}`}
      className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 h-full ${
        featured ? "sm:flex-row sm:min-h-64" : ""
      } border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-950/80 hover:border-violet-300 dark:hover:border-violet-700/50 hover:shadow-xl hover:shadow-violet-500/8 hover:-translate-y-0.5`}
    >
      {/* Thumbnail */}
      <div
        className={`relative overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 ${
          featured
            ? "aspect-video sm:aspect-auto sm:w-[46%]"
            : "aspect-video"
        }`}
      >
        {thumb ? (
          // Native img — next/image remotePatterns often miss LAN IPs
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/20 via-indigo-500/10 to-transparent flex items-center justify-center">
            <span
              className="font-extrabold text-violet-400/25 select-none"
              style={{
                fontFamily: "var(--font-display, 'Space Grotesk')",
                fontSize: featured ? "5rem" : "3.5rem",
              }}
            >
              {post.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`flex flex-col flex-1 ${featured ? "p-6 sm:p-8" : "p-5"}`}>
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {post.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${cat.color}22`,
                  color: cat.color,
                }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        <h3
          className={`font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug tracking-tight ${
            featured ? "text-xl sm:text-2xl mb-3" : "text-[16px] mb-2"
          }`}
          style={{ fontFamily: "var(--font-display, 'Space Grotesk')" }}
        >
          {post.title}
        </h3>

        {post.excerpt && (
          <p
            className={`text-neutral-500 dark:text-neutral-400 leading-relaxed ${
              featured ? "text-[15px] line-clamp-3 mb-4" : "text-sm line-clamp-2 mb-4"
            }`}
          >
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2.5 text-[11px] font-mono text-neutral-400 dark:text-neutral-600">
          <span>{formatDate(post.publishedAt)}</span>
          <span>·</span>
          <span>{readingTime(post.content)}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {post.viewCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
