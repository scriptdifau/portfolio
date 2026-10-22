import sanitizeHtml from "sanitize-html";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// I vecchi testi (testo semplice) diventano HTML: paragrafi su riga vuota, righe TUTTE MAIUSCOLE = sottotitolo.
export function bodyToHtml(body: string | null | undefined): string {
  const text = (body ?? "").trim();
  if (!text) return "";
  if (text.startsWith("<")) return text;
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) =>
      b.length < 60 && b === b.toUpperCase() && /[A-Z]/.test(b)
        ? `<h3>${escape(b)}</h3>`
        : `<p>${escape(b).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
}

export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "h4", "strong", "em", "u", "s", "blockquote",
      "ul", "ol", "li", "a", "img", "video", "hr",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "data-size", "data-align"],
      video: ["src", "data-size", "data-align", "autoplay", "muted", "loop", "playsinline"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
