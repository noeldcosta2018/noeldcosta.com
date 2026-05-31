"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Same pathname-based locale detection used by Nav, LanguageSwitcher,
// and other client components on the public site.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

export default function StickyCTA() {
  const pathname = usePathname();
  const { messages: m } = useTranslation(detectLocale(pathname));
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const h = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <a
      href="https://calendly.com/noeldcosta/30min"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "13px 20px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        background: "var(--cc-papaya)",
        color: "var(--cc-corbeau)",
        textDecoration: "none",
        boxShadow: "0 4px 20px rgba(252,152,90,0.4), 0 2px 8px rgba(14,16,32,0.15)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        pointerEvents: visible ? "auto" : "none",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        whiteSpace: "nowrap",
      }}
    >
      {m.stickyCta.bookConsultation} <ArrowUpRight size={14} />
    </a>
  );
}
