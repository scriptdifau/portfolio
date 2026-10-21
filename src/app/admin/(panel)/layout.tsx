import Link from "next/link";
import { logout } from "../actions";

export const metadata = { title: "Admin", robots: { index: false } };

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 text-sm">
        <nav className="flex gap-6">
          <Link href="/admin" className="font-semibold">
            Progetti
          </Link>
          <Link href="/admin/settings">Impostazioni</Link>
          <Link href="/" target="_blank" className="text-neutral-500">
            Vedi sito ↗
          </Link>
        </nav>
        <form action={logout}>
          <button className="text-neutral-500 hover:text-black">Esci</button>
        </form>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
