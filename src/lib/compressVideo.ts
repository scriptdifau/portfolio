// Compressione dei video nel browser, prima del caricamento (WebCodecs, accelerata dall'hardware).
// Un video da 40 MB scende di solito a 3-6 MB. Se qualcosa non è supportato si carica l'originale.

const MAX_WIDTH = 1280; // 720p: sufficiente per la colonna centrale del sito
const VIDEO_BITRATE = 2_500_000;
const SKIP_BELOW_BYTES = 5_000_000; // già abbastanza leggero

export type CompressResult = { file: File; compressed: boolean };

export async function compressVideo(
  file: File,
  onProgress?: (percent: number) => void,
  skipBelowBytes = SKIP_BELOW_BYTES,
): Promise<CompressResult> {
  if (file.size < skipBelowBytes || typeof VideoEncoder === "undefined") {
    return { file, compressed: false };
  }
  try {
    const { BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, ALL_FORMATS } =
      await import("mediabunny");

    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const track = await input.getPrimaryVideoTrack();
    if (!track) return { file, compressed: false };

    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }), // partenza immediata sul web
      target: new BufferTarget(),
    });
    const conversion = await Conversion.init({
      input,
      output,
      video: {
        width: Math.min(MAX_WIDTH, track.displayWidth),
        bitrate: VIDEO_BITRATE,
        frameRate: 30,
      },
      audio: { bitrate: 128_000 },
    });
    if (!conversion.isValid) return { file, compressed: false };

    conversion.onProgress = (p) => onProgress?.(Math.round(p * 100));
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer || buffer.byteLength >= file.size) return { file, compressed: false };

    const name = file.name.replace(/\.[^.]+$/, "") + ".mp4";
    return { file: new File([buffer], name, { type: "video/mp4" }), compressed: true };
  } catch (err) {
    console.warn("Compressione video non riuscita, carico l'originale", err);
    return { file, compressed: false };
  }
}
