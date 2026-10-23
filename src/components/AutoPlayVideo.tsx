"use client";

import { useEffect, useRef } from "react";

// Parte da solo (muto, come richiedono i browser) quando è visibile e si ferma quando esce dallo schermo.
// I controlli restano: chi vuole l'audio lo attiva da lì.
export function AutoPlayVideo({ url, className }: { url: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={url}
      className={className}
      muted
      loop
      controls
      playsInline
      preload="metadata"
    />
  );
}
