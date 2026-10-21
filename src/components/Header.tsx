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

export function Header({ siteName, projects }: { siteName: string; projects: Project[] }) {
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
        </ul>
      </nav>
    </header>
  );
}
