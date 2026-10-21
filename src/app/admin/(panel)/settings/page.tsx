import { SettingsForm } from "@/components/admin/SettingsForm";
import { seedSettings } from "@/lib/seed";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Impostazioni</h1>
      <SettingsForm s={(data as SiteSettings | null) ?? seedSettings} />
    </>
  );
}
