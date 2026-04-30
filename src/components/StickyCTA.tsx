"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

export default function StickyCTA() {
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
      Book consultation <ArrowUpRight size={14} />
    </a>
  );
}
