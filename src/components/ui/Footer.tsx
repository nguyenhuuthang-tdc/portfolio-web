import Link from "next/link";
import {
  RiGithubFill,
  RiLinkedinFill,
  RiMailLine,
} from "react-icons/ri";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/nguyenhuuthang-tdc",
    icon: RiGithubFill,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/thang-nguyen-dev",
    icon: RiLinkedinFill,
  },
  {
    label: "Email",
    href: "mailto:nguyenhuuthang1609@gmail.com",
    icon: RiMailLine,
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-neutral-200/80 bg-white/80 px-4 dark:border-neutral-800 dark:bg-neutral-950/90 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-violet-500/70 to-transparent" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-2/3 -translate-x-1/2 rounded-full bg-violet-500/[0.06] blur-3xl dark:bg-violet-500/[0.08]" />

      <div className="relative mx-auto max-w-6xl py-4 sm:py-6">
        <div className="grid gap-10 dark:border-neutral-800 sm:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] sm:items-end">
          <div className="max-w-xl self-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="Winphony home"
            >
              <span className="grid size-10 place-items-center rounded-xl border border-violet-200/80 bg-violet-50 font-display text-lg font-bold text-violet-700 shadow-sm transition-colors group-hover:border-violet-300 group-hover:bg-violet-100 dark:border-violet-800/70 dark:bg-violet-950/60 dark:text-violet-300 dark:group-hover:border-violet-700 dark:group-hover:bg-violet-950">
                W
              </span>
              <span className="font-display text-xl font-bold tracking-[-0.03em] text-violet-600 dark:text-violet-400">
                winphony
              </span>
            </Link>
          </div>

          <div className="sm:justify-self-end">
            <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 dark:text-neutral-400">
              Find me online
            </p>
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="group inline-flex size-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-xl text-neutral-600 shadow-sm transition-[color,border-color,background-color,translate,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-violet-700 dark:hover:bg-violet-950/60 dark:hover:text-violet-300"
                >
                  <Icon aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2 border-t border-neutral-200/70 pt-4 text-sm text-neutral-600 dark:border-neutral-800/80 dark:text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} Winphony. All rights reserved
          </p>
          <p className="font-mono">Designed &amp; built in Vietnam</p>
        </div>
      </div>
    </footer>
  );
}
