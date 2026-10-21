import Link from "next/link";
import Doodle from "@/components/doodles/Doodle";

/**
 * A call to action inside an article or page body, styled as a brand button
 * with the hand-drawn arrow pointing at it from the paragraph above.
 *
 * MDX usage (one line):
 *
 *   <cta-button href="/contact-noel-erp-support/" label="Talk to Noel: free 30-minute call"></cta-button>
 *
 * The href is localised with the rest of the body links (link-repair), so
 * translated pages write the same English path. The arrow is decorative and
 * mirrors on right-to-left pages.
 */
type Props = { href?: string; label?: string };

export default function InlineCta({ href, label }: Props) {
  if (!href || !label) return null;
  return (
    <div className="not-prose nd-inline-cta">
      <Doodle name="arrow-hook" className="nd-inline-cta-arrow" />
      <Link href={href} className="nd-btn nd-inline-cta-btn">
        {label}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
