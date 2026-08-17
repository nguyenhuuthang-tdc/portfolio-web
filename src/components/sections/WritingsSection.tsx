"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Blog } from "@/types/api";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { WritingCard } from "@/components/ui/WritingCard";

type WritingsSectionProps = {
  posts: Blog[];
};

export function WritingsSection({ posts }: WritingsSectionProps) {
  const latest = posts.slice(0, 6);

  return (
    <section id="writings" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-mono font-medium text-violet-500 dark:text-violet-400 uppercase tracking-[0.18em] mb-4">
                <span className="w-5 h-px bg-violet-500" />
                Writings
              </span>
              <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                Thoughts &amp; Notes
              </h2>
            </div>
            <Link
              href="/writings"
              className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors group"
            >
              All writings
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </SectionReveal>

        {latest.length === 0 ? (
          <SectionReveal>
            <p className="text-neutral-400 dark:text-neutral-600 font-mono text-sm">
              No writings yet. Check back soon.
            </p>
          </SectionReveal>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {latest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                <WritingCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
