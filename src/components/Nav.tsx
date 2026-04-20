"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// 6 content pillars. "Consulting Career" is deliberately footer-only per CLAUDE.md.
const PILLARS: { label: string; slug: string; blurb: string }[] = [
  {
    label: "ERP Implementation",
    slug: "erp-implementation",
    blurb: "Delivery playbooks, programme recovery, go-live readiness.",
  },
  {
    label: "Platforms & Modules",
    slug: "platforms-modules",
    blurb: "SAP S/4HANA, Oracle, Dynamics — module-level deep dives.",
  },
  {
    label: "ERP Strategy",
    slug: "erp-strategy",
    blurb: "Roadmaps, TCO, vendor selection, transformation design.",
  },
  {
    label: "AI Governance",
    slug: "ai-governance",
    blurb: "Policy, risk, controls, model oversight on ERP data.",
  },
  {
    label: "Agentic AI",
    slug: "agentic-ai",
    blurb: "Autonomous agents in the ERP stack — what actually works.",
  },
  {
    label: "Case Studies",
    slug: "case-studies",
    blurb: "Real programme outcomes — aviation, government, retail.",
  },
];

const TOOLS: { label: string; slug: string; blurb: string }[] = [
  {
    label: "ERP Cost Calculator",
    slug: "erp-implementation-cost-calculator",
    blurb: "LLM-estimated cost band for any ERP programme.",
  },
  {
    label: "SAP Cost Calculator",
    slug: "sap-implementation-cost-calculator",
    blurb: "SAP-specific cost, licence, and resourcing estimate.",
  },
  {
    label: "Migration Estimator",
    slug: "free-data-migration-estimator-sap-oracle-microsoft",
    blurb: "Data migration effort — SAP, Oracle, Microsoft.",
  },
  {
    label: "JD Generator",
    slug: "sap-job-description-generator",
    blurb: "Role-accurate SAP job descriptions in seconds.",
  },
  {
    label: "Solution Builder",
    slug: "sap-solution-builder",
    blurb: "Sketch a solution architecture from a plain-English brief.",
  },
];

type OpenMenu = "solutions" | "tools" | null;

export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const navRef = useRef<HTMLElement | null>(null);

  // Sticky shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav
      ref={navRef}
      className={`sticky top-0 z-50 bg-bone/90 backdrop-blur-[20px] border-b border-corbeau/[0.06] transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-[clamp(1.5rem,5vw,4rem)] h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-display font-black text-[1.2rem] text-corbeau no-underline tracking-[-0.04em]"
        >
          noel<span className="text-papaya">dcosta</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="md:hidden bg-transparent border-none text-[1.3rem] cursor-pointer text-corbeau"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          ☰
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-6 list-none">
          {/* Solutions dropdown */}
          <li className="relative">
            <button
              type="button"
              className={`text-night text-[0.85rem] font-medium transition-colors hover:text-corbeau flex items-center gap-1 py-2 ${
                pathname?.startsWith("/category/") ? "text-corbeau" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((m) => (m === "solutions" ? null : "solutions"));
              }}
              aria-expanded={openMenu === "solutions"}
            >
              Solutions
              <span className="text-[0.6rem]">▾</span>
            </button>
            {openMenu === "solutions" && (
              <div className="absolute left-0 top-full mt-1 w-[360px] bg-bone border border-corbeau/[0.08] rounded-lg shadow-xl p-2 z-50">
                {PILLARS.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/category/${p.slug}`}
                    className="block px-3 py-2.5 rounded no-underline hover:bg-corbeau/[0.04] transition-colors"
                  >
                    <div className="text-corbeau font-semibold text-[0.88rem] leading-tight">
                      {p.label}
                    </div>
                    <div className="text-night text-[0.75rem] mt-0.5 leading-snug">
                      {p.blurb}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </li>

          {/* Tools dropdown */}
          <li className="relative">
            <button
              type="button"
              className={`text-night text-[0.85rem] font-medium transition-colors hover:text-corbeau flex items-center gap-1 py-2 ${
                TOOLS.some((t) => isActive(`/${t.slug}`)) ? "text-corbeau" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((m) => (m === "tools" ? null : "tools"));
              }}
              aria-expanded={openMenu === "tools"}
            >
              Tools
              <span className="text-[0.6rem]">▾</span>
            </button>
            {openMenu === "tools" && (
              <div className="absolute left-0 top-full mt-1 w-[360px] bg-bone border border-corbeau/[0.08] rounded-lg shadow-xl p-2 z-50">
                {TOOLS.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/${t.slug}`}
                    className="block px-3 py-2.5 rounded no-underline hover:bg-corbeau/[0.04] transition-colors"
                  >
                    <div className="text-corbeau font-semibold text-[0.88rem] leading-tight">
                      {t.label}
                    </div>
                    <div className="text-night text-[0.75rem] mt-0.5 leading-snug">
                      {t.blurb}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </li>

          <li>
            <Link
              href="/category/case-studies"
              className={`text-night no-underline text-[0.85rem] font-medium transition-colors hover:text-corbeau ${
                isActive("/category/case-studies") ? "text-corbeau" : ""
              }`}
            >
              Case Studies
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              className={`text-night no-underline text-[0.85rem] font-medium transition-colors hover:text-corbeau ${
                isActive("/about") ? "text-corbeau" : ""
              }`}
            >
              About
            </Link>
          </li>

          <li>
            <Link
              href="/contact"
              className="bg-papaya text-corbeau px-[18px] py-2 rounded-lg no-underline font-bold text-[0.85rem] transition-colors hover:bg-[#fdaa78]"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-corbeau/[0.08] bg-bone">
          <div className="px-[clamp(1.5rem,5vw,4rem)] py-4 flex flex-col gap-1">
            <div className="text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver pt-2 pb-1">
              Solutions
            </div>
            {PILLARS.map((p) => (
              <Link
                key={p.slug}
                href={`/category/${p.slug}`}
                className="text-corbeau no-underline text-[0.9rem] font-medium py-2"
              >
                {p.label}
              </Link>
            ))}
            <div className="text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver pt-4 pb-1">
              Tools
            </div>
            {TOOLS.map((t) => (
              <Link
                key={t.slug}
                href={`/${t.slug}`}
                className="text-corbeau no-underline text-[0.9rem] font-medium py-2"
              >
                {t.label}
              </Link>
            ))}
            <div className="text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver pt-4 pb-1">
              Company
            </div>
            <Link
              href="/about"
              className="text-corbeau no-underline text-[0.9rem] font-medium py-2"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-corbeau no-underline text-[0.9rem] font-medium py-2"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
