import { supabaseImageUrl } from "@/lib/imageLoader";
import { bodyToHtml, sanitizeBody } from "@/lib/sanitize";

// Il testo arriva dall'editor dell'admin (HTML) o è un vecchio testo semplice: in entrambi i casi
// viene ripulito prima di essere mostrato.
// Le foto dentro il testo passano dal ridimensionamento di Supabase (1200 px, WebP).
function optimizeImages(html: string) {
  return html.replace(/<img([^>]*?) src="([^"]+)"/g, (match, before: string, src: string) => {
    const url = supabaseImageUrl(src.replace(/&amp;/g, "&"), 1200);
    return url ? `<img${before} src="${url.replace(/&/g, "&amp;")}"` : match;
  });
}

const dropEmptyParagraphs = (html: string) => html.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/g, "");

export function RichText({ text, className = "post-body" }: { text: string; className?: string }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: dropEmptyParagraphs(optimizeImages(sanitizeBody(bodyToHtml(text)))) }}
    />
  );
}
