import { supabaseImageUrl } from "./imageLoader";

// Miniatura leggera di una foto su Supabase (le anteprime dell'admin non devono scaricare le foto a piena risoluzione).
export function thumbUrl(url: string, w = 256): string {
  return supabaseImageUrl(url, w) ?? url;
}
