"use client";

import { useActionState, useState } from "react";
import { saveProject } from "@/app/admin/actions";
import { Media } from "@/components/Media";
import type { MediaItem, MediaType, Project } from "@/lib/types";
import { bodyToHtml } from "@/lib/sanitize";
import { RichEditor } from "./RichEditor";
import { Uploader } from "./Uploader";

const input = "w-full border border-neutral-300 bg-white px-3 py-2";

export function ProjectForm({ project }: { project?: Project }) {
  const [error, action, pending] = useActionState(saveProject, null);
  const [cover, setCover] = useState<{ url: string; type: MediaType } | null>(
    project?.cover_url ? { url: project.cover_url, type: project.cover_type } : null,
  );
  const [media, setMedia] = useState<MediaItem[]>(project?.media ?? []);
  const [body, setBody] = useState(bodyToHtml(project?.body));

  const move = (i: number, d: -1 | 1) =>
    setMedia((m) => {
      const j = i + d;
      if (j < 0 || j >= m.length) return m;
      const copy = [...m];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={project?.id ?? ""} />
      <input type="hidden" name="cover_url" value={cover?.url ?? ""} />
      <input type="hidden" name="cover_type" value={cover?.type ?? "image"} />
      <input type="hidden" name="media" value={JSON.stringify(media)} />
      <input type="hidden" name="body" value={body} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Titolo *</span>
        <input name="title" defaultValue={project?.title} required className={input} />
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Cliente / brand</span>
          <input name="client" defaultValue={project?.client ?? ""} className={input} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Indirizzo (slug)</span>
          <input
            name="slug"
            defaultValue={project?.slug}
            placeholder="generato dal titolo se vuoto"
            className={input}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Sommario (breve)</span>
        <input name="summary" defaultValue={project?.summary ?? ""} className={input} />
      </label>
      <div>
        <span className="mb-1 block text-sm font-medium">
          Testo — clicca su un&apos;immagine nel testo per cambiarne dimensione e posizione
        </span>
        <RichEditor html={body} onChange={setBody} />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Immagine in evidenza (immagine, GIF o video — appare nella griglia e in cima al post)</span>
        {cover && (
          <div className="mb-2 w-48">
            <Media url={cover.url} type={cover.type} className="aspect-square w-full object-cover" />
            <button
              type="button"
              onClick={() => setCover(null)}
              className="mt-1 text-xs text-red-600"
            >
              Rimuovi
            </button>
          </div>
        )}
        <Uploader label="Carica copertina" onUploaded={setCover} />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Galleria extra (opzionale, mostrata sotto il testo)</span>
        <ul className="mb-3 space-y-3">
          {media.map((m, i) => (
            <li key={m.url} className="flex gap-3 bg-white p-3">
              <div className="w-28 shrink-0">
                <Media url={m.url} type={m.type} className="aspect-square w-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={m.caption ?? ""}
                  onChange={(e) =>
                    setMedia((all) =>
                      all.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)),
                    )
                  }
                  placeholder="Didascalia (opzionale)"
                  className={input}
                />
                <div className="flex gap-3 text-sm">
                  <button type="button" onClick={() => move(i, -1)}>↑</button>
                  <button type="button" onClick={() => move(i, 1)}>↓</button>
                  <button
                    type="button"
                    onClick={() => setMedia((all) => all.filter((_, j) => j !== i))}
                    className="text-red-600"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Uploader
          label="+ Aggiungi immagini/video"
          multiple
          onUploaded={(f) => setMedia((all) => [...all, f])}
        />
      </div>

      <div className="flex flex-wrap items-center gap-8">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={project?.published ?? true} />
          Pubblicato
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="highlight" defaultChecked={project?.highlight ?? false} />
          Highlight (menu in evidenza)
        </label>
        <label className="flex items-center gap-2 text-sm">
          Ordine
          <input
            type="number"
            name="sort_order"
            defaultValue={project?.sort_order ?? 0}
            className="w-20 border border-neutral-300 px-2 py-1"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="bg-black px-6 py-2 text-white disabled:opacity-40">
        {pending ? "Salvataggio…" : "Salva"}
      </button>
    </form>
  );
}
