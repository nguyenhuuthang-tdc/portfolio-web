import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogBySlug, getBlogDetail, getBlogPosts } from "@/lib/content/blogs";
import { Blog } from "@/types/api";
import { ViewTracker } from "./ViewTracker";
import { mediaUrl } from "@/lib/media";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { posts } = await getBlogPosts({ limit: 100 });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Winphony`,
    description: post.excerpt ?? undefined,
    openGraph: post.thumbnail
      ? { images: [{ url: post.thumbnail }] }
      : undefined,
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function readingTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min${mins > 1 ? 's' : ''} read`;
}

/* ── Related posts card ── */
function RelatedCard({ post }: { post: Blog }) {
  const thumb = mediaUrl(post.thumbnail);
  return (
    <Link
      href={`/writings/${post.slug}`}
      className="group flex gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
    >
      {thumb && (
        <div className="shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumb}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug mb-1">
          {post.title}
        </p>
        <p className="text-xs text-neutral-400 font-mono">{formatDate(post.publishedAt)}</p>
      </div>
    </Link>
  );
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getBlogDetail(slug);
  if (!detail) notFound();
  const { post, MdxContent } = detail;

  // Related posts: same categories, excluding current
  const categorySlug = post.categories[0]?.slug;
  const { posts: relatedPosts } = await getBlogPosts({
    limit: 20,
    category: categorySlug,
  });
  const related = relatedPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  // If not enough related, fetch recent
  const { posts: recentPosts } = related.length < 2
    ? await getBlogPosts({ limit: 10 })
    : { posts: [] };
  const otherWritings = recentPosts
    .filter((p) => p.slug !== slug && !related.find((r) => r.id === p.id))
    .slice(0, 4 - related.length);
  const sidebarPosts = [...related, ...otherWritings].slice(0, 4);

  return (
    <div className="min-h-screen pt-20 pb-16">
      {!MdxContent && <ViewTracker blogId={post.id} />}

      {/* Hero / Thumbnail */}
      {mediaUrl(post.thumbnail) ? (
        <div className="relative w-full aspect-3/1 sm:aspect-4/1 lg:aspect-5/2 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(post.thumbnail)!}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white dark:from-neutral-950 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="h-8 sm:h-12" />
      )}

      <div className="px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">

            {/* ── Main article ────────────────────────────────────────── */}
            <article className="max-w-2xl">
              {/* Back */}
              <Link
                href="/writings"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6 transition-colors mt-4"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                </svg>
                Back to Writings
              </Link>

              {/* Header */}
              <header className="mb-10">
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/writings?category=${cat.slug}`}
                        className="text-xs px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-neutral-900 dark:text-neutral-50">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <span>{formatDate(post.publishedAt)}</span>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <span>{readingTime(post.content)}</span>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  {/* <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {post.viewCount.toLocaleString()} views
                  </span> */}
                </div>
              </header>

              {/* API articles use HTML; local articles are compiled MDX components. */}
              {MdxContent ? (
                <div className="max-w-none">
                  <MdxContent />
                </div>
              ) : (
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none
                    prose-headings:font-bold prose-headings:tracking-tight
                    prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                    prose-code:font-mono prose-code:text-violet-600 dark:prose-code:text-violet-400
                    prose-code:bg-violet-50 dark:prose-code:bg-violet-950/40 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                    prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800
                    prose-img:rounded-xl prose-img:shadow-md
                    prose-blockquote:border-violet-400 dark:prose-blockquote:border-violet-600"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              )}

              {/* Tags */}
              {post.categories.length > 0 && (
                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                  <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono mb-3">Tagged in</p>
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/writings?category=${cat.slug}`}
                        className="text-sm px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
                        style={{ backgroundColor: `${cat.color}15`, color: cat.color, borderColor: `${cat.color}40` }}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className="hidden lg:block mt-20">
              <div className="sticky top-28 space-y-8">
                {/* Related / Other writings */}
                {sidebarPosts.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">
                      {related.length > 0 ? "Related writings" : "Other writings"}
                    </h3>
                    <div className="space-y-1">
                      {sidebarPosts.map((p) => (
                        <RelatedCard key={p.id} post={p} />
                      ))}
                    </div>
                    <Link
                      href="/writings"
                      className="inline-flex items-center gap-1.5 text-xs text-violet-500 hover:text-violet-400 mt-4 transition-colors group"
                    >
                      All writings
                      <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ── Mobile: related posts ── */}
          {sidebarPosts.length > 0 && (
            <div className="lg:hidden mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800 max-w-2xl">
              <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">
                {related.length > 0 ? "Related writings" : "Other writings"}
              </h3>
              <div className="space-y-1">
                {sidebarPosts.slice(0, 3).map((p) => (
                  <RelatedCard key={p.id} post={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
