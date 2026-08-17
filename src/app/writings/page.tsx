import Link from "next/link";
import { Suspense } from "react";
import { getBlogPosts, getBlogCategories } from "@/lib/content/blogs";
import { BlogCategory } from "@/types/api";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { WritingsFeed } from "@/components/ui/WritingsFeed";

export const revalidate = 3600;

export const metadata = {
  title: "Writings — Winphony",
  description: "Thoughts on tech, coding, guitar, and life.",
};

function WritingsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 flex gap-2">
        {[60, 90, 70, 80].map((w) => (
          <div key={w} className="h-7 rounded-full bg-neutral-200 dark:bg-neutral-800" style={{ width: w }} />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="aspect-video bg-neutral-200 dark:bg-neutral-800" />
            <div className="p-5 space-y-2">
              <div className="h-3 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type SearchParams = { category?: string };

async function WritingsContent({ category }: { category?: string }) {
  const [{ posts, total }, categories] = await Promise.all([
    getBlogPosts({ limit: 6, category }),
    getBlogCategories(),
  ]);

  return (
    <>
      {categories.length > 0 && (
        <SectionReveal delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/writings"
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                !category
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-violet-400 dark:hover:border-violet-600"
              }`}
            >
              All
            </Link>
            {categories.map((cat: BlogCategory) => (
              <Link
                key={cat.id}
                href={`/writings?category=${cat.slug}`}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors font-medium ${
                  category === cat.slug
                    ? "text-white border-transparent"
                    : "border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-violet-400"
                }`}
                style={
                  category === cat.slug
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : {}
                }
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </SectionReveal>
      )}

      {posts.length === 0 ? (
        <SectionReveal>
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
            <p className="text-sm">No writings yet in this category.</p>
          </div>
        </SectionReveal>
      ) : (
        <>
          <SectionReveal delay={0.12}>
            <WritingsFeed
              key={category ?? "all"}
              posts={posts}
              total={total}
              category={category}
              className="grid sm:grid-cols-2 gap-5"
            />
          </SectionReveal>
        </>
      )}
    </>
  );
}

export default async function WritingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category } = await searchParams;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <div className="mb-10">
            <span className="text-xs font-mono text-violet-500 dark:text-violet-400 uppercase tracking-widest mb-4 block">
              Writings
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Thoughts &amp; Notes
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              Writing about tech, coding, guitar, and whatever else is on my mind.
            </p>
          </div>
        </SectionReveal>

        <Suspense fallback={<WritingsSkeleton />}>
          <WritingsContent category={category} />
        </Suspense>
      </div>
    </div>
  );
}
