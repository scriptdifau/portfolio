"use client";

import { useActionState, useState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { Media } from "@/components/Media";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_ABOUT, DEFAULT_ABOUT_IMAGE } from "@/lib/aboutDefault";
import { bodyToHtml } from "@/lib/sanitize";
import { RichEditor } from "./RichEditor";
import { Uploader } from "./Uploader";

const input = "w-full border border-neutral-300 bg-white px-3 py-2";

function Field({
  label,
  name,
  value,
  rows,
}: {
  label: string;
  name: keyof SiteSettings;
  value: string | null;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {rows ? (
        <textarea name={name} rows={rows} defaultValue={value ?? ""} className={input} />
      ) : (
        <input name={name} defaultValue={value ?? ""} className={input} />
      )}
    </label>
  );
}

export function SettingsForm({ s }: { s: SiteSettings }) {
  const [msg, action, pending] = useActionState(saveSettings, null);
  const [hero, setHero] = useState(s.hero_video_url ?? "");
  const [about, setAbout] = useState(bodyToHtml(s.about ?? DEFAULT_ABOUT));
  const [aboutImage, setAboutImage] = useState(s.about_image_url ?? "");
  const [cv, setCv] = useState(s.cv_url ?? "");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="hero_video_url" value={hero} />
      <input type="hidden" name="about" value={about} />
      {/* foto e CV si inviano solo se modificati: così il salvataggio non dipende dalle colonne su Supabase */}
      {aboutImage !== (s.about_image_url ?? "") && (
        <input type="hidden" name="about_image_url" value={aboutImage} />
      )}
      {cv !== (s.cv_url ?? "") && <input type="hidden" name="cv_url" value={cv} />}
      <Field label="Nome del sito (logo)" name="site_name" value={s.site_name} />

      <div>
        <span className="mb-2 block text-sm font-medium">Video in home (loop, muto)</span>
        {hero && (
          <div className="mb-2 w-64">
            <Media url={hero} type="video" raw className="aspect-video w-full object-cover" />
            <button type="button" onClick={() => setHero("")} className="mt-1 text-xs text-red-600">
              Rimuovi
            </button>
          </div>
        )}
        <Uploader label="Carica video" onUploaded={(f) => setHero(f.url)} />
      </div>

      <Field label="Frase di presentazione (home)" name="intro" value={s.intro} rows={3} />
      <div>
        <span className="mb-1 block text-sm font-medium">Testo About</span>
        <RichEditor html={about} onChange={setAbout} />
      </div>
      <div>
        <span className="mb-2 block text-sm font-medium">Foto della pagina About</span>
        <div className="mb-2 w-64">
          <Media url={aboutImage || DEFAULT_ABOUT_IMAGE} type="image" raw className="aspect-[4/3] w-full object-cover" />
          {aboutImage && (
            <button type="button" onClick={() => setAboutImage("")} className="mt-1 text-xs text-red-600">
              Torna alla foto di partenza
            </button>
          )}
        </div>
        <Uploader label="Carica foto" accept="image/*" onUploaded={(f) => setAboutImage(f.url)} />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">CV (PDF) — il pulsante Download my CV compare solo se è caricato</span>
        {cv && (
          <p className="mb-2 text-sm">
            <a href={cv} target="_blank" rel="noreferrer" className="underline">
              CV caricato
            </a>{" "}
            <button type="button" onClick={() => setCv("")} className="text-xs text-red-600">
              Rimuovi
            </button>
          </p>
        )}
        <Uploader label="Carica CV (PDF)" accept="application/pdf" onUploaded={(f) => setCv(f.url)} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email" name="email" value={s.email} />
        <Field label="Telefono" name="phone" value={s.phone} />
        <Field label="Instagram (URL)" name="instagram" value={s.instagram} />
        <Field label="LinkedIn (URL)" name="linkedin" value={s.linkedin} />
      </div>
      <Field
        label='Sedi — una per riga: "Città | link Google Maps"'
        name="offices"
        value={s.offices}
        rows={3}
      />

      <div className="flex items-center gap-4">
        <button disabled={pending} className="bg-black px-6 py-2 text-white disabled:opacity-40">
          {pending ? "Salvataggio…" : "Salva"}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </form>
  );
}
