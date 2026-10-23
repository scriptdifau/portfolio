import type { MediaType } from "@/lib/types";
import { AutoPlayVideo } from "./AutoPlayVideo";

type Props = {
  url: string;
  type: MediaType;
  alt?: string;
  className?: string;
  // "player": video della pagina del post, con controlli, parte da solo (muto) quando è visibile. Di default: loop muto (tile).
  player?: boolean;
};

export function Media({ url, type, alt = "", className = "", player }: Props) {
  if (type === "video" && player) {
    return <AutoPlayVideo url={url} className={className} />;
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
