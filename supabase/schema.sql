-- Esegui questo file nel SQL Editor di Supabase (una sola volta).

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client text,
  summary text,
  body text,
  cover_url text,
  cover_type text not null default 'image' check (cover_type in ('image','video')),
  media jsonb not null default '[]'::jsonb,   -- [{url,type,caption}]
  highlight boolean not null default false,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  site_name text not null default 'Portfolio',
  hero_video_url text,
  intro text,
  about text,
  email text,
  phone text,
  instagram text,
  linkedin text,
  offices text   -- una riga per sede: "Città | link Google Maps"
);
insert into public.site_settings (id) values (1) on conflict do nothing;

alter table public.projects enable row level security;
alter table public.site_settings enable row level security;

create policy "lettura pubblica progetti" on public.projects
  for select using (published or auth.role() = 'authenticated');
create policy "scrittura admin progetti" on public.projects
  for all to authenticated using (true) with check (true);

create policy "lettura pubblica settings" on public.site_settings
  for select using (true);
create policy "scrittura admin settings" on public.site_settings
  for all to authenticated using (true) with check (true);

-- Storage per immagini e video
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict do nothing;
create policy "lettura pubblica media" on storage.objects
  for select using (bucket_id = 'media');
create policy "upload admin media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');
create policy "modifica admin media" on storage.objects
  for update to authenticated using (bucket_id = 'media');
create policy "cancella admin media" on storage.objects
  for delete to authenticated using (bucket_id = 'media');

-- Primi contenuti dalla presentazione
insert into public.projects (slug, title, client, summary, body, highlight, sort_order) values
('armani-ea7-tokyo-2020', 'Armani EA7 – Olympic Games Tokyo 2020', 'Armani EA7',
 'Una campagna globale ispirata alle sette virtù del guerriero per la Squadra Nazionale Italiana.',
 E'The first challenge was to win the pitch for one of Italy’s most iconic fashion houses, dressing the Italian National Team for the world’s biggest sporting event.\n\nThe second challenge was to bring to life an unmistakably distinctive and elegant campaign capturing Armani’s signature style in the midst of Covid - without being able to show either the uniforms or the Italian athletes themselves.\n\nThe third was to deliver it in just a few weeks, since the Olympic Games had been postponed and the new dates were announced very close to the event.\n\nTHE CREATIVE IDEA\n\nAccording to the Japanese Bushido tradition, a warrior embodies seven virtues to overcome a challenge — a philosophy rooted not only in victory, but also in ethics, discipline and moral strength. Inspired by this ancient code, we positioned EA7 as the ambassador of the seven virtues of the warrior.\n\nThrough a worldwide TV and social media campaign, EA7 celebrated these values within the Italian National Team, creating a symbolic connection between Italy and Japan, and bringing the spirit of Armani to the global stage.',
 true, 1),
('miller-genuine-draft', 'Miller Genuine Draft', 'Miller',
 'Una campagna integrata per il mercato latinoamericano costruita sul concetto di SMOOTHNESS.',
 E'Miller Genuine Draft is cold-filtered four times to preserve the beer’s original flavour and deliver its signature smooth taste.\n\nTo bring this distinctive quality to life, we developed an integrated campaign for the Latin American market, built around the concept of SMOOTHNESS.\n\nThe campaign included a TV commercial, a series of posters and an immersive experiential event, inviting consumers to discover and experience smoothness in a whole new way.',
 true, 2),
('skillathletic-technogym', 'Skillathletic – Technogym', 'Technogym',
 'Brand identity e campagna 360° per il metodo di allenamento ispirato agli atleti olimpici.',
 E'We launched SKILLATHLETIC, an athletic training method and programme developed by Technogym and inspired by the training techniques of professional and Olympic athletes.\n\nI worked on the development of the brand identity and the 360° integrated campaign, spanning TV commercials, print advertising, in-gym posters and a dedicated app, ensuring a consistent brand experience across all touchpoints.',
 true, 3)
on conflict (slug) do nothing;
