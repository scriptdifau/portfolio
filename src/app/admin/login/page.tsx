"use client";

import { useActionState } from "react";
import { login } from "../actions";

const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default function LoginPage() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <form action={action} className="w-full max-w-sm space-y-4 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold">Area riservata</h1>
        {!configured && (
          <p className="bg-amber-50 p-3 text-sm text-amber-900">
            Supabase non è configurato. Copia <code>.env.example</code> in <code>.env.local</code>,
            inserisci URL e chiave del progetto e riavvia il server.
          </p>
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-neutral-300 px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full border border-neutral-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={pending || !configured}
          className="w-full bg-black py-2 text-white disabled:opacity-40"
        >
          {pending ? "Accesso…" : "Entra"}
        </button>
      </form>
    </div>
  );
}
