"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Site-wide reveal layer, attached once in the root layouts.
 *
 * Blocks marked [data-inview] get .is-in the first time they are on screen,
 * and hand-drawn marks (Doodle, .nd-mark) draw once each is visible. Never
 * runs with reduced motion.
 *
 * Removed after the Hallmark audit (7 Nov 2026): the cursor spotlight on
 * heroes and banners, the cursor-lit card borders (.nd-glow), magnetic
 * buttons, pointer parallax and the count-up on figures. They were
 * decoration, and figures now render as written.
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

    // Hand-drawn marks: each draws (or sweeps, for .nd-mark) once, the first
    // time it is on screen. Marks inside [data-dd-manual] follow their own state.
    const draw = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("on");
          draw.unobserve(e.target);
        }
      },
      { threshold: 0.4 },
    );

    // Watch what is on the page now, and anything added later: long pages
    // stream in after this effect first runs, and client components can mount
    // marks afterwards. A mark that is never observed would stay hidden.
    const INVIEW = "[data-inview]:not(.is-in)";
    const MARK = ".dd:not(.on), .nd-mark:not(.on)";
    const watch = (el: Element) => {
      if (el.matches(INVIEW)) io.observe(el);
      if (el.matches(MARK) && !el.closest("[data-dd-manual]")) draw.observe(el);
    };
    document.querySelectorAll(`${INVIEW}, ${MARK}`).forEach(watch);
    const added = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          watch(node);
          node.querySelectorAll(`${INVIEW}, ${MARK}`).forEach(watch);
        });
      }
    });
    added.observe(document.body, { childList: true, subtree: true });
    return () => {
      added.disconnect();
      io.disconnect();
      draw.disconnect();
    };
  }, [pathname]);

  return null;
}
