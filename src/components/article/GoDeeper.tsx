import { Children, type ReactNode } from "react";

/**
 * A short row of related guides at the end of a section, as cards with an
 * arrow, in place of a "Go deeper: a, b and c." sentence.
 *
 * MDX usage (one line; the links are ordinary <a> tags):
 *
 *   <go-deeper title="Go deeper"><a href="/sap-project-scope-template-management-and-control/">Project scope</a><a href="/sap-s4hana-migration-strategy-greenfield-vs-brownfield/">Greenfield vs brownfield</a></go-deeper>
 *
 * Plain <a href> tags keep the links in the body, so the render-time link
 * repair localises them on translated pages like any other body link. This
 * component also renders inside client components, so it must not import
 * server-only code.
 */
type Props = { title?: string; children?: ReactNode };

export default function GoDeeper({ title, children }: Props) {
  const links = Children.toArray(children).filter((c) => typeof c !== "string" || c.trim());
  if (!links.length) return null;
  return (
    <nav className="not-prose nd-go-deeper" aria-label={title || "Go deeper"}>
      {title && <p className="nd-go-deeper-title">{title}</p>}
      <ul>
        {links.map((link, i) => (
          <li key={i}>{link}</li>
        ))}
      </ul>
    </nav>
  );
}
