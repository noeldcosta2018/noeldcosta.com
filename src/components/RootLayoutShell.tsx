import LanguageSwitcher from "@/components/LanguageSwitcher";
import { personJsonLd, websiteJsonLd } from "@/lib/seo";

// Shared <body> contents for the public-site root layouts. Block 6a.2
// splits the public site into two root layouts — (site-en)/layout.tsx
// (hardcoded lang="en" dir="ltr") and (site-intl)/intl/[lang]/layout.tsx
// (lang/dir derived from the [lang] segment) — so the SSR'd <html> ships
// with attributes that match the served locale. Both layouts use the same
// fonts, the same sitewide JSON-LD entity graph, and the same floating
// LanguageSwitcher; this component is the single source of truth for that
// shared body chrome. Only the <html> element differs between the two.
export default function RootLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <body>
      {/* Site-wide WebSite + Person JSON-LD — emitted on every page so
          branded search picks up the entity graph and the about-the-author
          authority signal travels with every URL, not just the post page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd()),
        }}
      />
      {children}
      {/* Mounted at the layout level so the floating widget appears on
          every page across both the English root and the /[lang]/
          rewrite subtree. The switcher itself is a client component;
          the layout stays server-rendered. */}
      <LanguageSwitcher />
    </body>
  );
}
