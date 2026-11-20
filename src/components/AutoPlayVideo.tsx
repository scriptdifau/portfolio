"use client";

import { useEffect, useRef } from "react";

// Video delle pagine dei progetti: parte da solo (muto, come richiedono i browser) quando è ben visibile.
// Ne parte UNO alla volta, il più visibile: più video in contemporanea fanno fallire la riproduzione su iPhone
// e consumano dati. Se l'utente tocca un video lo gestisce da solo (play/pausa dai controlli).
const ratios = new Map<HTMLVideoElement, number>();
const manual = new WeakSet<HTMLVideoElement>();
let observer: IntersectionObserver | null = null;

function refresh() {
  let best: HTMLVideoElement | null = null;
  let bestRatio = 0.35; // soglia minima di visibilità
  for (const [video, ratio] of ratios) {
    if (!manual.has(video) && ratio > bestRatio) {
      best = video;
      bestRatio = ratio;
    }
  }
  for (const video of ratios.keys()) {
    if (manual.has(video)) continue;
    if (video === best) {
      if (video.paused) video.play().catch(() => {});
    } else if (!video.paused) {
      video.pause();
    }
  }
}

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const video = e.target as HTMLVideoElement;
        if (e.isIntersecting) ratios.set(video, e.intersectionRatio);
        else ratios.delete(video);
        if (!e.isIntersecting && !manual.has(video)) video.pause();
      }
      refresh();
    },
    { threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1] },
  );
  return observer;
}

export function AutoPlayVideo({
  url,
  className,
  autoplay = false,
}: {
  url: string;
  className?: string;
  autoplay?: boolean; // false = file pesante: resta fermo (primo fotogramma) finché non lo avvii tu
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const retried = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || !autoplay) return;
    const obs = getObserver();
    obs.observe(video);
    return () => {
      obs.unobserve(video);
      ratios.delete(video);
    };
  }, [autoplay]);

  return (
    <video
      ref={ref}
      // #t=0.001: su iPhone mostra il primo fotogramma invece di un riquadro nero
      src={`${url}#t=0.001`}
      className={className}
      muted
      loop
      controls
      playsInline
      preload="metadata"
      onPointerDown={(e) => manual.add(e.currentTarget)}
      onError={(e) => {
        // un solo nuovo tentativo se il caricamento si interrompe (rete mobile)
        if (retried.current) return;
        retried.current = true;
        const video = e.currentTarget;
        setTimeout(() => video.load(), 1500);
      }}
    />
  );
}
