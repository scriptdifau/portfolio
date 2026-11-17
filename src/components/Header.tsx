import Link from "next/link";
import type { Project } from "@/lib/types";
import { MobileMenu } from "./MobileMenu";

function Dropdown({ label, items }: { label: string; items: Project[] }) {
  if (items.length === 0) return null;
  return (
    <li className="group relative">
      <button type="button" className="uppercase tracking-[0.04em] hover:opacity-60">
        {label}
      </button>
      <ul className="invisible absolute right-0 top-full max-h-[70vh] min-w-64 overflow-y-auto bg-white py-3 opacity-0 shadow-sm transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.slug}`}
              className="block px-5 py-1.5 uppercase hover:bg-neutral-100"
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
    <header className="fixed inset-x-0 top-0 z-50 bg-[var(--header-bg)]">
      <nav className="post-column flex h-[var(--header-h-m)] items-center justify-between gap-4 px-4 text-xs md:h-[var(--header-h)] md:px-0 md:text-[0.95rem]">
        <Link
          href="/"
          className="min-w-0 truncate whitespace-nowrap text-xs font-bold uppercase tracking-[0.06em] md:text-[0.9rem] md:tracking-[0.04em]"
        >
          {siteName}
        </Link>
        <ul className="hidden items-center gap-8 md:flex">
          <Dropdown label="Project" items={projects} />
          <li>
            <Link href="/about" className="uppercase tracking-[0.04em] hover:opacity-60">
              About
            </Link>
          </li>
          <li>
            <Link href="/#contact" className="uppercase tracking-[0.04em] hover:opacity-60">
              Contacts
            </Link>
          </li>
        </ul>
        <MobileMenu projects={projects} linkedin={linkedin} />
      </nav>
    </header>
  );
}
