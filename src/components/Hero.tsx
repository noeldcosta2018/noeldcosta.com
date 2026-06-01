import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { type Locale } from "@/lib/locales";
import { getMessages } from "@/lib/i18n/useTranslation";

/**
 * Hero entrance choreography (CSS keyframes).
 *
 * Sequence (~1600 ms total):
 *   1. Eyebrow + pulse dot fade in       — 0 ms,    400 ms duration
 *   2. Headline fades up                 — 100 ms
 *   3. Body paragraph fades in           — 900 ms after eyebrow
 *   4. CTA row fades up                  — 1000 ms
 *   5. Stat row reveals stat-by-stat     — 1100 ms, 80 ms stagger
 *   6. Headshot fades in with scale      — 400 ms (parallel)
 *
 * Uses CSS keyframes rather than framer-motion variants so the
 * server-rendered initial state matches the client hydration exactly
 * (no flash, no hydration warning). The global @media (prefers-
 * reduced-motion: reduce) guard in globals.css collapses every
 * animation-duration to 0.01 ms automatically.
 *
 * No "use client" needed — pure CSS animation runs on the compositor.
 */

export default function Hero({ locale = "en" }: { locale?: Locale }) {
  const m = getMessages(locale);
  // Stat figures stay inline — locale-agnostic numerals. Labels come
  // from MESSAGES.hero.stat*Label.
  const STATS = [
    { num: '$700M+', label: m.hero.statDeliveredLabel },
    { num: '84', label: m.hero.statEntitiesLabel },
    { num: '25 yrs', label: m.hero.statYearsLabel },
    { num: '5', label: m.hero.statContinentsLabel },
  ] as const;
  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Warm glow */}
      <div className="cc-glow-warm" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div className="cc-grid-faint" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} />

      <div style={{ position: 'relative', maxWidth: 1480, margin: '0 auto', padding: '40px 24px 48px' }}>
        <div className="grid lg:grid-cols-12" style={{ gap: 32, alignItems: 'center' }}>

          {/* Left content stack */}
          <div className="lg:col-span-6">

            {/* Mobile/tablet headshot — small framed photo above the
                eyebrow at < lg. The desktop frame below is hidden under
                lg and is too large to scale down without dominating the
                fold; this smaller framed shot keeps "this is a person"
                on the page for the 90-second scan. */}
            <div className="lg:hidden cc-enter-scale" style={{ marginBottom: 20, animationDelay: '100ms' }}>
              <div
                style={{
                  position: 'relative',
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #ffffff',
                  boxShadow:
                    '0 8px 20px rgba(252,152,90,0.18), 0 2px 6px rgba(14,16,32,0.08), 0 0 0 1px rgba(14,16,32,0.06)',
                }}
              >
                <Image
                  src="/images/headshot.png"
                  alt={m.hero.headshotAlt}
                  width={192}
                  height={192}
                  priority
                  quality={70}
                  sizes="96px"
                  className="object-cover object-top w-full h-full"
                />
              </div>
            </div>

            {/* Eyebrow — fade in first, 0 ms delay */}
            <div
              className="cc-enter-up"
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, animationDelay: '0ms' }}
            >
              <span className="cc-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cc-papaya)' }} />
              <span className="cc-mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--cc-night)', textTransform: 'uppercase' }}>
                {m.hero.eyebrow}
              </span>
            </div>

            {/* H1 — single text node so the browser can wrap naturally.
                Per-word stagger has been removed: at narrow viewports the
                old per-span flex-wrap broke lines in places normal text
                wouldn't (single word orphans on their own line). A whole-
                headline fade-up is calmer and lets text-wrap balance handle
                the line breaks. */}
            <h1
              className="cc-display cc-enter-up"
              style={{
                fontWeight: 900,
                fontSize: 'clamp(36px, 5.5vw, 64px)',
                lineHeight: 1.05,
                color: 'var(--cc-text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
                textWrap: 'balance',
                animationDelay: '100ms',
              }}
            >
              {m.hero.headline}{' '}
              <span
                style={{
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--cc-canyon)',
                }}
              >
                {m.hero.emphasis}
              </span>
            </h1>

            {/* Sub-headline — value-led, no named clients. Specific
                programmes show up further down the page (TrackRecord
                section + LogoScroll trust bar). */}
            <p
              className="cc-enter-up"
              style={{ marginTop: 24, fontSize: 16, color: 'var(--cc-text-body)', maxWidth: 500, lineHeight: 1.65, animationDelay: '900ms' }}
            >
              {m.hero.subheadlineLead}{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>{m.hero.subheadlineIndustries}</strong>.{' '}
              <strong className="font-semibold" style={{ color: 'var(--cc-text-primary)' }}>{m.hero.subheadlineImpact}</strong>.{' '}
              {m.hero.subheadlineTail}
            </p>

            {/* CTAs */}
            <div
              className="cc-enter-up"
              style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, animationDelay: '1000ms' }}
            >
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
                  gap: 8,
                }}
              >
                {m.hero.primaryCta} <ArrowUpRight size={16} />
              </a>
              <Link
                href="/case-studies"
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
                  borderRadius: 999,
                }}
              >
                {m.hero.secondaryCta} <ArrowRight size={16} className="rtl:-scale-x-100" />
              </Link>
            </div>

            {/* Credibility line */}
            <div
              className="cc-enter-up flex flex-wrap items-center gap-x-2 gap-y-1"
              style={{ marginTop: 20, animationDelay: '1050ms' }}
            >
              <p className="text-sm leading-relaxed" style={{ color: 'var(--cc-text-muted)' }}>
                CIMA{' '}
                <span style={{ color: 'var(--cc-accent)' }}>·</span>{' '}
                AICPA{' '}
                <span style={{ color: 'var(--cc-accent)' }}>·</span>{' '}
                {m.hero.credMasters}{' '}
                <span style={{ color: 'var(--cc-accent)' }}>·</span>{' '}
                {m.hero.credYearsAndClients}
              </p>
              <a
                href="https://www.linkedin.com/in/noeldcosta/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={m.hero.linkedinAria}
                className="cc-linkedin-icon flex-shrink-0 rounded inline-flex items-center justify-center min-w-[44px] min-h-[44px] -my-2 -mx-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>

            {/* Four-stat strip — stat-by-stat stagger via per-tile delay */}
            <div className="flex flex-wrap gap-x-0 mt-8 border-t border-corbeau/[0.08] pt-6 max-md:flex-col max-md:divide-y max-md:divide-corbeau/[0.08]">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`cc-enter-up pe-6 me-6 max-md:pe-0 max-md:me-0 max-md:py-3 max-md:first:pt-0 ${i < 3 ? 'border-e border-corbeau/[0.10] max-md:border-e-0' : ''}`}
                  style={{ animationDelay: `${1100 + i * 80}ms` }}
                >
                  <div
                    className="font-display font-black tracking-[-0.03em] leading-none text-corbeau tabular-nums"
                    style={{ fontSize: 'clamp(1.4rem,2.5vw,1.75rem)' }}
                  >
                    {s.num}
                  </div>
                  <div className="font-mono text-[0.72rem] uppercase tracking-[1.5px] text-eyebrow mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Headshot — desktop only. Fade + slight scale, 400 ms delay. */}
          <div className="hidden lg:block lg:col-span-6">
            <div className="cc-enter-scale" style={{ position: 'relative', animationDelay: '400ms' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 20,
                  overflow: 'hidden',
                  border: '6px solid #ffffff',
                  boxShadow:
                    '0 20px 40px rgba(252,152,90,0.12), 0 8px 16px rgba(14,16,32,0.08), 0 0 0 1px rgba(14,16,32,0.06)',
                  aspectRatio: '4/5',
                  maxWidth: 480,
                  marginLeft: 'auto',
                }}
              >
                <Image
                  src="/images/headshot.png"
                  alt={m.hero.headshotAlt}
                  width={480}
                  height={600}
                  priority
                  quality={70}
                  sizes="(min-width: 1024px) 480px, 0px"
                  className="object-cover object-top w-full h-full"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
