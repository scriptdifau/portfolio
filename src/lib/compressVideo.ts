// Compressione dei video nel browser, prima del caricamento (WebCodecs, accelerata dall'hardware).
// Un video da 40 MB scende di solito a 3-6 MB. Se qualcosa non è supportato si carica l'originale.

// "full": video nelle pagine dei progetti (720p). "tile": box della home, piccoli e senza audio (640 px, circa 3 MB ogni 30 s).
export type VideoPreset = "full" | "tile";
const PRESETS = {
  full: { width: 1280, bitrate: 2_500_000, fps: 30, audio: true, skipBelow: 5_000_000 },
  tile: { width: 640, bitrate: 800_000, fps: 24, audio: false, skipBelow: 1_500_000 },
} as const;

export type CompressResult = { file: File; compressed: boolean };

export async function compressVideo(
  file: File,
  onProgress?: (percent: number) => void,
  opts: { preset?: VideoPreset; skipBelowBytes?: number } = {},
): Promise<CompressResult> {
  const preset = PRESETS[opts.preset ?? "full"];
  if (file.size < (opts.skipBelowBytes ?? preset.skipBelow) || typeof VideoEncoder === "undefined") {
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
        width: Math.min(preset.width, track.displayWidth),
        bitrate: preset.bitrate,
        frameRate: preset.fps,
      },
      audio: preset.audio ? { bitrate: 128_000 } : { discard: true },
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
