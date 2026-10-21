import { createClient as createPublicClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { hasSupabase } from "./supabase/env";
import { seedProjects, seedSettings } from "./seed";
import type { Project, SiteSettings } from "./types";

function db() {
  return createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("content");
  cacheLife("minutes");
  if (!hasSupabase) return seedSettings;
  const { data } = await db().from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings | null) ?? seedSettings;
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("content");
  cacheLife("minutes");
  if (!hasSupabase) return seedProjects;
  const { data } = await db()
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  return (data as Project[] | null) ?? [];
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}
