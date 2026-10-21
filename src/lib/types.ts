export type MediaType = "image" | "video";

export type MediaItem = { url: string; type: MediaType; caption?: string };

export type Project = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  summary: string | null;
  body: string | null;
  cover_url: string | null;
  cover_type: MediaType;
  media: MediaItem[];
  highlight: boolean;
  published: boolean;
  sort_order: number;
};

export type SiteSettings = {
  site_name: string;
  hero_video_url: string | null;
  intro: string | null;
  about: string | null;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  linkedin: string | null;
  offices: string | null;
};
