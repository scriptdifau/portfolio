// Soglie di peso oltre le quali un video NON parte da solo: si vede un fotogramma fermo e si scarica solo se lo avvii.
// Un video leggero parte da solo come prima; uno pesante non consuma il traffico di tutte le visite.
export const TILE_MAX_BYTES = 4_000_000; // box della home (piccoli, in loop)
export const HERO_MAX_BYTES = 8_000_000; // video in cima alla home
export const GALLERY_MAX_BYTES = 10_000_000; // video nelle pagine dei progetti

export function canAutoplay(bytes: number | null | undefined, max: number): boolean {
  return typeof bytes === "number" && bytes > 0 && bytes <= max;
}
