// Testo semplice: paragrafi separati da riga vuota; una riga tutta MAIUSCOLA diventa sottotitolo.
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-5 text-lg leading-relaxed">
      {blocks.map((b, i) => {
        const isHeading = b.length < 60 && b === b.toUpperCase() && /[A-Z]/.test(b);
        return isHeading ? (
          <h3 key={i} className="pt-6 text-sm font-semibold uppercase tracking-widest">
            {b}
          </h3>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {b}
          </p>
        );
      })}
    </div>
  );
}
