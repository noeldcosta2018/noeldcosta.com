import FadeUp from "@/components/article/FadeUp";
import { TESTIMONIALS, type Testimonial } from "./data";

/**
 * Renders the 9 LinkedIn testimonials as structured cards on the
 * /sap-erp-consultant-my-story-noel-dcosta page. Each card surfaces
 * the avatar, name, role, and quote as separate elements — fixing
 * the WordPress-import regression where everything collapsed into
 * one underscored run of text.
 *
 * No props: the data lives in ./data.ts so the MDX side can stay
 * a single `<testimonials-grid />` tag.
 */

function Identity({ t }: { t: Testimonial }) {
  return (
    <div className="flex items-start gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.avatarUrl}
        alt={`Portrait of ${t.name}`}
        loading="lazy"
        className="w-14 h-14 rounded-full object-cover border border-corbeau/10 shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-corbeau text-[1.02rem] md:text-[1.08rem] tracking-[-0.02em] leading-tight">
          {t.name}
        </h3>
        <div
          className="mt-1.5 mb-2 h-[2px] w-8 bg-papaya rounded-full"
          aria-hidden
        />
        <p className="text-night/70 text-[0.82rem] md:text-[0.86rem] leading-snug">
          {t.title}
        </p>
      </div>
    </div>
  );
}

function Quote({ t }: { t: Testimonial }) {
  return (
    <blockquote className="border-l-[3px] border-papaya/60 pl-4 text-corbeau/90 italic text-[0.94rem] leading-[1.65] space-y-3">
      {t.quote.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </blockquote>
  );
}

/** Standard testimonial card — identity on top, quote below. */
function Card({ t }: { t: Testimonial }) {
  return (
    <FadeUp
      as="section"
      className="flex flex-col h-full rounded-2xl bg-paper border border-corbeau/10 p-6 md:p-7 shadow-[0_2px_20px_rgba(14,16,32,0.04)] hover:shadow-[0_8px_28px_rgba(14,16,32,0.08)] transition-shadow"
    >
      <Identity t={t} />
      <div className="mt-5">
        <Quote t={t} />
      </div>
    </FadeUp>
  );
}

/**
 * Wide variant for the odd-one-out testimonial that would otherwise
 * sit alone on its row. Identity on the left rail (~280px), quote
 * filling the right. Same colours, same hover, same spacing tokens.
 * On mobile it falls back to the stacked layout via flex-col.
 */
function WideCard({ t }: { t: Testimonial }) {
  return (
    <FadeUp
      as="section"
      className="rounded-2xl bg-paper border border-corbeau/10 p-6 md:p-7 shadow-[0_2px_20px_rgba(14,16,32,0.04)] hover:shadow-[0_8px_28px_rgba(14,16,32,0.08)] transition-shadow"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
        <div className="md:w-[280px] md:shrink-0">
          <Identity t={t} />
        </div>
        <div className="flex-1 min-w-0">
          <Quote t={t} />
        </div>
      </div>
    </FadeUp>
  );
}

export default function TestimonialsGrid() {
  return (
    <div className="not-prose my-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TESTIMONIALS.map((t, i) => {
          // Last testimonial spans both columns and uses the horizontal
          // layout so it doesn't sit alone on its row looking abandoned.
          const isLast = i === TESTIMONIALS.length - 1;
          return (
            <div key={t.name} className={isLast ? "md:col-span-2" : ""}>
              {isLast ? <WideCard t={t} /> : <Card t={t} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
