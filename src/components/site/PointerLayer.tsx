"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide pointer layer, attached once in the root layouts.
 *
 * - Stages (.nd-hero, .nd-banner): a soft accent spotlight follows the cursor and
 *   layers marked .parallax drift by their data-depth.
 * - Cards (.nd-glow): the border lights up under the cursor.
 * - Primary actions (.magnetic): lean a few pixels toward the cursor.
 *
 * Event delegation on the document, so client-side navigation needs no rebinding.
 * Off for touch, coarse pointers and reduced motion. The reveal-on-view
 * observer (below) runs on touch screens too, never with reduced motion.
 */
export default function PointerLayer() {
  const pathname = usePathname();

  // Reveal on view: blocks marked [data-inview] get .is-in the first time a
  // fifth of them is on screen; CSS staggers their .nd-in children. Rescans
  // after client-side navigation. The CSS hides nothing unless the head script
  // set .reveal-run (motion allowed), and .inview-ready tells it this observer runs.
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("reveal-run") || !("IntersectionObserver" in window)) return;
    root.classList.add("inview-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll("[data-inview]:not(.is-in)").forEach((el) => io.observe(el));

    // Count-up: [data-count] figures run fast from zero and ease into their
    // value the first time they are on screen. The server HTML holds the final
    // figure, so crawlers and no-JS visitors always read the real number.
    const frames = new Set<number>();
    const countUp = (el: HTMLElement) => {
      // The original figure is kept on the element, so a re-run never counts to 0.
      const text = el.dataset.countText ?? el.textContent ?? "";
      el.dataset.countText = text;
      const match = text.match(/\d+/);
      if (!match) return;
      const target = Number(match[0]);
      const before = text.slice(0, match.index);
      const after = text.slice((match.index ?? 0) + match[0].length);
      const duration = 1300;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = `${before}${Math.round(target * eased)}${after}`;
        if (t < 1) frames.add(requestAnimationFrame(tick));
      };
      el.textContent = `${before}0${after}`;
      frames.add(requestAnimationFrame(tick));
    };
    const counter = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          counter.unobserve(e.target);
          countUp(e.target as HTMLElement);
        }
      },
      { threshold: 0.6 },
    );
    document.querySelectorAll("[data-count]").forEach((el) => counter.observe(el));
    return () => {
      io.disconnect();
      counter.disconnect();
      frames.forEach((f) => cancelAnimationFrame(f));
      document.querySelectorAll<HTMLElement>("[data-count-text]").forEach((el) => {
        el.textContent = el.dataset.countText ?? el.textContent;
      });
    };
  }, [pathname]);

  useEffect(() => {
    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(hover: hover)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let raf = 0;
    let last: PointerEvent | null = null;
    let stage: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    const resetStage = (el: HTMLElement) => {
      el.classList.remove("spot-on");
      el.querySelectorAll<HTMLElement>(".parallax").forEach((layer) => {
        layer.style.setProperty("--px", "0px");
        layer.style.setProperty("--py", "0px");
      });
    };

    const paint = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const target = e.target instanceof Element ? e.target : null;

      const nextStage = target?.closest<HTMLElement>(".nd-hero, .nd-banner") ?? null;
      if (stage && stage !== nextStage) resetStage(stage);
      stage = nextStage;
      if (stage) {
        const r = stage.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        stage.classList.add("spot-on");
        const spot = stage.querySelector<HTMLElement>(":scope > .nd-spotlight");
        if (spot) {
          spot.style.setProperty("--mx", `${x}px`);
          spot.style.setProperty("--my", `${y}px`);
        }
        const nx = x / r.width - 0.5;
        const ny = y / r.height - 0.5;
        stage.querySelectorAll<HTMLElement>(".parallax").forEach((layer) => {
          const d = parseFloat(layer.dataset.depth || "10");
          layer.style.setProperty("--px", `${(-nx * d).toFixed(2)}px`);
          layer.style.setProperty("--py", `${(-ny * d * 0.6).toFixed(2)}px`);
        });
      }

      const card = target?.closest<HTMLElement>(".nd-glow");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--gx", `${e.clientX - r.left}px`);
        card.style.setProperty("--gy", `${e.clientY - r.top}px`);
      }

      const nextMagnet = target?.closest<HTMLElement>(".magnetic") ?? null;
      if (magnet && magnet !== nextMagnet) magnet.style.transform = "";
      magnet = nextMagnet;
      if (magnet) {
        const r = magnet.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        magnet.style.transform = `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)`;
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      last = e;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (stage) resetStage(stage);
      if (magnet) magnet.style.transform = "";
      stage = null;
      magnet = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
