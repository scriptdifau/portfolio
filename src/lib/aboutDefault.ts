// Foto e testo di partenza della pagina About. Si cambiano da /admin → Impostazioni:
// finché lì non c'è niente di salvato, la pagina usa questi.
export const DEFAULT_ABOUT_IMAGE = "/about.jpg";

export const DEFAULT_ABOUT = [
  "Hello!<br>I’m an ideas-based Creative Director and Art Director creating integrated 360° campaigns across digital, ATL and BTL.",
  "My work spans brand identity, film, social, website, experiential and out-of-home, combining strong concepts with thoughtful design and attention to craft.<br>I’m equally comfortable leading multidisciplinary teams and getting hands-on with art direction, design and copy, taking projects from the first spark of an idea through to final execution.",
  "I’ve worked with leading agencies including TBWA, Leo Burnett, LOWE and Publicis, alongside independent agencies and creative studios such as TMW, WHAM, Nucco Brain and Dolci Adv. I also partner with startups and work directly with brands.",
  "With experience in both Milan and London, I draw on the distinct creative perspectives and working cultures of both cities.",
  "Outside of agency life, I design and make toys, explore art in its many forms, and travel whenever I can. Experiencing different places and cultures feeds my curiosity and brings fresh perspectives to my work.",
]
  .map((p) => `<p>${p}</p>`)
  .join("");
