import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "About" };

export default async function About() {
  const { about } = await getSettings();
  return (
    <article className="post-column px-4 pb-12 pt-6 sm:px-0 md:pt-10">
      <h1 className="post-title">About</h1>
      {about && <RichText text={about} />}
    </article>
  );
}
