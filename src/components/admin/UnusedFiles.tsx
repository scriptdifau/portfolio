"use client";

import { useCallback, useEffect, useState } from "react";
import { refreshContent } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";

type FileInfo = { path: string; size: number; mime: string; created: string };

const MB = 1_000_000;
const SAFE_HOURS = 24; // i file caricati da meno di 24 ore non si toccano: potrebbero essere in una bozza non ancora salvata
const mb = (n: number) => `${(n / MB).toFixed(1)} MB`;

// Archivio: trova i file che nessun progetto usa (vecchi originali dei video già compressi, immagini sostituite,
// prove) e li elimina su richiesta. Un file è "usato" se il suo nome compare in progetti, testi, copertine, video della home, About o CV.
export function UnusedFiles() {
  const [unused, setUnused] = useState<FileInfo[] | null>(null);
  const [recent, setRecent] = useState(0);
  const [total, setTotal] = useState({ files: 0, bytes: 0 });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const bucket = supabase.storage.from("media");

    const top = await bucket.list("", { limit: 1000 });
    if (top.error) return setError(top.error.message);
    const files: FileInfo[] = [];
    for (const entry of top.data) {
      const isFolder = entry.id === null;
      const list = isFolder ? await bucket.list(entry.name, { limit: 1000 }) : { data: [entry] };
      for (const f of list.data ?? []) {
        if (f.id === null) continue;
        files.push({
          path: isFolder ? `${entry.name}/${f.name}` : f.name,
          size: Number(f.metadata?.size ?? 0),
          mime: String(f.metadata?.mimetype ?? ""),
          created: String(f.created_at ?? ""),
        });
      }
    }

    const [{ data: projects, error: pe }, { data: settings, error: se }] = await Promise.all([
      supabase.from("projects").select("cover_url, media, body"),
      supabase.from("site_settings").select("hero_video_url, about, about_image_url, cv_url").eq("id", 1).maybeSingle(),
    ]);
    // se non riesco a leggere i riferimenti non propongo nulla: meglio non cancellare che cancellare per errore
    if (pe || se || !projects) return setError(pe?.message ?? se?.message ?? "Non riesco a leggere i progetti.");

    const haystack = JSON.stringify([projects, settings]);
    const cutoff = Date.now() - SAFE_HOURS * 3600_000;
    const candidates = files.filter((f) => !haystack.includes(f.path));
    setUnused(candidates.filter((f) => !f.created || new Date(f.created).getTime() < cutoff).sort((a, b) => b.size - a.size));
    setRecent(candidates.filter((f) => f.created && new Date(f.created).getTime() >= cutoff).length);
    setTotal({ files: files.length, bytes: files.reduce((n, f) => n + f.size, 0) });
  }, []);

  useEffect(() => {
    // caricamento iniziale dell'elenco
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function removeAll() {
    if (!unused || unused.length === 0) return;
    const bytes = unused.reduce((n, f) => n + f.size, 0);
    const ok = window.confirm(
      `Elimino DEFINITIVAMENTE ${unused.length} file non usati (${mb(bytes)}). Non si può annullare: se ti servono ancora gli originali, tienili sul tuo computer. Procedo?`,
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const bucket = createClient().storage.from("media");
    const paths = unused.map((f) => f.path);
    let done = 0;
    let failed = false;
    for (let i = 0; i < paths.length; i += 50) {
      const chunk = paths.slice(i, i + 50);
      const { error: err } = await bucket.remove(chunk);
      if (err) {
        setError(`Fermato dopo ${done} file: ${err.message}`);
        failed = true;
        break;
      }
      done += chunk.length;
      setStatus(`Eliminati ${done} di ${paths.length}…`);
    }
    await refreshContent();
    setStatus(failed ? null : `Fatto: eliminati ${done} file.`);
    setBusy(false);
    await load();
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!unused) return <p className="text-sm text-neutral-500">Controllo l&apos;archivio…</p>;

  const unusedBytes = unused.reduce((n, f) => n + f.size, 0);

  return (
    <div className="space-y-4">
      <p className="text-sm">
        L&apos;archivio contiene {total.files} file ({mb(total.bytes)}). Non usati da nessun progetto: <strong>{unused.length}</strong>{" "}
        ({mb(unusedBytes)}).
        {recent > 0 && ` Altri ${recent} sono stati caricati da meno di 24 ore e non vengono toccati.`}
      </p>
      {unused.length > 0 && (
        <>
          <button
            onClick={removeAll}
            disabled={busy}
            className="bg-red-600 px-5 py-2 text-white disabled:opacity-40"
          >
            {busy ? "Eliminazione…" : `Elimina i ${unused.length} file non usati (${mb(unusedBytes)})`}
          </button>
          <ul className="max-h-72 divide-y divide-neutral-200 overflow-y-auto bg-white text-xs">
            {unused.map((f) => (
              <li key={f.path} className="flex justify-between gap-4 px-3 py-1.5">
                <span className="truncate">{f.path}</span>
                <span className="shrink-0 text-neutral-500">
                  {f.mime.split("/")[0]} · {mb(f.size)} · {f.created.slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      {status && <p className="text-sm">{status}</p>}
    </div>
  );
}
