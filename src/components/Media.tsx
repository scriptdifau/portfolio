import type { MediaType } from "@/lib/types";

type Props = {
  url: string;
  type: MediaType;
  alt?: string;
  className?: string;
  // "player": video con controlli, parte al click (pagina del post). Di default: loop muto (tile).
  player?: boolean;
};

export function Media({ url, type, alt = "", className = "", player }: Props) {
  if (type === "video" && player) {
    return <video src={url} className={className} controls playsInline preload="metadata" />;
  }
  if (type === "video") {
    return (
      <video
        src={url}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} loading="lazy" className={className} />;
}
