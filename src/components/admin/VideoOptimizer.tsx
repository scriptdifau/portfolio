"use client";

import { useCallback, useEffect, useState } from "react";
import { refreshContent } from "@/app/admin/actions";
import { compressVideo } from "@/lib/compressVideo";
import { createClient } from "@/lib/supabase/client";

type VideoFile = {
  path: string;
  url: string;
  size: number;
  usedIn: string[];
  tile: boolean; // usato solo come copertina dei box della home: compressione più forte
  state: string;
};

const MIN_BYTES = 3_500_000;
const mb = (n: number) => `${(n / 1_000_000).toFixed(1)} MB`;

export function VideoOptimizer() {
  const [videos, setVideos] = useState<VideoFile[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [deleteOriginals, setDeleteOriginals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const bucket = supabase.storage.from("media");

    // elenco di tutti i file (cartelle per anno)
    const top = await bucket.list("", { limit: 1000 });
    if (top.error) return setError(top.error.message);
    const files: { path: string; size: number; mime: string }[] = [];
    for (const entry of top.data) {
      const isFolder = entry.id === null;
      const list = isFolder ? await bucket.list(entry.name, { limit: 1000 }) : { data: [entry] };
      for (const f of list.data ?? []) {
        if (f.id === null) continue;
        files.push({
          path: isFolder ? `${entry.name}/${f.name}` : f.name,
          size: Number(f.metadata?.size ?? 0),
          mime: String(f.metadata?.mimetype ?? ""),
        });
      }
    }

    // dove sono usati
    const [{ data: projects }, { data: settings }] = await Promise.all([
      supabase.from("projects").select("title, cover_url, media, body"),
      supabase.from("site_settings").select("hero_video_url, about").eq("id", 1).maybeSingle(),
    ]);

    const found: VideoFile[] = files
      .filter((f) => f.mime.startsWith("video/") && f.size >= MIN_BYTES)
      .map((f) => {
        const url = bucket.getPublicUrl(f.path).data.publicUrl;
        const usedIn: string[] = [];
        let asCover = false;
        let elsewhere = false;
        for (const pr of projects ?? []) {
          if (JSON.stringify([pr.cover_url, pr.media, pr.body]).includes(f.path)) usedIn.push(pr.title);
          if (pr.cover_url === url) asCover = true;
          if (JSON.stringify([pr.media, pr.body]).includes(f.path)) elsewhere = true;
        }
        if (settings && JSON.stringify([settings.hero_video_url, settings.about]).includes(f.path)) {
          usedIn.push("Impostazioni (home/About)");
          elsewhere = true;
        }
        return { path: f.path, url, size: f.size, usedIn, tile: asCover && !elsewhere, state: "" };
      })
      .sort((a, b) => b.size - a.size);
    setVideos(found);
  }, []);

  useEffect(() => {
    // caricamento iniziale dell'elenco
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const setState = (path: string, state: string) =>
    setVideos((all) => all?.map((v) => (v.path === path ? { ...v, state } : v)) ?? null);

  async function optimize(video: VideoFile) {
    const supabase = createClient();
    const bucket = supabase.storage.from("media");
    try {
      setState(video.path, "Scarico l'originale…");
      const blob = await (await fetch(video.url)).blob();
      const original = new File([blob], video.path.split("/").pop()!, { type: blob.type });

      const result = await compressVideo(original, (p) => setState(video.path, `Compressione… ${p}%`), {
        preset: video.tile ? "tile" : "full",
      });
      if (!result.compressed) {
        return setState(video.path, "Non comprimibile (già leggero o browser non supportato)");
      }

      setState(video.path, "Carico la versione leggera…");
      const newPath = `${video.path.split("/")[0]}/${crypto.randomUUID()}.mp4`;
      const up = await bucket.upload(newPath, result.file, {
        cacheControl: "31536000",
        contentType: "video/mp4",
      });
      if (up.error) throw up.error;
      const newUrl = bucket.getPublicUrl(newPath).data.publicUrl;

      setState(video.path, "Aggiorno i progetti…");
      const { data: projects, error: pe } = await supabase
        .from("projects")
        .select("id, cover_url, media, body");
      if (pe) throw pe;
      for (const pr of projects ?? []) {
        if (!JSON.stringify([pr.cover_url, pr.media, pr.body]).includes(video.path)) continue;
        const { error } = await supabase
          .from("projects")
          .update({
            cover_url: pr.cover_url === video.url ? newUrl : pr.cover_url,
            media: JSON.parse(JSON.stringify(pr.media ?? []).split(video.url).join(newUrl)),
            body: pr.body ? pr.body.split(video.url).join(newUrl) : pr.body,
          })
          .eq("id", pr.id);
        if (error) throw error;
      }
      const { data: s } = await supabase
        .from("site_settings")
        .select("hero_video_url, about")
        .eq("id", 1)
        .maybeSingle();
      if (s && JSON.stringify([s.hero_video_url, s.about]).includes(video.path)) {
        const { error } = await supabase
          .from("site_settings")
          .update({
            hero_video_url: s.hero_video_url === video.url ? newUrl : s.hero_video_url,
            about: s.about ? s.about.split(video.url).join(newUrl) : s.about,
          })
          .eq("id", 1);
        if (error) throw error;
      }

      if (deleteOriginals) await bucket.remove([video.path]);
      await refreshContent();
      setState(video.path, `Fatto: ${mb(video.size)} → ${mb(result.file.size)}`);
    } catch (e) {
      setState(video.path, `Errore: ${e instanceof Error ? e.message : JSON.stringify(e)}`);
    }
  }

  async function optimizeAll() {
    if (!videos) return;
    const toCompress = videos.filter((v) => v.usedIn.length > 0); // i video non usati non si comprimono: si eliminano
    const ok = window.confirm(
      `Comprimo ${toCompress.length} video, uno dopo l'altro. Servono alcuni minuti e la scheda deve restare aperta. ${
        deleteOriginals ? "Gli originali verranno CANCELLATI." : "Gli originali verranno conservati."
      } Procedo?`,
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    for (const v of toCompress) {
      if (v.state.startsWith("Fatto")) continue;
      await optimize(v);
    }
    setBusy(false);
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!videos) return <p className="text-sm text-neutral-500">Cerco i video…</p>;

  const inUse = videos.filter((v) => v.usedIn.length > 0);
  const idle = videos.filter((v) => v.usedIn.length === 0);
  const total = inUse.reduce((n, v) => n + v.size, 0);
  const idleTotal = idle.reduce((n, v) => n + v.size, 0);

  return (
    <div className="space-y-6">
      <p className="text-sm">
        {inUse.length === 0
          ? "Nessun video in uso sopra i 3,5 MB: è tutto a posto."
          : `${inUse.length} video in uso sopra i 3,5 MB, ${mb(total)} in totale.`}
        {idle.length > 0 &&
          ` Altri ${idle.length} (${mb(idleTotal)}) non sono usati da nessun progetto: non vanno compressi, si eliminano dalla sezione «Spazio occupato» qui sotto.`}
      </p>

      {inUse.length > 0 && (
        <div className="flex flex-wrap items-center gap-6">
          <button
            onClick={optimizeAll}
            disabled={busy}
            className="bg-black px-5 py-2 text-white disabled:opacity-40"
          >
            {busy ? "In corso…" : "Comprimi tutti"}
          </button>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={deleteOriginals}
              onChange={(e) => setDeleteOriginals(e.target.checked)}
              disabled={busy}
            />
            Cancella gli originali dopo la sostituzione (non si può annullare)
          </label>
        </div>
      )}

      <ul className="divide-y divide-neutral-200 bg-white">
        {[...inUse, ...idle].map((v) => (
          <li key={v.path} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{mb(v.size)}</p>
              <p className="truncate text-xs text-neutral-500">
                {v.usedIn.length ? `Usato in: ${v.usedIn.join(", ")}` : "Non usato in nessun progetto"}
                {v.tile && " · box della home (compressione leggera)"}
              </p>
              {v.state && <p className="text-xs">{v.state}</p>}
            </div>
            {v.usedIn.length > 0 ? (
              <button
                onClick={async () => {
                  setBusy(true);
                  await optimize(v);
                  setBusy(false);
                }}
                disabled={busy || v.state.startsWith("Fatto")}
                className="border border-neutral-300 px-3 py-1 disabled:opacity-40"
              >
                Comprimi
              </button>
            ) : (
              <span className="text-xs text-neutral-500">Da eliminare in «Spazio occupato» ↓</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
