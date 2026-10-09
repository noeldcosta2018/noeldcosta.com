"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * Header for the AI Academy landing page: logo home and one call to action.
 * Once the hero has scrolled away the header carries the programme line
 * (desktop) and a full-width button docks to the bottom of the screen
 * (mobile). The bottom button steps aside while the waitlist form is on screen.
 */
export default function AcademyChrome({
  line,
  cta,
}: {
  line: string;
  cta: { label: string; href: string };
}) {
  const [pastHero, setPastHero] = useState(false);
  const [atForm, setAtForm] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("ar-hero");
    const form = document.getElementById("waitlist");
    if (!("IntersectionObserver" in window)) return;
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0));
      io.observe(hero);
      observers.push(io);
    }
    if (form) {
      const io = new IntersectionObserver(([e]) => setAtForm(e.isIntersecting));
      io.observe(form);
      observers.push(io);
    }
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  const showDock = pastHero && !atForm;

  useEffect(() => {
    document.body.classList.toggle("ar-dock-on", showDock);
    return () => document.body.classList.remove("ar-dock-on");
  }, [showDock]);

  return (
    <>
      <a className="nd-skip" href="#main-content">
        Skip to content
      </a>
      <header className={`nd-header ar-header${pastHero ? " is-past" : ""}`}>
        <nav className="nd-nav ar-nav" aria-label="AI Ready in 30 Days">
          <Link className="nd-brand" href="/" aria-label="Noel D'Costa, home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="nd-on-dark" src="/brand/nd-monogram-on-dark.svg" alt="" width={36} height={22} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="nd-on-light" src="/brand/nd-monogram.svg" alt="" width={36} height={22} />
            <span className="word">NOEL DCOSTA</span>
          </Link>
          <p className="ar-bar-line" aria-hidden={!pastHero}>
            {line}
          </p>
          <a className="nd-btn ar-cta ar-header-cta" href={cta.href}>
            {cta.label}
          </a>
        </nav>
      </header>
      <div className={`ar-dock${showDock ? " is-on" : ""}`} aria-hidden={!showDock}>
        <a className="nd-btn ar-cta" href={cta.href} tabIndex={showDock ? undefined : -1}>
          {cta.label}
        </a>
      </div>
    </>
  );
}
