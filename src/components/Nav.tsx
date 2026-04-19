"use client";

import { useEffect, useState } from "react";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Free Tools", href: "#tools" },
  { label: "Case Studies", href: "#track" },
  { label: "Blog", href: "#" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 bg-bone/90 backdrop-blur-[20px] border-b border-corbeau/[0.06] transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div
        className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] h-16 flex items-center justify-between"
      >
        <a
          href="#"
          className="font-display font-black text-[1.2rem] text-corbeau no-underline tracking-[-0.04em]"
        >
          noel<span className="text-papaya">dcosta</span>
        </a>

        <button
          className="md:hidden bg-transparent border-none text-[1.3rem] cursor-pointer text-corbeau"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <ul
          className={`
            md:flex items-center gap-8 list-none
            ${open ? "flex" : "hidden"}
            max-md:flex-col max-md:absolute max-md:top-16 max-md:left-0 max-md:right-0
            max-md:bg-bone max-md:border-b max-md:border-corbeau/[0.08]
            max-md:px-[clamp(1.5rem,5vw,4rem)] max-md:py-4 max-md:gap-[10px] max-md:z-50
          `}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="text-night no-underline text-[0.85rem] font-medium transition-colors hover:text-corbeau"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#cta"
              className="bg-papaya text-corbeau px-[18px] py-2 rounded-lg no-underline font-bold text-[0.85rem] transition-colors hover:bg-[#fdaa78]"
              onClick={() => setOpen(false)}
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
