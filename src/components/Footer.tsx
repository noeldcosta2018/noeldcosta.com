import Link from "next/link";

export default function Footer() {
  const solutions: { label: string; href: string }[] = [
    { label: "ERP Implementation", href: "/category/erp-implementation" },
    { label: "Platforms & Modules", href: "/category/platforms-modules" },
    { label: "ERP Strategy", href: "/category/erp-strategy" },
    { label: "AI Governance", href: "/category/ai-governance" },
    { label: "Agentic AI", href: "/category/agentic-ai" },
    { label: "Case Studies", href: "/category/case-studies" },
    { label: "Consulting Career", href: "/category/consulting-career" },
  ];
  const tools: { label: string; href: string }[] = [
    { label: "ERP Cost Calculator", href: "/erp-implementation-cost-calculator" },
    { label: "SAP Cost Calculator", href: "/sap-implementation-cost-calculator" },
    { label: "Migration Estimator", href: "/free-data-migration-estimator-sap-oracle-microsoft" },
    { label: "JD Generator", href: "/sap-job-description-generator" },
    { label: "Solution Builder", href: "/sap-solution-builder" },
  ];
  const company: { label: string; href: string; external?: boolean }[] = [
    { label: "About", href: "/about" },
    { label: "Case Studies", href: "/category/case-studies" },
    { label: "YouTube", href: "https://www.youtube.com/@NoelDCostaERPAI", external: true },
    { label: "Contact", href: "/contact" },
  ];
  return (
    <footer
      className="bg-corbeau text-moon"
      style={{ padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem) 2rem" }}
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Top grid */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-8 pb-12 border-b border-white/[0.06] max-lg:grid-cols-2 max-sm:grid-cols-1">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="font-display font-black text-[1.2rem] text-bone no-underline tracking-[-0.04em] block mb-3"
            >
              noel<span className="text-papaya">dcosta</span>
            </Link>
            <p className="text-[0.85rem] text-silver leading-[1.6] max-w-[280px]">
              ERP, Data & AI consulting. 25+ years helping companies get real
              value from SAP, Oracle, and AI systems.
            </p>
            <div className="flex gap-2 mt-4">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/noeldcosta/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-haiti rounded-lg flex items-center justify-center text-moon transition-all hover:bg-white/10 hover:text-bone"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@NoelDCostaERPAI"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-haiti rounded-lg flex items-center justify-center text-moon transition-all hover:bg-white/10 hover:text-bone"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
                  <polygon points="9.75,15.02 15.5,12 9.75,8.98"/>
                </svg>
              </a>
              {/* Email */}
              <a
                href="mailto:solutions@noeldcosta.com"
                className="w-9 h-9 bg-haiti rounded-lg flex items-center justify-center text-moon transition-all hover:bg-white/10 hover:text-bone"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <polyline points="22,4 12,13 2,4"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Solutions (includes Consulting Career — footer only) */}
          <div>
            <h5 className="font-mono text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver mb-4">
              Solutions
            </h5>
            {solutions.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Free Tools */}
          <div>
            <h5 className="font-mono text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver mb-4">
              Free Tools
            </h5>
            {tools.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <h5 className="font-mono text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver mb-4">
              Company
            </h5>
            {company.map((l) =>
              l.external ? (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone"
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  href={l.href}
                  className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone"
                >
                  {l.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-center pt-8 flex-wrap gap-4">
          <span className="font-mono text-[0.72rem] text-silver">
            © 2026 Quantinoid LLC. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[0.8rem] text-silver no-underline transition-colors hover:text-moon">
              Privacy
            </Link>
            <Link href="/terms" className="text-[0.8rem] text-silver no-underline transition-colors hover:text-moon">
              Terms
            </Link>
            <Link href="/contact" className="text-[0.8rem] text-silver no-underline transition-colors hover:text-moon">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
