import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { deleteProject } from "../actions";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as Project[];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Progetti</h1>
        <Link href="/admin/projects/new" className="bg-black px-4 py-2 text-sm text-white">
          + Nuovo progetto
        </Link>
      </div>
      <ul className="divide-y divide-neutral-200 bg-white">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center gap-4 p-4">
            <div className="h-14 w-14 shrink-0 bg-neutral-100">
              {p.cover_url && p.cover_type === "image" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/admin/projects/${p.id}`} className="font-medium hover:underline">
                {p.title}
              </Link>
              <p className="text-xs text-neutral-500">
                {p.published ? "Pubblicato" : "Bozza"}
                {p.highlight && " · Highlight"} · ordine {p.sort_order}
              </p>
            </div>
            <form action={deleteProject}>
              <input type="hidden" name="id" value={p.id} />
              <button className="text-sm text-red-600 hover:underline">Elimina</button>
            </form>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="p-6 text-sm text-neutral-500">Nessun progetto. Creane uno!</li>
        )}
      </ul>
    </>
  );
}
