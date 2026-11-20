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

// Durata della cache: dopo 5 min si ricontrolla in background; se Supabase non risponde (limiti superati,
// manutenzione) il sito continua a mostrare l'ultima versione buona fino a 7 giorni.
const CACHE = { stale: 300, revalidate: 60, expire: 60 * 60 * 24 * 7 };

// Durante la build (deploy) un errore non deve bloccare la pubblicazione; a runtime sì:
// un errore NON viene messo in cache, così non sostituisce una pagina buona con una vuota.
const isBuild = process.env.NEXT_PHASE === "phase-production-build";

// Peso di un file (HEAD): serve a decidere se un video può partire da solo. Non è nel database.
const sizeCache = new Map<string, number>();
async function sizeOf(url: string | null | undefined): Promise<number | null> {
  if (!url) return null;
  const known = sizeCache.get(url);
  if (known) return known;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    const bytes = Number(res.headers.get("content-length"));
    if (!res.ok || !bytes) return null;
    sizeCache.set(url, bytes);
    return bytes;
  } catch {
    return null;
  }
}

function fail(what: string, error: { message: string }): never {
  throw new Error(`Supabase non risponde (${what}): ${error.message}`);
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("content");
  cacheLife(CACHE);
  if (!hasSupabase) return seedSettings;
  const { data, error } = await db().from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) {
    if (isBuild) return seedSettings;
    fail("impostazioni", error);
  }
  const settings = (data as SiteSettings | null) ?? seedSettings;
  return { ...settings, hero_bytes: await sizeOf(settings.hero_video_url) };
}

export async function getProjects(): Promise<Project[]> {
  "use cache";
  cacheTag("content");
  cacheLife(CACHE);
  if (!hasSupabase) return seedProjects;
  const { data, error } = await db()
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) {
    if (isBuild) return [];
    fail("progetti", error);
  }
  const projects = (data as Project[] | null) ?? [];
  return Promise.all(
    projects.map(async (p) => ({
      ...p,
      cover_bytes: p.cover_type === "video" ? await sizeOf(p.cover_url) : null,
      media: await Promise.all(
        (p.media ?? []).map(async (m) => (m.type === "video" ? { ...m, bytes: await sizeOf(m.url) } : m)),
      ),
    })),
  );
}

export async function getProject(slug: string): Promise<Project | null> {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) ?? null;
}
