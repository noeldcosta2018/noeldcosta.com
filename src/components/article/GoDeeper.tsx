import Link from "next/link";
import { localizeHref } from "@/lib/link-repair";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import type { Locale } from "@/lib/locales";

/**
 * A short row of related guides at the end of a section, as cards with an
 * arrow, in place of a "Go deeper: a, b and c." sentence.
 *
 * MDX usage (one line, labels and hrefs separated by |, same count):
 *
 *   <go-deeper title="Go deeper" labels="Project scope|Greenfield vs brownfield" hrefs="/sap-project-scope-template-management-and-control/|/sap-s4hana-migration-strategy-greenfield-vs-brownfield/"></go-deeper>
 *
 * Translated files keep the English paths; they are localised here, falling
 * back to the English page when the translation is not published.
 */
type Props = { title?: string; labels?: string; hrefs?: string; locale?: string };

export default function GoDeeper({ title, labels, hrefs, locale }: Props) {
  const names = (labels ?? "").split("|").map((s) => s.trim());
  const paths = (hrefs ?? "").split("|").map((s) => s.trim());
  const items = names.map((name, i) => ({ name, href: paths[i] })).filter((it) => it.name && it.href);
  if (!items.length) return null;
  const prefix = locale ? publicPrefixFromContentLocale(locale as Locale) : null;
  return (
    <nav className="not-prose nd-go-deeper" aria-label={title || "Go deeper"}>
      {title && <p className="nd-go-deeper-title">{title}</p>}
      <ul>
        {items.map((it) => (
          <li key={it.href}>
            <Link href={localizeHref(prefix, it.href)}>
              <span>{it.name}</span>
              <span className="nd-go-deeper-arrow" aria-hidden="true">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
