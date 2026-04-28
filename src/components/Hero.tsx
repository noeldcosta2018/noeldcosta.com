import Image from 'next/image';
import Link from 'next/link';
import BookCallButton from './BookCallButton';

export default function Hero({ lang }: { lang: string }) {
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24 lg:py-32 cc-grid-faint"
      style={{ backgroundColor: 'var(--cc-page-bg)' }}
    >
      {/* Decorative warm glow — static, not animated */}
      <div
        className="cc-glow-warm absolute inset-0 pointer-events-none"
        style={{ opacity: 0.5 }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left content stack — stagger animation on entry */}
          <div className="lg:col-span-7 hero-stagger">

            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-4">
              <span className="cc-pulse-dot w-[6px] h-[6px] rounded-full bg-papaya inline-block" aria-hidden="true" />
              <span className="cc-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya">
                ERP · AI · 25 years
              </span>
            </div>

            {/* H1 */}
            <h1
              className="cc-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight mb-6"
              style={{ color: 'var(--cc-text-primary)' }}
            >
              I run ERP transformations the board can defend.
            </h1>

            {/* Sub-headline */}
            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl mb-8"
              style={{ color: 'var(--cc-text-body)' }}
            >
              ECC to S/4HANA. AI on SAP. 25 years delivering for{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>EDGE Group</strong>{' '}
              ($60M saved),{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>Etihad Airways</strong>{' '}
              ($400M+ impact),{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>ADNOC</strong>,{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>PIF entities</strong>, and the{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>UAE Government</strong>.
              {' '}CIMA-qualified. I lead the engagement. I don&apos;t subcontract.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              {/* Primary — opens Calendly popup */}
              <BookCallButton
                className="cc-btn-primary group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold sm:w-auto w-full"
              >
                Book a 30-min call
                <span
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </BookCallButton>

              {/* Secondary */}
              <Link
                href={`/${lang}/case-studies/`}
                className="cc-btn-secondary group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold sm:w-auto w-full"
              >
                See case studies
                <span
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </div>

            {/* Credibility line + LinkedIn */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--cc-text-muted)' }}>
                CIMA{' '}
                <span style={{ color: 'var(--cc-accent)' }}>·</span>{' '}
                AICPA{' '}
                <span style={{ color: 'var(--cc-accent)' }}>·</span>{' '}
                Masters in Accounting{' '}
                <span style={{ color: 'var(--cc-accent)' }}>·</span>{' '}
                25+ years across EDGE Group, Etihad, ADNOC, PIF entities, DXC, and the UAE Government
              </p>
              <a
                href="https://www.linkedin.com/in/noeldcosta/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Noel D'Costa on LinkedIn"
                className="cc-linkedin-icon flex-shrink-0 rounded"
              >
                {/* LinkedIn logo SVG — lucide-react 1.x removed this icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>

            {/* Four-stat strip */}
            <div className="flex flex-wrap gap-x-0 mt-8 border-t border-corbeau/[0.08] pt-6">
              {[
                { num: '$700M+', label: 'delivered' },
                { num: '84', label: 'entities migrated' },
                { num: '25 yrs', label: 'in ERP & AI' },
                { num: '5', label: 'continents' },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`pr-6 mr-6 max-sm:mb-4 ${i < 3 ? 'border-r border-corbeau/[0.10]' : ''}`}
                >
                  <div
                    className="font-display font-black tracking-[-0.03em] leading-none text-corbeau"
                    style={{ fontSize: 'clamp(1.4rem,2.5vw,1.75rem)' }}
                  >
                    {s.num}
                  </div>
                  <div className="font-mono text-[0.65rem] uppercase tracking-[1.5px] text-silver mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Headshot — desktop only */}
          <div className="hidden lg:flex lg:col-span-5 justify-end">
            <div
              className="relative cc-hero-card rounded-2xl overflow-hidden"
              style={{ width: 360, height: 360 }}
            >
              <Image
                src="/headshot.png"
                alt="Noel D'Costa"
                fill
                priority
                sizes="(min-width: 1024px) 360px, 0px"
                className="object-cover object-top"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
