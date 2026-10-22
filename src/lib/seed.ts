import type { Project, SiteSettings } from "./types";

// Dati di esempio usati finché Supabase non è configurato.
export const seedSettings: SiteSettings = {
  site_name: "Portfolio",
  hero_video_url: null,
  intro: "Creative work for brands, campaigns and ideas that move people.",
  about: "Scrivi qui la tua presentazione dal pannello /admin → Impostazioni.",
  email: null,
  phone: null,
  instagram: null,
  linkedin: null,
  offices: null,
};

const base = { client: null, cover_url: null, cover_type: "image" as const, tile_shape: "square" as const, media: [], published: true };

export const seedProjects: Project[] = [
  {
    ...base,
    id: "1",
    slug: "armani-ea7-tokyo-2020",
    title: "Armani EA7 – Olympic Games Tokyo 2020",
    client: "Armani EA7",
    highlight: true,
    sort_order: 1,
    summary: "A global campaign inspired by the seven virtues of the warrior.",
    body: "The first challenge was to win the pitch for one of Italy’s most iconic fashion houses.\n\nTHE CREATIVE IDEA\n\nInspired by the Bushido code, we positioned EA7 as the ambassador of the seven virtues of the warrior.",
  },
  {
    ...base,
    id: "2",
    slug: "miller-genuine-draft",
    title: "Miller Genuine Draft",
    client: "Miller",
    highlight: true,
    sort_order: 2,
    summary: "An integrated campaign built around the concept of SMOOTHNESS.",
    body: "Miller Genuine Draft is cold-filtered four times to preserve the beer’s original flavour.",
  },
  {
    ...base,
    id: "3",
    slug: "skillathletic-technogym",
    title: "Skillathletic – Technogym",
    client: "Technogym",
    highlight: true,
    sort_order: 3,
    summary: "Brand identity and 360° campaign for an Olympic-inspired training method.",
    body: "We launched SKILLATHLETIC, an athletic training method developed by Technogym.",
  },
];
