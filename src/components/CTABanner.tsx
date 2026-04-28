export default function CTABanner() {
  return (
    <section
      id="cta"
      className="bg-bone"
      style={{ padding: "clamp(3rem,6vw,5rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div
        className="max-w-[1200px] mx-auto relative rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#fc985a 0%,#e2826b 100%)",
          padding: "clamp(3rem,6vw,5rem) clamp(2rem,5vw,4rem)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.1,
            backgroundImage:
              "linear-gradient(rgba(14,16,32,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(14,16,32,0.5) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative">
          <p className="font-mono text-[0.68rem] font-semibold tracking-[2.5px] uppercase text-corbeau mb-3.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-corbeau" />
            READY WHEN YOU ARE
          </p>
          <h2
            className="font-display font-black tracking-[-0.04em] leading-[1.06] text-corbeau mb-3.5 max-w-[600px]"
            style={{ fontSize: "clamp(2.2rem,4.5vw,3.5rem)" }}
          >
            Your next transformation starts with a conversation.
          </h2>
          <p
            className="max-w-[480px] leading-[1.65] mb-8"
            style={{ color: "rgba(14,16,32,0.7)", fontSize: "1rem" }}
          >
            30 minutes. No sales pitch. Tell me what&apos;s going on with your ERP or
            AI project. I&apos;ll tell you straight if I can help.
          </p>
          <div className="flex gap-3 flex-wrap max-sm:flex-col">
            <a
              href="https://calendly.com/noeldcosta/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-corbeau text-bone px-7 py-3.5 rounded-[10px] no-underline font-bold text-[0.92rem] transition-all hover:bg-[#1a1c30] hover:-translate-y-px"
            >
              Book a 30-min call ↗
            </a>
            <a
              href="mailto:solutions@noeldcosta.com"
              className="inline-flex items-center text-corbeau px-7 py-3.5 no-underline font-semibold text-[0.92rem] border-b-2 border-corbeau transition-opacity hover:opacity-70"
            >
              Email me directly
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
