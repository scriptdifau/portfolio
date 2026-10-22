import { bodyToHtml, sanitizeBody } from "@/lib/sanitize";

// Il testo arriva dall'editor dell'admin (HTML) o è un vecchio testo semplice: in entrambi i casi
// viene ripulito prima di essere mostrato.
export function RichText({ text }: { text: string }) {
  return (
    <div
      className="post-body"
      dangerouslySetInnerHTML={{ __html: sanitizeBody(bodyToHtml(text)) }}
    />
  );
}
