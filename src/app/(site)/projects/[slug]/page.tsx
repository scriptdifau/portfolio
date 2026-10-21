import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Media } from "@/components/Media";
import { RichText } from "@/components/RichText";
import { getProject, getProjects } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  return p ? { title: p.title, description: p.summary ?? undefined } : {};
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-screen" />}>
      <Project params={params} />
    </Suspense>
  );
}

async function Project({ params }: Props) {
  const { slug } = await params;
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const i = all.findIndex((p) => p.id === project.id);
  const next = all[(i + 1) % all.length];

  return (
    <article>
      {project.cover_url && (
        <Media
          url={project.cover_url}
          type={project.cover_type}
          alt={project.title}
          className="max-h-[80vh] w-full object-cover"
        />
      )}
      <div className="mx-auto max-w-3xl px-6 py-16">
        {project.client && (
          <p className="mb-3 text-xs uppercase tracking-widest text-neutral-500">{project.client}</p>
        )}
        <h1 className="mb-10 text-4xl font-light sm:text-5xl">{project.title}</h1>
        {project.body && <RichText text={project.body} />}
      </div>

      {project.media.length > 0 && (
        <div className="space-y-1">
          {project.media.map((m, idx) => (
            <figure key={idx}>
              <Media url={m.url} type={m.type} alt={m.caption} className="w-full" />
              {m.caption && (
                <figcaption className="px-6 py-2 text-xs text-neutral-500">{m.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {next && next.id !== project.id && (
        <div className="px-6 pt-16 text-right">
          <Link href={`/projects/${next.slug}`} className="text-2xl font-light hover:opacity-60">
            Next: {next.title} →
          </Link>
        </div>
      )}
    </article>
  );
}
