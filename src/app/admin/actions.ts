"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeBody } from "@/lib/sanitize";
import type { MediaItem } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

const text = (f: FormData, k: string) => {
  const v = String(f.get(k) ?? "").trim();
  return v === "" ? null : v;
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function refresh() {
  updateTag("content");
}

export async function login(_: string | null, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return "Email o password non corretti.";
  redirect("/admin");
}

export async function refreshContent() {
  await requireUser();
  refresh();
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveProject(_: string | null, formData: FormData) {
  const supabase = await requireUser();
  const id = text(formData, "id");
  const title = text(formData, "title");
  if (!title) return "Il titolo è obbligatorio.";

  let media: MediaItem[] = [];
  try {
    media = JSON.parse(String(formData.get("media") ?? "[]"));
  } catch {
    return "Galleria non valida.";
  }

  const row = {
    title,
    slug: slugify(text(formData, "slug") ?? title),
    client: text(formData, "client"),
    summary: text(formData, "summary"),
    body: sanitizeBody(String(formData.get("body") ?? "")) || null,
    cover_url: text(formData, "cover_url"),
    cover_type: text(formData, "cover_type") === "video" ? "video" : "image",
    tile_shape: ["square", "portrait", "tall", "landscape", "wide"].includes(text(formData, "tile_shape") ?? "")
      ? text(formData, "tile_shape")
      : "square",
    media,
    highlight: formData.get("highlight") === "on",
    published: formData.get("published") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  };

  const { error } = id
    ? await supabase.from("projects").update(row).eq("id", id)
    : await supabase.from("projects").insert(row);
  if (error) {
    return error.code === "23505" ? "Esiste già un progetto con questo indirizzo (slug)." : error.message;
  }
  refresh();
  redirect("/admin");
}

export async function deleteProject(formData: FormData) {
  const supabase = await requireUser();
  await supabase.from("projects").delete().eq("id", String(formData.get("id")));
  refresh();
  redirect("/admin");
}

export async function reorderProjects(ids: string[]): Promise<string | null> {
  const supabase = await requireUser();
  const results = await Promise.all(
    ids.map((id, i) => supabase.from("projects").update({ sort_order: i + 1 }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return failed.error.message;
  refresh();
  return null;
}

export async function saveSettings(_: string | null, formData: FormData) {
  const supabase = await requireUser();
  // foto About e CV: presenti nel form solo se modificati (le colonne vanno aggiunte su Supabase, vedi schema.sql)
  const extra: Record<string, string | null> = {};
  if (formData.has("about_image_url")) extra.about_image_url = text(formData, "about_image_url");
  if (formData.has("cv_url")) extra.cv_url = text(formData, "cv_url");

  const { error } = await supabase.from("site_settings").upsert({
    ...extra,
    id: 1,
    site_name: text(formData, "site_name") ?? "Portfolio",
    hero_video_url: text(formData, "hero_video_url"),
    intro: text(formData, "intro"),
    about: sanitizeBody(String(formData.get("about") ?? "")) || null,
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    instagram: text(formData, "instagram"),
    linkedin: text(formData, "linkedin"),
    offices: text(formData, "offices"),
  });
  if (error) {
    return /about_image_url|cv_url/.test(error.message)
      ? "Prima di salvare foto e CV vanno aggiunte due colonne su Supabase: esegui il blocco SQL in fondo a supabase/schema.sql."
      : error.message;
  }
  // verifica: foto e CV devono risultare davvero scritti nel database
  if ("about_image_url" in extra || "cv_url" in extra) {
    const { data, error: readError } = await supabase
      .from("site_settings")
      .select("about_image_url, cv_url")
      .eq("id", 1)
      .maybeSingle();
    if (readError) return `Salvato, ma non riesco a verificare foto e CV: ${readError.message}`;
    if ("cv_url" in extra && (data?.cv_url ?? null) !== extra.cv_url) {
      return `Il CV NON risulta registrato nel database (letto: ${data?.cv_url ?? "vuoto"}). Riprova e mandami questo messaggio.`;
    }
    if ("about_image_url" in extra && (data?.about_image_url ?? null) !== extra.about_image_url) {
      return `La foto NON risulta registrata nel database (letto: ${data?.about_image_url ?? "vuoto"}). Riprova e mandami questo messaggio.`;
    }
  }
  refresh();
  return "Salvato ✓";
}
