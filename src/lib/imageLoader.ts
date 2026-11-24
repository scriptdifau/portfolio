// Ridimensionamento delle foto: lo fa Supabase (piano Pro, trasformazioni incluse), non Vercel.
// Una foto da 3-30 MB arriva al browser da poche centinaia di KB (WebP), e le GIF animate restano animate.
// Il risultato è tenuto in cache dalla rete di Supabase per un anno.
const PUBLIC = "/storage/v1/object/public/";
const RENDER = "/storage/v1/render/image/public/";

export function supabaseImageUrl(src: string, width: number, quality = 75): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !src.startsWith(`${base}${PUBLIC}`)) return null;
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
