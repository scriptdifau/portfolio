import { cacheLife } from "next/cache";
import type { SiteSettings } from "@/lib/types";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer({ s }: { s: SiteSettings }) {
  const year = await currentYear();
  const offices = (s.offices ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [city, link] = l.split("|").map((x) => x.trim());
      return { city, link };
    });

  return (
    <footer id="contact" className="mt-24 border-t border-neutral-200 px-6 py-16 text-sm">
      <h2 className="mb-8 text-3xl font-light">Get in touch</h2>
      <div className="grid gap-10 sm:grid-cols-3">
        <div className="space-y-1">
          {s.email && (
            <p>
              <a href={`mailto:${s.email}`} className="underline underline-offset-4">
                {s.email}
              </a>
            </p>
          )}
          {s.phone && <p>{s.phone}</p>}
        </div>
        <ul className="space-y-1">
          {offices.map((o) => (
            <li key={o.city}>
              {o.link ? (
                <a href={o.link} target="_blank" rel="noreferrer" className="hover:opacity-60">
                  {o.city}
                </a>
              ) : (
                o.city
              )}
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {s.linkedin && (
            <li>
              <a href={s.linkedin} target="_blank" rel="noreferrer" className="hover:opacity-60">
                LinkedIn
              </a>
            </li>
          )}
          {s.instagram && (
            <li>
              <a href={s.instagram} target="_blank" rel="noreferrer" className="hover:opacity-60">
                Instagram
              </a>
            </li>
          )}
        </ul>
      </div>
      <p className="mt-16 text-xs text-neutral-500">
        © {year} {s.site_name}. All rights reserved.
      </p>
    </footer>
  );
}
