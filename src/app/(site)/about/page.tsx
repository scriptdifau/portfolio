import type { Metadata } from "next";
import { RichText } from "@/components/RichText";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "About" };

export default async function About() {
  const { about } = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-10 text-4xl font-light sm:text-5xl">About</h1>
      {about && <RichText text={about} />}
    </div>
  );
}
