"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MediaType } from "@/lib/types";

type Props = {
  label: string;
  multiple?: boolean;
  onUploaded: (file: { url: string; type: MediaType }) => void;
};

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
    for (const file of files) {
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
