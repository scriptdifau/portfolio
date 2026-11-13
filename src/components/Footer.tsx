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
  const hasDetails = Boolean(s.email || s.phone || offices.length || s.linkedin || s.instagram);

  return (
    <footer id="contact" className="post-column mt-24 px-4 pb-16 text-sm sm:px-0">
      <div className="border-y-4 border-black py-3">
        <h2 className="text-xl font-bold">Get in touch</h2>
        {hasDetails && (
          <div className="mt-6 grid gap-8 pb-3 text-[0.8rem] uppercase tracking-[0.02em] sm:grid-cols-3">
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
        )}
      </div>
      <p className="mt-4 text-xs">
        © {year} {s.site_name}. All rights reserved.
      </p>
    </footer>
  );
}
