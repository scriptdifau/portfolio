// Scelta della versione di una foto da mostrare.
// - File nella cartella "web" dell'archivio: sono già ridimensionati in tre misure, preparate una volta sola:
//   <nome>-s.webp (640 px), <nome>-m.webp (1280 px), <nome>-l.webp (2000 px). Nel sito è salvato l'indirizzo "-l";
//   qui si sceglie la misura giusta in base alla larghezza richiesta. Nessun servizio di ridimensionamento, nessun costo.
// - Altri file (caricamenti futuri): li ridimensiona Supabase al volo (piano Pro, 100 foto al mese incluse).
const PUBLIC = "/storage/v1/object/public/";
const RENDER = "/storage/v1/render/image/public/";
const WEB = /^(.*\/media\/web\/[^/]+)-l\.webp$/;

export function supabaseImageUrl(src: string, width: number, quality = 75): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !src.startsWith(`${base}${PUBLIC}`)) return null;

  const web = WEB.exec(src);
  if (web) {
    const size = width <= 640 ? "s" : width <= 1280 ? "m" : "l";
    return `${web[1]}-${size}.webp`;
  }

  const path = src.slice(`${base}${PUBLIC}`.length);
  return `${base}${RENDER}${path}?width=${width}&quality=${quality}`;
}

// Loader di next/image (vedi next.config.ts)
export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const url = supabaseImageUrl(src, width, quality ?? 75);
  if (url) return url;
  // file locali o esterni (es. /about.jpg): restano così come sono
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
