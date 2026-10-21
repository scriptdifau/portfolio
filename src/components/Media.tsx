import type { MediaType } from "@/lib/types";

type Props = { url: string; type: MediaType; alt?: string; className?: string };

export function Media({ url, type, alt = "", className = "" }: Props) {
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
