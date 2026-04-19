import Image from "next/image";

function FloatCard({
  position,
  icon,
  strong,
  sub,
}: {
  position: "bottom-left" | "top-right";
  icon: React.ReactNode;
  strong: string;
  sub: string;
}) {
  const pos =
    position === "bottom-left"
      ? "absolute bottom-[-16px] left-[-20px]"
      : "absolute top-[20px] right-[-20px]";
  return (
    <div
      className={`${pos} bg-paper border border-corbeau/[0.08] rounded-xl px-[18px] py-[14px] shadow-[0_8px_32px_rgba(14,16,32,0.08)] flex items-center gap-3 max-md:hidden`}
    >
      <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-papaya" style={{ background: "rgba(252,152,90,0.1)" }}>
        {icon}
      </div>
      <div className="flex flex-col">
        <strong className="font-display text-[0.85rem] font-black tracking-[-0.02em]">{strong}</strong>
        <span className="font-mono text-[0.65rem] text-silver tracking-[0.5px]">{sub}</span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      className="bg-bone"
      style={{ padding: "clamp(5rem,12vw,10rem) clamp(1.5rem,5vw,4rem) clamp(4rem,8vw,7rem)" }}
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-[1.1fr_0.9fr] gap-[clamp(2rem,5vw,5rem)] items-center max-lg:grid-cols-1">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-6">
            <span className="w-[7px] h-[7px] rounded-full bg-brand-green animate-pulse-dot" />
            ERP · Data · AI
          </div>

          <h1
            className="font-display font-black leading-[1.04] tracking-[-0.04em] mb-6 text-corbeau"
            style={{ fontSize: "clamp(2.8rem,5.5vw,4.2rem)" }}
          >
            Your ERP is moving to S/4HANA.{" "}
            <em className="not-italic text-papaya font-extrabold">
              Let&apos;s make sure it actually works.
            </em>
          </h1>

          <p
            className="text-night max-w-[480px] leading-[1.75] mb-10"
            style={{ fontSize: "1.05rem" }}
          >
            I help companies migrate from ECC to S/4HANA. Build AI on top of
            ERP. Get real value from systems that cost millions. 25 years doing
            this. Finance background. I build my own tools.
          </p>

          <div className="flex gap-3 flex-wrap max-sm:flex-col">
            <a
              href="#cta"
              className="inline-flex items-center gap-1.5 bg-papaya text-corbeau px-7 py-3.5 rounded-[10px] no-underline font-bold text-[0.92rem] transition-all hover:bg-[#fdaa78] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(252,152,90,0.3)] max-sm:justify-center"
            >
              Talk about your project →
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-1.5 bg-transparent text-corbeau px-7 py-3.5 rounded-[10px] no-underline font-semibold text-[0.92rem] border border-corbeau/[0.15] transition-all hover:border-corbeau/35 hover:-translate-y-px max-sm:justify-center"
            >
              See how I help
            </a>
          </div>
        </div>

        {/* Right — headshot */}
        <div className="relative max-lg:max-w-[400px] max-lg:mt-8">
          <div
            className="relative w-full aspect-[4/5] rounded-[20px] border border-corbeau/[0.06] overflow-hidden"
            style={{ background: "linear-gradient(135deg,#faf6f0,#fffdf9)", maxWidth: 420 }}
          >
            <Image
              src="/headshot.png"
              alt="Noel D'Costa"
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          <FloatCard
            position="bottom-left"
            strong="25+ Years"
            sub="SAP · Oracle · AI"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10M18 20V4M6 20v-4" />
              </svg>
            }
          />
          <FloatCard
            position="top-right"
            strong="CIMA · AICPA"
            sub="Masters in Accounting"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1 4 3 6 3s6-2 6-3v-5" />
              </svg>
            }
          />
        </div>
      </div>
    </section>
  );
}
