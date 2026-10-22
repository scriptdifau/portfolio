import Link from "next/link";
import type { Project } from "@/lib/types";

function Dropdown({ label, items }: { label: string; items: Project[] }) {
  if (items.length === 0) return null;
  return (
    <li className="group relative">
      <button type="button" className="uppercase tracking-widest hover:opacity-60">
        {label}
      </button>
      <ul className="invisible absolute right-0 top-full min-w-64 bg-white py-3 opacity-0 shadow-sm transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.slug}`}
              className="block px-5 py-1.5 normal-case tracking-normal hover:bg-neutral-100"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function Header({
  siteName,
  projects,
  linkedin,
}: {
  siteName: string;
  projects: Project[];
  linkedin?: string | null;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur">
      <nav className="flex h-16 items-center justify-between px-6 text-xs">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.25em]">
          {siteName}
        </Link>
        <ul className="flex items-center gap-8">
          <Dropdown label="Highlights" items={projects.filter((p) => p.highlight)} />
          <Dropdown label="Projects" items={projects} />
          <li>
            <Link href="/about" className="uppercase tracking-widest hover:opacity-60">
              About
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="uppercase tracking-widest hover:opacity-60">
              Contact
            </Link>
          </li>
          {linkedin && (
            <li>
              <a href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
                </svg>
              </a>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
