import FadeUp from "@/components/article/FadeUp";

/**
 * Publication logos for "Featured on" on the About / story page.
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
    <FadeUp as="section" className="not-prose my-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
        {PUBLICATIONS.map((pub) => {
          const inner = (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pub.logoUrl}
              alt={`${pub.name} logo`}
              loading="lazy"
              className="max-h-12 md:max-h-14 w-auto object-contain opacity-70 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-200"
            />
          );
          return (
            <div
              key={pub.name}
              className="group flex items-center justify-center rounded-lg border border-corbeau/8 bg-paper py-5 px-4 hover:border-papaya/40 transition-colors"
            >
              {pub.href ? (
                <a
                  href={pub.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${pub.name} — view profile`}
                  className="flex items-center justify-center"
                >
                  {inner}
                </a>
              ) : (
                inner
              )}
            </div>
          );
        })}
      </div>
    </FadeUp>
  );
}
