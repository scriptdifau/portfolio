"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MediaType } from "@/lib/types";

type Props = {
  label: string;
  multiple?: boolean;
  onUploaded: (file: { url: string; type: MediaType }) => void;
};

const MAX_SIDE = 2400;
const VIDEO_WARN_MB = 20;

// Le foto JPEG più grandi di 2400 px (o oltre 1 MB) vengono ridimensionate prima del caricamento:
// le foto da fotocamera pesano 3-20 MB e consumerebbero molta banda ogni volta che qualcuno visita il sito.
async function shrinkJpeg(file: File): Promise<File> {
  if (file.type !== "image/jpeg") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1_000_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? new File([blob], file.name, { type: "image/jpeg" }) : file;
  } catch {
    return file;
  }
}

// Carica direttamente da browser su Supabase Storage (nessun limite di body del server).
export function Uploader({ label, multiple, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    for (const original of files) {
      const file = await shrinkJpeg(original);
      if (file.type.startsWith("video") && file.size > VIDEO_WARN_MB * 1_000_000) {
        setError(
          `${file.name} pesa ${Math.round(file.size / 1_000_000)} MB: caricato, ma conviene comprimerlo (es. HandBrake, "Web Optimized") per non consumare il traffico di Supabase.`,
        );
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const { error: err } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (err) {
        setError(`${file.name}: ${err.message}`);
        continue;
      }
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      onUploaded({
        url: data.publicUrl,
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }
    setBusy(false);
  }

  return (
    <div>
      <label className="inline-block cursor-pointer border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100">
        {busy ? "Caricamento…" : label}
        <input
          type="file"
          accept="image/*,video/*"
          multiple={multiple}
          disabled={busy}
          onChange={onChange}
          className="hidden"
        />
      </label>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
