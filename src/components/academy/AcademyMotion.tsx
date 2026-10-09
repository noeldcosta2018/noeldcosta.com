"use client";

import { useEffect } from "react";

/**
 * Draws each doodle and sweeps each marker highlight once, as it comes on
 * screen. The CSS holds them undrawn only when scripting is on and motion is
 * allowed; with reduced motion or without JavaScript they show in their final
 * state (nd-academy.css).
 * Tick boxes and the circled verdict are driven by their own state instead.
 */
export default function AcademyMotion() {
  useEffect(() => {
    const page = document.querySelector(".ar-page");
    if (!page) return;
    const targets = Array.from(page.querySelectorAll(".dd, .ar-mark")).filter((el) => !el.closest(".ar-box, .ar-verdict"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("on"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("on");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.4 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
