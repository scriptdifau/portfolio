// Miniatura leggera di una foto su Supabase, servita dall'ottimizzatore di immagini di Next
// (le anteprime dell'admin non devono scaricare le foto a piena risoluzione).
// `w` deve essere una delle larghezze previste da Next: 64, 96, 128, 256, 384…
export function thumbUrl(url: string, w = 256): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !url.startsWith(`${base}/storage/`)) return url;
  if (/\.gif($|\?)/i.test(url)) return url; // le GIF animate non si ridimensionano
  return `/_next/image?url=${encodeURIComponent(url)}&w=${w}&q=75`;
}
