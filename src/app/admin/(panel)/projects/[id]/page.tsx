import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export default async function EditProject({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let project: Project | undefined;

  if (id !== "new") {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    project = data as Project;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">
        {project ? "Modifica progetto" : "Nuovo progetto"}
      </h1>
      <ProjectForm project={project} />
    </>
  );
}
