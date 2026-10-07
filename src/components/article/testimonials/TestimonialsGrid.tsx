import FadeUp from "@/components/article/FadeUp";
import { TESTIMONIALS, type Testimonial } from "./data";

/**
 * Renders the 9 LinkedIn testimonials as structured cards on the
 * /sap-erp-consultant-my-story-noel-dcosta page: avatar, name, role and
 * quote as separate elements. Quotes are verbatim from ./data.ts.
 *
 * No props: the data lives in ./data.ts so the MDX side can stay
 * a single `<testimonials-grid />` tag.
 */

function Identity({ t }: { t: Testimonial }) {
  return (
    <div className="who">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={t.avatarUrl} alt={`Portrait of ${t.name}`} loading="lazy" />
      <div>
        <h3>{t.name}</h3>
        <p>{t.title}</p>
      </div>
    </div>
  );
}

function Quote({ t }: { t: Testimonial }) {
  return (
    <blockquote>
      {t.quote.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </blockquote>
  );
}

export default function TestimonialsGrid() {
  return (
    <FadeUp as="section" className="not-prose nd-block nd-testimonials">
      {TESTIMONIALS.map((t, i) => {
        // The last testimonial spans both columns with the identity beside
        // the quote, so it doesn't sit alone on its row.
        const isLast = i === TESTIMONIALS.length - 1;
        return (
          <div key={t.name} className={isLast ? "wide" : undefined}>
            <div className={`nd-card nd-testimonial${isLast ? " wide-card" : ""}`}>
              <Identity t={t} />
              <Quote t={t} />
            </div>
          </div>
        );
      })}
    </FadeUp>
  );
}
