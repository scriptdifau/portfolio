"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { deleteProject, reorderProjects } from "@/app/admin/actions";
import { thumbUrl } from "@/lib/thumb";

export type ProjectRow = {
  id: string;
  title: string;
  cover_url: string | null;
  cover_type: "image" | "video";
  published: boolean;
};

// Elenco dei progetti: si riordina trascinando (o con le frecce, su touch). L'ordine vale anche nella home.
export function ProjectList({ initial }: { initial: ProjectRow[] }) {
  const [items, setItems] = useState(initial);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const saveId = useRef(0);

  async function persist(next: ProjectRow[]) {
    const id = ++saveId.current;
    setStatus("Salvataggio…");
    const error = await reorderProjects(next.map((p) => p.id));
    if (id !== saveId.current) return; // c'è già un salvataggio più recente
    setStatus(error ? `Errore: ${error}` : "Ordine salvato ✓");
  }

  function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    persist(next);
  }

  const endDrag = () => {
    setDragFrom(null);
    setDragOver(null);
  };

  if (items.length === 0) {
    return <p className="bg-white p-6 text-sm text-neutral-500">Nessun progetto. Creane uno!</p>;
  }

  return (
    <div>
      <p className="mb-3 h-5 text-sm text-neutral-500">
        {status ?? "Trascina i progetti per cambiare l'ordine nella home."}
      </p>
      <ul className="divide-y divide-neutral-200 bg-white">
        {items.map((p, i) => (
          <li
            key={p.id}
            onDragOver={(e) => {
              if (dragFrom === null) return;
              e.preventDefault();
              setDragOver(i);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragFrom !== null) reorder(dragFrom, i);
              endDrag();
            }}
            className={`flex items-center gap-4 p-4 ${dragFrom === i ? "opacity-40" : ""} ${
              dragOver === i && dragFrom !== null && dragFrom !== i
                ? dragFrom > i
                  ? "border-t-4 border-black"
                  : "border-b-4 border-black"
                : ""
            }`}
          >
            <span
              draggable
              onDragStart={(e) => {
                const row = e.currentTarget.closest("li");
                if (row) e.dataTransfer.setDragImage(row, 20, 20);
                e.dataTransfer.effectAllowed = "move";
                setDragFrom(i);
              }}
              onDragEnd={endDrag}
              title="Trascina per riordinare"
              className="cursor-grab select-none px-1 text-xl text-neutral-400 active:cursor-grabbing"
            >
              ⠿
            </span>
            <div className="h-14 w-14 shrink-0 bg-neutral-100">
              {p.cover_url && p.cover_type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbUrl(p.cover_url, 128)}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-xs text-neutral-500">
                {i + 1}° · {p.published ? "Pubblicato" : "Bozza"}
              </p>
            </div>
            <div className="flex gap-1 text-sm">
              <button
                type="button"
                aria-label="Sposta su"
                disabled={i === 0}
                onClick={() => reorder(i, i - 1)}
                className="px-1 disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Sposta giù"
                disabled={i === items.length - 1}
                onClick={() => reorder(i, i + 1)}
                className="px-1 disabled:opacity-25"
              >
                ↓
              </button>
            </div>
            <form
              action={deleteProject}
              onSubmit={(e) => {
                if (!window.confirm(`Eliminare "${p.title}"? Non si può annullare.`)) e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={p.id} />
              <button className="text-sm text-red-600 hover:underline">Elimina</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
