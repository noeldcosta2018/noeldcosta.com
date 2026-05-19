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

function Card({ t }: { t: Testimonial }) {
  return (
    <FadeUp
      as="section"
      className="flex flex-col h-full rounded-2xl bg-paper border border-corbeau/10 p-6 md:p-7 shadow-[0_2px_20px_rgba(14,16,32,0.04)] hover:shadow-[0_8px_28px_rgba(14,16,32,0.08)] transition-shadow"
    >
      {/* Avatar + identity */}
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

      {/* Quote */}
      <blockquote className="mt-5 border-l-[3px] border-papaya/60 pl-4 text-corbeau/90 italic text-[0.94rem] leading-[1.65] space-y-3">
        {t.quote.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </blockquote>
    </FadeUp>
  );
}

export default function TestimonialsGrid() {
  return (
    <div className="not-prose my-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {TESTIMONIALS.map((t) => (
          <Card key={t.name} t={t} />
        ))}
      </div>
    </div>
  );
}
