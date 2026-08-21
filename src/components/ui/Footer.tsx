export function Footer() {
  return (
    <footer className="relative z-10 border-t border-neutral-100 px-4 py-10 dark:border-neutral-800/60 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="font-mono text-xs text-neutral-400 dark:text-neutral-600">
          © {new Date().getFullYear()}{" "}
          <span className="gradient-text font-semibold">
            winphony
          </span>
          .com
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 dark:text-neutral-600">
          <a
            href="https://github.com/nguyenhuuthang-tdc"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            GitHub
          </a>

          <span className="h-3 w-px bg-neutral-200 dark:bg-neutral-800" />

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}