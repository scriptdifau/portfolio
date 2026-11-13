import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProjectList, type ProjectRow } from "@/components/admin/ProjectList";

export default async function AdminHome() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("id, title, cover_url, cover_type, published")
    .order("sort_order")
    .order("created_at", { ascending: false });
  const projects = (data ?? []) as ProjectRow[];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Progetti</h1>
        <Link href="/admin/projects/new" className="bg-black px-4 py-2 text-sm text-white">
          + Nuovo progetto
        </Link>
      </div>
      <ProjectList initial={projects} />
    </>
  );
}
