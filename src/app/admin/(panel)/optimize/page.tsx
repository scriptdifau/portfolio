import { VideoOptimizer } from "@/components/admin/VideoOptimizer";

export default function OptimizePage() {
  return (
    <>
      <h1 className="mb-2 text-2xl font-semibold">Ottimizza video</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Comprime i video già caricati (720p) e aggiorna da solo i progetti che li usano. Funziona nel tuo
        browser: tieni la scheda aperta finché ha finito. Meglio da Chrome o Edge.
      </p>
      <VideoOptimizer />
    </>
  );
}
