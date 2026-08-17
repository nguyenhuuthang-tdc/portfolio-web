/*
 * Skeleton shimmer component.
 * Uses CSS background animation (shimmer keyframe from globals.css).
 * Zero JS cost — pure CSS animation runs on the compositor thread.
 */

type SkeletonProps = {
  className?: string;
  style?: React.CSSProperties;
};

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--sk-from) 0%, var(--sk-via) 50%, var(--sk-from) 100%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.6s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

/* Project card skeleton — matches the two-zone card layout */
export function ProjectCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-neutral-200/60 dark:border-neutral-800/60"
      style={{
        background: "var(--glass-bg)",
      }}
    >
      {/* Image zone */}
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "16/7" }} />

      {/* Content zone */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-12 rounded-lg" />
        </div>
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* Stat card skeleton */
export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60">
      <Skeleton className="w-7 h-7 mb-3 rounded-lg" />
      <Skeleton className="h-8 w-16 mb-1.5 rounded-lg" />
      <Skeleton className="h-3 w-24 rounded-md" />
    </div>
  );
}
