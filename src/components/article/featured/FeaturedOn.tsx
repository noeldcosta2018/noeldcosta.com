import FadeUp from "@/components/article/FadeUp";

/**
 * Publication logos for "Featured on" on the About / story page. Logos sit
 * on light plates in both themes because the source files are dark marks.
 * Replaces the WordPress-import gallery that had empty <img src=""> and
 * <img data-src="..."> tags producing broken duplicates. Renders the
 * six known publications, once each, with descriptive alt text and a
 * link out to each property where I have a profile or article.
 */

interface Publication {
  name: string;
  logoUrl: string;
  href?: string;
}

const PUBLICATIONS: Publication[] = [
  {
    name: "SAP Press",
    logoUrl: "/images/wp/2025/02/3__6_-removebg-preview.webp",
  },
  {
    name: "LinkedIn",
    logoUrl: "/images/wp/2025/02/4__1_-removebg-preview.webp",
    href: "https://www.linkedin.com/in/noeldcosta/",
  },
  {
    name: "MSN",
    logoUrl: "/images/wp/2025/02/5__2_-removebg-preview.webp",
  },
  {
    name: "IPS",
    logoUrl: "/images/wp/2025/02/1__1_-removebg-preview.webp",
  },
  {
    name: "Techbullion",
    logoUrl: "/images/wp/2025/02/2__4_-removebg-preview.webp",
  },
  {
    name: "The Next Disruption",
    logoUrl: "/images/wp/2025/02/image-25.webp",
  },
];

export default function FeaturedOn() {
  return (
    <FadeUp as="section" className="not-prose nd-block nd-featured">
      {PUBLICATIONS.map((pub) => {
        const logo = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pub.logoUrl} alt={`${pub.name} logo`} loading="lazy" />
        );
        return pub.href ? (
          <a
            key={pub.name}
            className="tile"
            href={pub.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${pub.name}: view profile`}
          >
            {logo}
          </a>
        ) : (
          <div key={pub.name} className="tile">
            {logo}
          </div>
        );
      })}
    </FadeUp>
  );
}
