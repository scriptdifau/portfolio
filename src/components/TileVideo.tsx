"use client";

import { useEffect, useRef, useState } from "react";

// Video delle tile: il file si scarica solo quando il box sta per entrare nello schermo
// (i box nascosti della griglia non scelta, o molto in basso, non consumano banda) e si ferma quando esce.
export function TileVideo({ url, className }: { url: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={load ? url : undefined}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
    />
  );
}
