"use client";

import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/types";

// Menu a schermo intero per i telefoni (sotto 768 px il menu orizzontale non ci sta).
export function MobileMenu({
  projects,
  linkedin,
}: {
  projects: Project[];
  linkedin?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const highlights = projects.filter((p) => p.highlight);

  const group = (label: string, items: Project[]) =>
    items.length > 0 && (
      <section>
        <h2 className="mb-2 text-[0.65rem] uppercase tracking-widest text-neutral-400">{label}</h2>
        <ul className="space-y-2">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.slug}`} onClick={close} className="block text-base">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Chiudi menu" : "Apri menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
        </svg>
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] space-y-8 overflow-y-auto bg-white px-6 py-8">
          {group("Highlights", highlights)}
          {group("Projects", projects)}
          <ul className="space-y-3 text-sm uppercase tracking-widest">
            <li>
              <Link href="/about" onClick={close}>
                About
              </Link>
            </li>
            <li>
              <Link href="/#contact" onClick={close}>
                Contact
              </Link>
            </li>
            {linkedin && (
              <li>
                <a href={linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
