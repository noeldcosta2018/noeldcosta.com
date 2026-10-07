import Link from "next/link";
import type { ReactNode } from "react";
import { CONTACT } from "@/data/site-menu";

/** Premium "coming soon" block: used where a section is being prepared. */
export default function ComingSoon({
  title,
  text,
  links,
  lang,
  labels = { soon: "Coming soon", meanwhile: "Meanwhile", discuss: "Discuss your project" },
  contactHref = CONTACT,
}: {
  title: string;
  text: ReactNode;
  links?: { label: string; href: string }[];
  lang?: string;
  labels?: { soon: string; meanwhile: string; discuss: string };
  contactHref?: string;
}) {
  return (
    <div className="nd-coming" lang={lang}>
      <div className="nd-band">
        <span className="star" aria-hidden="true">
          ★
        </span>
        <div>
          <span className="nd-pill">{labels.soon}</span>
          <p style={{ marginTop: 12 }}>{title}</p>
          <p className="sub">{text}</p>
        </div>
      </div>
      <div className="nd-tools" style={{ marginTop: 16 }}>
        <span className="nd-label">{labels.meanwhile}</span>
        {(links ?? []).map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href={contactHref}>
          {labels.discuss} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
