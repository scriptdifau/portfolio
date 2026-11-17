import { cacheLife } from "next/cache";
import type { SiteSettings } from "@/lib/types";

async function currentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

const iconClass = "h-7 w-7 shrink-0";

function MailIcon() {
  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <rect x="1" y="1" width="26" height="18" rx="2" />
      <path d="M2 3l12 9L26 3M2 18l9-8M26 18l-9-8" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconClass} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z" />
      <path d="M8.9 7.6c.4-.5.9-.5 1.2-.2l1 1.8c.1.3-.7 1.1-.7 1.4 0 .7 1.7 2.4 2.5 2.7.4.1 1-.9 1.3-.9l1.8 1c.3.2.4.7 0 1.3-.5 1-1.7 1.5-3 1.1-2.5-.7-4.8-3.2-5.1-5.1-.1-.8.1-1.4.5-2.4z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
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
  const phoneDigits = (s.phone ?? "").replace(/\D/g, "");

  return (
    <footer id="contact" className="post-column mt-24 px-4 pb-16 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/get-in-touch.png"
          alt="Get in touch!"
          width={172}
          height={124}
          className="h-auto w-24 shrink-0 sm:w-[6.5rem]"
        />

        <div className="min-w-0 flex-1">
          <div className="flex min-h-16 flex-wrap items-center justify-between gap-x-8 gap-y-4 text-[0.95rem] sm:h-[4.1rem]">
            {s.email && (
              <a href={`mailto:${s.email}`} className="flex items-center gap-3 hover:opacity-60">
                <MailIcon />
                <span>{s.email}</span>
              </a>
            )}
            {s.phone && (
              <a
                href={phoneDigits ? `https://wa.me/${phoneDigits}` : `tel:${s.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 hover:opacity-60"
              >
                <WhatsAppIcon />
                <span>{s.phone}</span>
              </a>
            )}
            {offices.map((o) =>
              o.link ? (
                <a key={o.city} href={o.link} target="_blank" rel="noreferrer" className="hover:opacity-60">
                  {o.city}
                </a>
              ) : (
                <span key={o.city}>{o.city}</span>
              ),
            )}
            <div className="ml-auto flex items-center gap-4">
              {s.instagram && (
                <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-60">
                  <InstagramIcon />
                </a>
              )}
              {s.linkedin && (
                <a href={s.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:opacity-60">
                  <LinkedInIcon />
                </a>
              )}
            </div>
          </div>
          <div className="border-t-4 border-black pt-2 text-xs sm:text-right">
            © {year} {s.site_name}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
