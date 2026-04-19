export default function Footer() {
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
            <a
              href="#"
              className="font-display font-black text-[1.2rem] text-bone no-underline tracking-[-0.04em] block mb-3"
            >
              noel<span className="text-papaya">dcosta</span>
            </a>
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

          {/* Services */}
          <div>
            <h5 className="font-mono text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver mb-4">
              Services
            </h5>
            {["SAP Implementation", "AI & Agentic AI", "Programme Recovery", "ERP Consulting Careers"].map((l) => (
              <a key={l} href="#" className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone">
                {l}
              </a>
            ))}
          </div>

          {/* Free Tools */}
          <div>
            <h5 className="font-mono text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver mb-4">
              Free Tools
            </h5>
            {[
              { label: "Command Central", href: "#" },
              { label: "ERPCV", href: "https://erpcv3.vercel.app/" },
              { label: "Cost Calculator", href: "#" },
              { label: "Migration Assessment", href: "#" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Company */}
          <div>
            <h5 className="font-mono text-[0.68rem] font-semibold tracking-[2px] uppercase text-silver mb-4">
              Company
            </h5>
            {[
              { label: "About", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Case Studies", href: "#" },
              { label: "YouTube", href: "https://www.youtube.com/@NoelDCostaERPAI" },
              { label: "Contact", href: "#cta" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block text-moon no-underline text-[0.88rem] mb-2.5 font-medium transition-colors hover:text-bone"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex justify-between items-center pt-8 flex-wrap gap-4">
          <span className="font-mono text-[0.72rem] text-silver">
            © 2026 Quantinoid LLC. All rights reserved.
          </span>
          <div className="flex gap-6">
            {["Support", "Privacy", "Terms"].map((l) => (
              <a key={l} href="#" className="text-[0.8rem] text-silver no-underline transition-colors hover:text-moon">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
