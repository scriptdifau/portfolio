"use client";

import { useEffect, useRef, useState } from "react";

// Video in loop dei box (e del video in cima alla home).
// - autoplay (file leggero): il file si scarica solo quando il box sta per entrare nello schermo, parte da solo e si ferma quando esce.
// - altrimenti (file pesante o peso sconosciuto): si carica solo il primo fotogramma e il video resta fermo,
//   così le visite non scaricano decine di MB. Comprimendo il video da /admin/optimize torna a partire da solo.
export function TileVideo({
  url,
  className,
  autoplay = false,
}: {
  url: string;
  className?: string;
  autoplay?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          if (autoplay) video.play().catch(() => {});
        } else if (autoplay) {
          video.pause();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoplay]);

  return (
    <video
      ref={ref}
      // #t=0.001: mostra il primo fotogramma senza scaricare il video
      src={load ? (autoplay ? url : `${url}#t=0.001`) : undefined}
      className={className}
      autoPlay={autoplay}
      muted
      loop={autoplay}
      playsInline
      preload={autoplay ? "none" : "metadata"}
    />
  );
}
