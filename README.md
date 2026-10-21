# Portfolio

Sito portfolio (ispirato a whambrands.com) con pannello di gestione contenuti.
Stack: Next.js 16 + Tailwind + Supabase (database, login, storage per immagini/video).

## Setup

1. Crea un progetto su [supabase.com](https://supabase.com).
2. Nel **SQL Editor** esegui `supabase/schema.sql` (tabelle, permessi, bucket `media`, 3 progetti di esempio).
3. In **Authentication → Users** crea il tuo utente admin (email + password).
   In **Authentication → Sign In / Providers** disattiva "Allow new users to sign up".
4. Copia `.env.example` in `.env.local` e inserisci URL e anon/publishable key (Project Settings → API).
5. `npm install && npm run dev` → sito su http://localhost:3000, admin su http://localhost:3000/admin.

## Uso

- `/admin` → crea/modifica progetti (testo, copertina, galleria, highlight, ordine, bozza/pubblicato).
- `/admin/settings` → nome del sito, video in home, frase di presentazione, About, contatti, sedi.
- Immagini, GIF e video si caricano direttamente su Supabase Storage (piano gratuito: max 50 MB per file).

Senza `.env.local` il sito mostra dati di esempio e l'admin è disattivato.

## Deploy

Vercel: importa il repo e aggiungi le due variabili d'ambiente.
