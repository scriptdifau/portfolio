import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getProjects, getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  return (
    <>
      <Header siteName={settings.site_name} projects={projects} linkedin={settings.linkedin} />
      <main className="flex-1 pt-16">{children}</main>
      <Footer s={settings} />
    </>
  );
}
