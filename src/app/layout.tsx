import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Clarity City (VMware, licenza SIL OFL): Medium per i testi, Bold per titoli e sottotitoli.
const clarity = localFont({
  src: [
    { path: "../fonts/ClarityCity-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ClarityCity-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-clarity",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Creative portfolio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${clarity.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
