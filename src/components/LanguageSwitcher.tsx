"use client";

import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LOCALE_NATIVE_NAMES,
  TARGET_LANGUAGES,
  isTargetLanguage,
  type Locale,
} from "@/lib/locales";
import { useTranslation } from "@/lib/i18n/useTranslation";

// English + the 10 routed locales. English is implicit at the URL root
// (no prefix). Order: English first, then the TARGET_LANGUAGES list as
// declared in locales.ts so the order stays a single source of truth.
const SWITCHER_LOCALES: readonly Locale[] = ["en", ...TARGET_LANGUAGES];

// Detect the locale of the current URL. Handles two shapes:
//   1. /ja/sap-implementation/   — what the browser shows.
//   2. /intl/ja/sap-implementation/ — the internal rewrite destination
//      from next.config.ts. Should not appear in usePathname() under
//      normal routing, but treat it the same defensively.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

// Build the target URL when the user picks a language. Strips any
// existing locale prefix (and the /intl/ rewrite shim), then prepends
// the target locale — unless target is English, which lives at root.
function buildTargetHref(
  pathname: string | null,
  target: Locale,
): string {
  if (!pathname) return target === "en" ? "/" : `/${target}/`;
  const stripped = pathname.startsWith("/intl/")
    ? pathname.slice(5)
    : pathname;
  const segments = stripped.split("/").filter(Boolean);
  if (segments.length > 0 && isTargetLanguage(segments[0])) {
    segments.shift();
  }
  const rest = segments.length === 0 ? "/" : `/${segments.join("/")}/`;
  return target === "en" ? rest : `/${target}${rest}`;
}

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const currentLocale = detectLocale(pathname);
  const { messages: m } = useTranslation(currentLocale);

  // Hide the switcher while the mobile drawer in Nav.tsx is open — they
  // both sit at z-40 and the switcher is rendered later in the document,
  // so without this it floats on top of the drawer overlay. CSS :has()
  // would be cleaner but Lightning CSS in the Next 16 + Tailwind v4 build
  // strips the rule, so detect drawer state via a MutationObserver on the
  // drawer's aria-hidden attribute (set by Nav.tsx) and unmount when open.
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const drawer = document.getElementById("mobile-menu");
    if (!drawer) return;
    const update = () => {
      setDrawerOpen(drawer.getAttribute("aria-hidden") === "false");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(drawer, {
      attributes: true,
      attributeFilter: ["aria-hidden"],
    });
    return () => observer.disconnect();
  }, []);

  // Outside-click close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !dropdownRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // Escape closes and returns focus to the trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus to the current language option when the dropdown opens.
  useEffect(() => {
    if (!open) return;
    const el = optionRefs.current[currentLocale];
    el?.focus();
  }, [open, currentLocale]);

  // Close on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function navigateTo(target: Locale) {
    const href = buildTargetHref(pathname, target);
    setOpen(false);
    router.push(href);
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const codes = SWITCHER_LOCALES;
    const activeIdx = codes.findIndex(
      (l) => document.activeElement === optionRefs.current[l],
    );
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = codes[(activeIdx + 1 + codes.length) % codes.length];
      optionRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = codes[(activeIdx - 1 + codes.length) % codes.length];
      optionRefs.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      optionRefs.current[codes[0]]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      optionRefs.current[codes[codes.length - 1]]?.focus();
    }
  }

  if (drawerOpen) return null;

  return (
    <div
      data-lang-switcher
      className="fixed z-40 print:hidden"
      style={{
        bottom: "max(1rem, env(safe-area-inset-bottom))",
        // Logical inline-end so the FAB flips to bottom-left under
        // <html dir="rtl"> on Arabic routes. The safe-area inset stays
        // as `safe-area-inset-right` because the iOS notch is a physical
        // viewport edge — it doesn't flip with text direction. See
        // _docs/coding-conventions.md (RTL section).
        insetInlineEnd: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={m.languageSwitcher.selectLanguage}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[44px] rounded-full text-[0.85rem] font-semibold text-corbeau cursor-pointer transition-colors hover:bg-paper sm:text-[0.9rem]"
        style={{
          background: "rgba(244, 237, 228, 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(14, 16, 32, 0.1)",
          boxShadow: "var(--cc-shadow-md)",
          fontFamily: "var(--font-display)",
        }}
      >
        <Globe size={16} aria-hidden="true" />
        <span>{LOCALE_NATIVE_NAMES[currentLocale]}</span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-label={m.languageSwitcher.selectLanguage}
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="absolute end-0 bottom-full mb-2 w-[220px] rounded-lg overflow-hidden transition-opacity duration-150"
          style={{
            background: "rgba(244, 237, 228, 0.96)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(14, 16, 32, 0.1)",
            boxShadow: "var(--cc-shadow-lg)",
          }}
        >
          <ul className="list-none p-1 m-0 max-h-[60vh] overflow-y-auto">
            {SWITCHER_LOCALES.map((loc) => {
              const isCurrent = loc === currentLocale;
              return (
                <li key={loc} className="m-0 p-0">
                  <div
                    ref={(el) => {
                      optionRefs.current[loc] = el;
                    }}
                    role="option"
                    aria-selected={isCurrent}
                    tabIndex={0}
                    lang={loc}
                    dir={loc === "ar" ? "rtl" : "ltr"}
                    onClick={() => navigateTo(loc)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigateTo(loc);
                      }
                    }}
                    className={`w-full px-3 py-2 min-h-[44px] rounded inline-flex items-center justify-between gap-3 text-[0.9rem] cursor-pointer transition-colors hover:bg-corbeau/[0.05] focus:bg-corbeau/[0.05] focus:outline-none ${
                      isCurrent
                        ? "font-bold text-corbeau"
                        : "font-medium text-night"
                    }`}
                    style={{
                      background: isCurrent
                        ? "var(--cc-accent-soft)"
                        : "transparent",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    <span>{LOCALE_NATIVE_NAMES[loc]}</span>
                    {isCurrent && (
                      <Check
                        size={14}
                        aria-hidden="true"
                        style={{ color: "var(--cc-accent)" }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
