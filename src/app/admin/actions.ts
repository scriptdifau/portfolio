"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    body: text(formData, "body"),
    cover_url: text(formData, "cover_url"),
    cover_type: text(formData, "cover_type") === "video" ? "video" : "image",
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

export async function saveSettings(_: string | null, formData: FormData) {
  const supabase = await requireUser();
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    site_name: text(formData, "site_name") ?? "Portfolio",
    hero_video_url: text(formData, "hero_video_url"),
    intro: text(formData, "intro"),
    about: text(formData, "about"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    instagram: text(formData, "instagram"),
    linkedin: text(formData, "linkedin"),
    offices: text(formData, "offices"),
  });
  if (error) return error.message;
  refresh();
  return "Salvato ✓";
}
