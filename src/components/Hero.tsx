"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * Hero entrance choreography per the precision-sharpening brief.
 *
 * Sequence (~1600 ms total):
 *   1. Eyebrow + pulse dot fade in       — 0 ms,    400 ms duration
 *   2. Headline reveals word-by-word     — 100 ms,  60 ms stagger
 *   3. Italic emphasis fades in last     — chained from word reveal
 *   4. Body paragraph fades in           — 200 ms after headline ends
 *   5. CTA row fades up                  — 100 ms after body
 *   6. Stat row reveals stat-by-stat     — 80 ms stagger
 *   7. Headshot fades in with scale      — 400 ms after eyebrow
 *
 * Respects prefers-reduced-motion: framer-motion's useReducedMotion
 * hook + the global @media guard in globals.css both kick in. With
 * reduced motion, every element renders at its final state instantly.
 */

const HEADLINE_WORDS = ['I', 'run', 'ERP', 'transformations'];
const EMPHASIS = 'the board can defend.';

const STATS = [
  { num: '$700M+', label: 'delivered' },
  { num: '84', label: 'entities migrated' },
  { num: '25 yrs', label: 'in ERP & AI' },
  { num: '5', label: 'continents' },
] as const;

export default function Hero({ lang }: { lang: string }) {
  const reduced = useReducedMotion();

  // When motion is reduced, all variants collapse to the visible state
  // with zero duration — content is correct, motion just disappears.
  const dur = reduced ? 0 : 0.4;

  const fadeUp = {
    hidden: { opacity: 0, y: reduced ? 0 : 14 },
    show: { opacity: 1, y: 0 },
  };

  const headlineContainer = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: 0.1 } },
  };

  const word = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    show: { opacity: 1, y: 0 },
  };

  const statsContainer = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.08, delayChildren: 1.1 } },
  };

  return (
    <section style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Warm glow */}
      <div className="cc-glow-warm" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      <div className="cc-grid-faint" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.6 }} />

      <div style={{ position: 'relative', maxWidth: 1480, margin: '0 auto', padding: '40px 24px 48px' }}>
        <div className="grid lg:grid-cols-12" style={{ gap: 32, alignItems: 'center' }}>

          {/* Left content stack */}
          <div className="lg:col-span-6">

            {/* Eyebrow — fade in first, 0 ms delay */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
            >
              <span className="cc-pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cc-papaya)' }} />
              <span className="cc-mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--cc-night)', textTransform: 'uppercase' }}>
                ERP · AI · 25 years
              </span>
            </motion.div>

            {/* H1 — word-by-word reveal. Italic emphasis is the last "word"
                in the stagger so it appears at the end of the line. */}
            <motion.h1
              className="cc-display"
              initial="hidden"
              animate="show"
              variants={headlineContainer}
              style={{
                fontWeight: 900,
                fontSize: 'clamp(36px, 5.5vw, 64px)',
                lineHeight: 1.05,
                color: 'var(--cc-text-primary)',
                margin: 0,
                letterSpacing: '-0.02em',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.22em',
              }}
            >
              {HEADLINE_WORDS.map((w) => (
                <motion.span
                  key={w}
                  variants={word}
                  transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
                  style={{ display: 'inline-block' }}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                variants={word}
                transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'inline-block',
                  fontStyle: 'italic',
                  fontWeight: 300,
                  color: 'var(--cc-canyon)',
                }}
              >
                {EMPHASIS}
              </motion.span>
            </motion.h1>

            {/* Sub-headline — starts after headline completes (~100 + 4 words × 60 + 560 ≈ 900 ms). */}
            <motion.p
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.9 }}
              style={{ marginTop: 24, fontSize: 16, color: 'var(--cc-text-body)', maxWidth: 500, lineHeight: 1.65 }}
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
            </motion.p>

            {/* CTAs — 100 ms after body */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 1.0 }}
              style={{ marginTop: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}
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
                Book a 30-min call <ArrowUpRight size={16} />
              </a>
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
                  borderRadius: 999,
                }}
              >
                See case studies <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Credibility line — same delay as CTAs (reads as a single block) */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 1.05 }}
              className="flex flex-wrap items-center gap-x-2 gap-y-1"
              style={{ marginTop: 20 }}
            >
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
                className="cc-linkedin-icon flex-shrink-0 rounded inline-flex items-center justify-center min-w-[44px] min-h-[44px] -my-2 -mx-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </motion.div>

            {/* Four-stat strip — stat-by-stat stagger */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={statsContainer}
              className="flex flex-wrap gap-x-0 mt-8 border-t border-corbeau/[0.08] pt-6 max-md:flex-col max-md:divide-y max-md:divide-corbeau/[0.08]"
            >
              {STATS.map((s, i) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  className={`pr-6 mr-6 max-md:pr-0 max-md:mr-0 max-md:py-3 max-md:first:pt-0 ${i < 3 ? 'border-r border-corbeau/[0.10] max-md:border-r-0' : ''}`}
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
                </motion.div>
              ))}
            </motion.div>

          </div>

          {/* Headshot — desktop only. Fade + slight scale, 400 ms after eyebrow. */}
          <div className="hidden lg:block lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: reduced ? 1 : 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.84, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.4 }}
              style={{ position: 'relative' }}
            >
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
                  alt="Noel D'Costa"
                  width={480}
                  height={600}
                  priority
                  quality={70}
                  sizes="(min-width: 1024px) 480px, 0px"
                  className="object-cover object-top w-full h-full"
                />
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
