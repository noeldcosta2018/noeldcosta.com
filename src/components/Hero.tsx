import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';

export default function Hero({ lang }: { lang: string }) {
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Warm glow */}
      <div className="cc-glow-warm" style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none'
      }} />
      {/* Faint grid — cc-grid-faint used as cc-grid-lines per brief */}
      <div className="cc-grid-faint" style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.6
      }} />

      <div style={{
        position: 'relative',
        maxWidth: 1480,
        margin: '0 auto',
        padding: '40px 24px 48px'
      }}>
        <div className="grid lg:grid-cols-12" style={{
          gap: 32,
          alignItems: 'center'
        }}>

          {/* Left content stack */}
          <div className="lg:col-span-6 hero-stagger">

            {/* Eyebrow */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24
            }}>
              <span className="cc-pulse-dot" style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--cc-papaya)'
              }} />
              <span className="cc-mono" style={{
                fontSize: 11,
                letterSpacing: '0.2em',
                color: 'var(--cc-night)',
                textTransform: 'uppercase'
              }}>
                ERP · AI · 25 years
              </span>
            </div>

            {/* H1 */}
            <h1 className="cc-display" style={{
              fontWeight: 900,
              fontSize: 'clamp(36px, 5.5vw, 64px)',
              lineHeight: 0.95,
              color: 'var(--cc-text-primary)',
              margin: 0,
              letterSpacing: '-0.02em'
            }}>
              I run ERP transformations{' '}
              <span style={{
                fontStyle: 'italic',
                fontWeight: 300,
                color: 'var(--cc-canyon)'
              }}>
                the board can defend.
              </span>
            </h1>

            {/* Sub-headline */}
            <p style={{
              marginTop: 24,
              fontSize: 16,
              color: 'var(--cc-text-body)',
              maxWidth: 500,
              lineHeight: 1.65
            }}>
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
            <div style={{
              marginTop: 28,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 12
            }}>
              {/* Primary — direct Calendly link per brief (Change 3) */}
              <a
                href="https://calendly.com/noeldcosta/30min"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--cc-corbeau)',
                  color: 'var(--cc-bone)',
                  fontSize: 14,
                  fontWeight: 600,
                  padding: '12px 22px',
                  borderRadius: 999,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Book a 30-min call <ArrowUpRight size={16} />
              </a>

              {/* Secondary */}
              <Link
                href={`/${lang}/case-studies`}
                style={{
                  color: 'var(--cc-corbeau)',
                  fontWeight: 600,
                  fontSize: 14,
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  background: 'var(--cc-papaya)',
                  borderRadius: 999
                }}
              >
                See case studies <ArrowRight size={16} />
              </Link>
            </div>

            {/* Credibility line + LinkedIn */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1" style={{ marginTop: 20 }}>
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
          <div className="hidden lg:block lg:col-span-6">
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: 20,
                overflow: 'hidden',
                border: '6px solid #ffffff',
                boxShadow: '0 20px 40px rgba(252,152,90,0.12), 0 8px 16px rgba(14,16,32,0.08), 0 0 0 1px rgba(14,16,32,0.06)',
                aspectRatio: '4/5',
                maxWidth: 480,
                marginLeft: 'auto'
              }}>
                <Image
                  src="/images/headshot.png"
                  alt="Noel D'Costa"
                  fill
                  priority
                  sizes="(min-width: 1024px) 480px, 0px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
