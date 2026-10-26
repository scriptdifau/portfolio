import { bodyToHtml, sanitizeBody } from "@/lib/sanitize";

// Il testo arriva dall'editor dell'admin (HTML) o è un vecchio testo semplice: in entrambi i casi
// viene ripulito prima di essere mostrato.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// Le foto dentro il testo passano dall'ottimizzatore di immagini (ridimensionate e in cache).
function optimizeImages(html: string) {
  if (!supabaseUrl) return html;
  const prefix = `${supabaseUrl}/storage/`;
  return html.replace(/<img([^>]*?) src="([^"]+)"/g, (match, before: string, src: string) => {
    const url = src.replace(/&amp;/g, "&");
    if (!url.startsWith(prefix)) return match;
    return `<img${before} src="/_next/image?url=${encodeURIComponent(url)}&amp;w=1200&amp;q=75"`;
  });
}

export function RichText({ text }: { text: string }) {
  return (
    <div
      className="post-body"
      dangerouslySetInnerHTML={{ __html: optimizeImages(sanitizeBody(bodyToHtml(text))) }}
    />
  );
}
