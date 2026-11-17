import type { Metadata } from "next";
import Image from "next/image";
import { RichText } from "@/components/RichText";
import { DEFAULT_ABOUT, DEFAULT_ABOUT_IMAGE } from "@/lib/aboutDefault";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "About" };

export default async function About() {
  const { about, about_image_url, cv_url } = await getSettings();
  const photo = about_image_url || DEFAULT_ABOUT_IMAGE;

  return (
    <article className="post-column px-4 pb-12 pt-6 sm:px-0 md:pt-10">
      <div className="about-hero">
        <div className="about-photo">
          <Image
            src={photo}
            alt=""
            fill
            priority
            sizes="(min-width: 1100px) 27vw, (min-width: 768px) 40vw, 78vw"
            className="object-cover"
          />
        </div>
        <div className="about-block">
          <RichText text={about || DEFAULT_ABOUT} className="about-copy" />
          {cv_url && (
            <a href={cv_url} target="_blank" rel="noreferrer" className="about-cv">
              Download my CV
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
