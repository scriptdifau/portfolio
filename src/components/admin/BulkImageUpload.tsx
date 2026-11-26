"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Failure = { name: string; message: string };

// Carica in blocco le immagini già ridimensionate (cartella "immagini-ottimizzate") nella cartella "web" dell'archivio.
// Si usa una sola volta: poi i progetti vengono puntati ai nuovi file e gli originali si eliminano da "Spazio occupato".
export function BulkImageUpload() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [summary, setSummary] = useState<string | null>(null);

  async function start(files: File[]) {
    const images = files.filter((f) => f.name.toLowerCase().endsWith(".webp"));
    if (images.length === 0) return setSummary("Nessun file .webp selezionato.");
    setBusy(true);
    setSummary(null);
    setFailures([]);
    setDone(0);
    setTotal(images.length);

    const bucket = createClient().storage.from("media");
    const failed: Failure[] = [];
    let ok = 0;
    let next = 0;

    async function worker() {
      while (next < images.length) {
        const file = images[next++];
        const { error } = await bucket.upload(`web/${file.name}`, file, {
          upsert: true,
          cacheControl: "31536000",
          contentType: "image/webp",
        });
        if (error) failed.push({ name: file.name, message: error.message });
        else ok++;
        setDone(ok + failed.length);
      }
    }
    await Promise.all([worker(), worker(), worker(), worker()]);

    setFailures(failed);
    setSummary(`Caricati ${ok} file su ${images.length}.${failed.length ? ` Errori: ${failed.length}.` : ""}`);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  return (
    <div className="space-y-3">
      <label className="inline-block cursor-pointer border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-neutral-100">
        {busy ? `Caricamento… ${done} / ${total}` : "Scegli i file .webp da caricare"}
        <input
          ref={input}
          type="file"
          accept="image/webp"
          multiple
          disabled={busy}
          onChange={(e) => start(Array.from(e.target.files ?? []))}
          className="hidden"
        />
      </label>
      {busy && (
        <div className="h-2 w-full max-w-md bg-neutral-200">
          <div className="h-2 bg-black" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </div>
      )}
      {summary && <p className="text-sm">{summary}</p>}
      {failures.length > 0 && (
        <ul className="max-h-48 overflow-y-auto bg-white p-3 text-xs text-red-600">
          {failures.map((f) => (
            <li key={f.name}>
              {f.name}: {f.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
