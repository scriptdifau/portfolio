import Link from "next/link";
import { Media } from "@/components/Media";
import { getProjects, getSettings } from "@/lib/data";
import { SHAPE_ASPECT, SHAPE_RATIO } from "@/lib/shapes";
import type { Project } from "@/lib/types";

// Ogni box va nella colonna più bassa: mantiene l'ordine da sinistra a destra e pareggia le altezze.
function distribute(projects: Project[], count: number) {
  const cols: Project[][] = Array.from({ length: count }, () => []);
  const heights = Array(count).fill(0);
  for (const p of projects) {
    const i = heights.indexOf(Math.min(...heights));
    cols[i].push(p);
    heights[i] += SHAPE_RATIO[p.tile_shape] ?? 1;
  }
  return cols;
}

// Due colonne su schermi piccoli, tre da 640px in su.
function Grid({ projects, count, className }: { projects: Project[]; count: number; className: string }) {
  const columns = distribute(projects, count);
  return (
    <section className={className}>
      {columns.map((col, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col">
          {col.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              style={{ aspectRatio: SHAPE_ASPECT[p.tile_shape] ?? "1 / 1" }}
              className="group relative block w-full overflow-hidden bg-neutral-100"
            >
              {p.cover_url ? (
                <Media
                  url={p.cover_url}
                  type={p.cover_type}
                  alt={p.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-end p-4 text-lg font-light">{p.title}</div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end bg-black/50 p-4 text-white opacity-0 transition group-hover:opacity-100">
                {p.client && (
                  <span className="text-xs uppercase tracking-widest">{p.client}</span>
                )}
                <span className="text-lg">{p.title}</span>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </section>
  );
}

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

      <Grid projects={projects} count={2} className="flex sm:hidden" />
      <Grid projects={projects} count={3} className="hidden sm:flex" />
    </>
  );
}
