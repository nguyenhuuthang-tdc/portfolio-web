"use client";

import { useState } from "react";
import { Blog } from "@/types/api";
import { WritingCard } from "@/components/ui/WritingCard";

type WritingsFeedProps = {
  posts: Blog[];
  total: number;
  category?: string;
  className?: string;
};

const PAGE_SIZE = 6;

export function WritingsFeed({
  posts: initialPosts,
  total,
  category,
  className = "grid sm:grid-cols-2 lg:grid-cols-3 gap-4",
}: WritingsFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const hasMore = posts.length < total;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(false);

    try {
      const qs = new URLSearchParams({
        page: String(page + 1),
        limit: String(PAGE_SIZE),
        ...(category ? { category } : {}),
      });
      const res = await fetch(`/api/blogs?${qs}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as { posts: Blog[] };
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...data.posts.filter((p) => !ids.has(p.id))];
      });
      setPage((p) => p + 1);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className={className}>
        {posts.map((post) => (
          <WritingCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-2 mt-10">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="px-5 py-2.5 rounded-full text-sm font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
          {error && (
            <p className="text-xs text-red-500">Couldn’t load more. Try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
