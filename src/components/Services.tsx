function ServiceCard({
  num,
  title,
  who,
  paras,
  list,
  cta,
  ctaHref,
  gradient,
}: {
  num: string;
  title: string;
  who: string;
  paras: string[];
  list: string[];
  cta: string;
  ctaHref: string;
  gradient: string;
}) {
  return (
    <div className="relative bg-haiti border border-white/[0.06] rounded-2xl p-10 overflow-hidden transition-all duration-300 hover:border-papaya/20 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.3)]">
      {/* top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />

      <p className="font-mono text-[0.65rem] text-silver tracking-[2px] uppercase mb-3.5">{num}</p>
      <h3 className="font-display text-[1.4rem] font-extrabold text-bone tracking-[-0.03em] mb-1">
        {title}
      </h3>
      <p className="font-mono text-canyon text-[0.7rem] font-medium uppercase tracking-[1.5px] mb-4">
        {who}
      </p>
      {paras.map((p, i) => (
        <p key={i} className="text-moon text-[0.92rem] leading-[1.7] mb-3.5">
          {p}
        </p>
      ))}
      <ul className="flex flex-col gap-2 mb-5">
        {list.map((item, i) => (
          <li
            key={i}
            className="text-[0.88rem] text-moon pl-[22px] relative leading-[1.5]"
          >
            <span
              className="absolute left-0 top-[6px] w-2 h-2 rounded-[2px] border border-papaya"
              style={{ background: "rgba(252,152,90,0.2)" }}
            />
            {item}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className="font-mono text-papaya no-underline text-[0.82rem] font-semibold transition-colors hover:text-[#fdaa78]"
      >
        {cta}
      </a>
    </div>
  );
}

export default function Services() {
  return (
    <section
      id="services"
      className="bg-corbeau text-bone"
      style={{ padding: "clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)" }}
    >
      <div className="max-w-[1200px] mx-auto">
        <p className="font-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya mb-2">
          [ 01 · Who I help ]
        </p>
        <h2
          className="font-display font-black tracking-[-0.04em] leading-[1.08] mb-2.5 text-bone"
          style={{ fontSize: "clamp(2rem,4vw,3rem)" }}
        >
          Two types of people find me useful.{" "}
          <em className="not-italic text-papaya font-extrabold">
            Maybe you&apos;re one.
          </em>
        </h2>
        <p className="text-moon text-[1rem] max-w-[520px] leading-[1.7] mb-12">
          Companies that need ERP and AI done right. Consultants who need
          straight advice on their career.
        </p>

        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <ServiceCard
            num="CLIENT · 01"
            title="Company Executives & Sponsors"
            who="CIOs · CFOs · Programme Directors"
            paras={[
              "You have an ECC to S/4HANA migration coming up. Or you're mid-implementation and things aren't going well. Maybe you want AI on top of your ERP but nobody's giving you a straight answer.",
              "I step in and get things moving. Direct involvement. No junior team learning on your budget.",
            ]}
            list={[
              "ECC to S/4HANA migration planning and delivery",
              "AI and Agentic AI strategy on SAP BTP",
              "Programme recovery when things go sideways",
              "Vendor selection and contract negotiation",
              "Solution architecture with finance depth",
            ]}
            cta="Talk about your project →"
            ctaHref="#cta"
            gradient="from-papaya to-canyon"
          />
          <ServiceCard
            num="CLIENT · 02"
            title="ERP & SAP Consultants"
            who="Independent Consultants · Career Changers"
            paras={[
              "You're trying to break into ERP consulting. Or you're already in the game and need guidance. Which certifications matter. How to position yourself. What clients actually want.",
              "25 years of experience. Happy to share what I know.",
            ]}
            list={[
              "Career path guidance for ERP consulting",
              "Which certifications actually get you hired",
              "How to build your personal brand",
              "Use ERPCV to build recruiter-ready CVs",
              "Real talk on the consulting business",
            ]}
            cta="Check out my tools →"
            ctaHref="#tools"
            gradient="from-canyon to-papaya"
          />
        </div>
      </div>
    </section>
  );
}
