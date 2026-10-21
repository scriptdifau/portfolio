import Link from "next/link";
import { Media } from "@/components/Media";
import { getProjects, getSettings } from "@/lib/data";

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);

  return (
    <>
      <section className="px-6 pb-16 pt-8">
        {settings.hero_video_url && (
          <Media
            url={settings.hero_video_url}
            type="video"
            className="mb-10 aspect-video w-full object-cover"
          />
        )}
        {settings.intro && (
          <p className="max-w-4xl text-3xl font-light leading-tight sm:text-5xl">{settings.intro}</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.slug}`}
            className="group relative block aspect-square overflow-hidden bg-neutral-100"
          >
            {p.cover_url ? (
              <Media
                url={p.cover_url}
                type={p.cover_type}
                alt={p.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-end p-6 text-2xl font-light">{p.title}</div>
            )}
            <div className="absolute inset-0 flex flex-col justify-end bg-black/50 p-6 text-white opacity-0 transition group-hover:opacity-100">
              {p.client && (
                <span className="text-xs uppercase tracking-widest">{p.client}</span>
              )}
              <span className="text-xl">{p.title}</span>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
