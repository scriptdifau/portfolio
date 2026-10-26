import Image from "next/image";
import type { MediaType } from "@/lib/types";
import { AutoPlayVideo } from "./AutoPlayVideo";
import { TileVideo } from "./TileVideo";

type Props = {
  url: string;
  type: MediaType;
  alt?: string;
  className?: string;
  // "player": video della pagina del post, con controlli, parte da solo (muto) quando è visibile. Di default: loop muto (tile).
  player?: boolean;
  // Immagine che riempie il box genitore (che deve essere `relative` e avere dimensioni).
  fill?: boolean;
  // Larghezza reale a schermo, per far scaricare al browser solo la versione che serve.
  sizes?: string;
  // Anteprime dell'admin: nessuna ottimizzazione, i video non si scaricano finché non li avvii.
  raw?: boolean;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const optimizable = (url: string) => Boolean(supabaseUrl) && url.startsWith(`${supabaseUrl}/storage/`);

export function Media({ url, type, alt = "", className = "", player, fill, sizes, raw }: Props) {
  if (type === "video") {
    if (raw) return <video src={url} className={className} controls preload="none" playsInline />;
    if (player) return <AutoPlayVideo url={url} className={className} />;
    return <TileVideo url={url} className={className} />;
  }

  if (raw || !optimizable(url)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} loading="lazy" className={className} />;
  }

  // Le foto passano dall'ottimizzatore: ridimensionate, in WebP/AVIF e messe in cache (1 anno),
  // così Supabase le serve una volta sola invece che a ogni visita.
  if (fill) {
    return <Image src={url} alt={alt} fill sizes={sizes ?? "100vw"} className={className} />;
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={0}
      height={0}
      sizes={sizes ?? "100vw"}
      className={className}
      style={{ width: "100%", height: "auto" }}
    />
  );
}
