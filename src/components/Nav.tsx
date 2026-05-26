"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BrandWordmark from "./BrandWordmark";
import { CATEGORIES } from "@/lib/categories";
import { TOOLS } from "@/lib/tools";

// Pillars derived from the canonical CATEGORIES record in src/lib/categories.ts
// (kept standalone from src/lib/content.ts so this client component does
// not transitively import node:fs from the content-tree scanner).
// Insertion order in the Record matches the dropdown display order. Nav and
// Footer both consume CATEGORIES; CategoryPage uses it for hero metadata.
// Block 6c will translate labels and blurbs against this single source.
const PILLARS = Object.values(CATEGORIES).map((c) => ({
  label: c.label,
  slug: c.slug,
  blurb: c.navBlurb,
}));

/**
 * Body scroll lock side-effect. Mounted only when the mobile drawer is
 * open so background content doesn't drift under the panel. Self-cleans
 * on unmount via the useEffect return.
 */
function MobileDrawerScrollLock() {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  return null;
}

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
    <>
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(244, 237, 228, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(14, 16, 32, 0.1)'
      }}
    >
      <div className="h-16 flex items-center justify-between" style={{ maxWidth: 1480, margin: '0 auto', padding: '0 24px' }}>
        {/* Brand */}
        <Link
          href="/"
          aria-label="noeldcosta — home"
          className="no-underline inline-flex items-center"
        >
          <BrandWordmark variant="on-light" height={28} />
        </Link>

        {/* Mobile toggle — min-w/h 44 to meet Apple HIG / WCAG touch target. */}
        <button
          className="md:hidden bg-transparent border-none text-[1.3rem] cursor-pointer text-corbeau inline-flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? "×" : "☰"}
        </button>

        {/* Desktop menu */}
        <ul className="hidden md:flex items-center gap-6 list-none">
          {/* Solutions dropdown */}
          <li className="relative">
            <button
              type="button"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: pathname?.startsWith("/category/") ? 'var(--cc-text-primary)' : 'var(--cc-text-primary)',
                fontFamily: 'var(--font-display)',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '12px 0',
                minHeight: 44
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((m) => (m === "solutions" ? null : "solutions"));
              }}
              aria-expanded={openMenu === "solutions"}
            >
              Solutions
              <span style={{ fontSize: 10 }}>▾</span>
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
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--cc-text-primary)',
                fontFamily: 'var(--font-display)',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '12px 0',
                minHeight: 44
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu((m) => (m === "tools" ? null : "tools"));
              }}
              aria-expanded={openMenu === "tools"}
            >
              Tools
              <span style={{ fontSize: 10 }}>▾</span>
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
              href="/category/sap-case-studies"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--cc-text-primary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 0'
              }}
            >
              Case Studies
            </Link>
          </li>

          <li>
            <Link
              href="/books"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--cc-text-primary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 0'
              }}
            >
              Books
            </Link>
          </li>

          <li>
            <Link
              href="/about"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--cc-text-primary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44,
                padding: '12px 0'
              }}
            >
              About
            </Link>
          </li>

          <li>
            <Link
              href="/contact-noel-erp-support"
              style={{
                background: 'var(--cc-papaya)',
                color: 'var(--cc-corbeau)',
                fontSize: 13,
                fontWeight: 700,
                padding: '12px 20px',
                borderRadius: 8,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: 44
              }}
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>

      {/* Mobile drawer — rendered as a sibling of <nav>, not a child.
          The nav uses backdrop-filter: blur(20px), which establishes a
          containing block for any fixed-position descendant. Nesting the
          drawer inside the nav clamped it to the nav's 64 px height, so
          the drawer rendered at height 0 and looked broken on tap.
          Backdrop blur reuses the existing nav glass token. Links reveal
          one at a time, 60 ms stagger, so the open feels like a curtain
          drawing back instead of a popup flash. Body scroll is locked
          while open to prevent the background drifting under the panel. */}
      {mobileOpen && <MobileDrawerScrollLock />}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(244, 237, 228, 0.96)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          top: 64,
        }}
        aria-hidden={!mobileOpen}
      >
        <div className="h-full overflow-y-auto px-[clamp(1.5rem,5vw,4rem)] pt-6 pb-12 flex flex-col gap-1">
          {(() => {
            // Flat list so the stagger index is across all items, not
            // restarted per section. 60 ms between each.
            type Item =
              | { type: "heading"; label: string }
              | { type: "link"; label: string; href: string };
            const items: Item[] = [
              { type: "heading", label: "Solutions" },
              ...PILLARS.map((p) => ({ type: "link" as const, label: p.label, href: `/category/${p.slug}` })),
              { type: "heading", label: "Tools" },
              ...TOOLS.map((t) => ({ type: "link" as const, label: t.label, href: `/${t.slug}` })),
              { type: "heading", label: "Company" },
              { type: "link", label: "Books", href: "/books" },
              { type: "link", label: "About", href: "/about" },
              { type: "link", label: "Contact", href: "/contact-noel-erp-support" },
            ];
            return items.map((item, i) => {
              const baseDelay = mobileOpen ? i * 60 : 0;
              const style = {
                transitionDelay: `${baseDelay}ms`,
                opacity: mobileOpen ? 1 : 0,
                transform: mobileOpen ? "translateY(0)" : "translateY(-8px)",
                transitionProperty: "opacity, transform" as const,
                transitionDuration: "320ms",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" as const,
              };
              if (item.type === "heading") {
                return (
                  <div
                    key={`h-${item.label}-${i}`}
                    style={style}
                    className="text-[0.72rem] font-semibold tracking-[2px] uppercase text-eyebrow pt-4 pb-1 first:pt-0"
                  >
                    {item.label}
                  </div>
                );
              }
              return (
                <Link
                  key={`l-${item.href}`}
                  href={item.href}
                  style={style}
                  className="text-corbeau no-underline text-[1.05rem] font-medium py-3 min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
              );
            });
          })()}
        </div>
      </div>
    </>
  );
}
