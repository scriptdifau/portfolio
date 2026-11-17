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
    <article className="post-column px-4 sm:px-0">
      <div className="pb-12 pt-6 md:pt-10">
        <h1 className="post-title">{project.title}</h1>
        {project.body && <RichText text={project.body} />}
      </div>

      {project.media.length > 0 && (
        <div className="flex flex-wrap gap-[1%]">
          {project.media.map((m, idx) => (
            <figure
              key={idx}
              className={
                m.width === "third"
                  ? "w-[calc((100%-2%)/3)]"
                  : m.width === "half"
                    ? "w-[calc((100%-1%)/2)]"
                    : "w-full"
              }
            >
              <Media url={m.url} type={m.type} alt={m.caption} player sizes="(min-width: 1100px) 65vw, 100vw" className="w-full" />
              {m.caption && (
                <figcaption className="py-2 text-xs text-neutral-500">{m.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {next && next.id !== project.id && (
        <div className="pt-16 text-right md:pt-24">
          <Link
            href={`/projects/${next.slug}`}
            className="inline-flex items-center gap-3 text-sm tracking-[0.02em] hover:opacity-60 md:text-xl"
          >
            <span>
              Next | <span className="uppercase">{next.title}</span>
            </span>
            <svg viewBox="0 0 40 12" className="h-3 w-9 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <path d="M0 6h38M33 1l5 5-5 5" />
            </svg>
          </Link>
        </div>
      )}
    </article>
  );
}
