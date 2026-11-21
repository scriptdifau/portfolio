import { UnusedFiles } from "@/components/admin/UnusedFiles";
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

      <h2 className="mb-2 mt-14 text-xl font-semibold">Spazio occupato</h2>
      <p className="mb-6 text-sm text-neutral-600">
        Il piano gratuito include 1 GB di archivio. Qui trovi i file che nessun progetto usa più, per esempio i
        vecchi originali dei video già compressi, e puoi eliminarli per liberare spazio.
      </p>
      <UnusedFiles />
    </>
  );
}
