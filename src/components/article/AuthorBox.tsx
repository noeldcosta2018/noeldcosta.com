import Image from "next/image";
import Link from "next/link";

/**
 * End-of-article author + CTA module. One card, not two stacked ones:
 * previously the site had a separate "Written by" card above a "Next step"
 * card, both with the same headshot and the same author attribution. Users
 * read that as two versions of the same thing — so this merges them.
 *
 * Layout: headshot | bio + primary papaya CTA (mailto) + secondary row of
 * mono links (About Noel · LinkedIn · YouTube). Lives on the warm cream
 * gradient surface the Hero float-cards and CTA cards already use.
 */
export default function AuthorBox({ localePrefix }: { localePrefix: string }) {
  return (
    <section
      className="mt-16 rounded-[20px] border border-corbeau/[0.08] p-8 md:p-10 shadow-[0_8px_32px_rgba(14,16,32,0.06)]"
      style={{ background: "linear-gradient(135deg,#faf6f0,#fffdf9)" }}
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
        <div className="flex-shrink-0">
          <div
            className="relative w-20 h-20 md:w-[104px] md:h-[104px] rounded-xl overflow-hidden border border-corbeau/[0.08]"
            style={{ background: "#fff" }}
          >
            <Image
              src="/headshot.png"
              alt="Noel D'Costa"
              fill
              sizes="104px"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-2">
            Written by
          </p>
          <h3 className="font-display font-black text-corbeau text-[1.5rem] md:text-[1.75rem] tracking-[-0.03em] leading-[1.1] mb-4">
            Noel D&apos;Costa
          </h3>
          <p className="text-night leading-[1.7] text-[0.98rem] max-w-[38rem] mb-6">
            25 years across SAP and Oracle ERP programmes in aviation,
            government, finance, retail, and manufacturing. Finance background.
            I help leadership teams scope transformations honestly, recover
            programmes in trouble, and build systems that survive their first
            year in production.
          </p>

          {/* Primary: mail Noel directly. Same papaya solid treatment as the
              Hero CTA — the button should read as "contact the author",
              not as a tertiary link. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <a
              href="mailto:solutions@noeldcosta.com"
              className="inline-flex items-center gap-2 bg-papaya text-corbeau px-6 py-3 rounded-[10px] font-display font-bold text-[0.95rem] tracking-[-0.01em] shadow-[0_4px_18px_rgba(252,152,90,0.25)] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(252,152,90,0.35)] hover:bg-[#fda66e] transition-all"
            >
              Talk to me
              <span aria-hidden className="text-[1.1em] leading-none">→</span>
            </a>

            {/* Secondary trio — mono uppercase, middle-dot separated so it
                reads as a compact footer row, not three competing buttons. */}
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[0.7rem] uppercase tracking-[1.6px]">
              <Link
                href={`${localePrefix}/about`}
                className="px-2 py-1 text-corbeau/70 hover:text-papaya transition-colors"
              >
                About Noel
              </Link>
              <span aria-hidden className="text-corbeau/25">·</span>
              <a
                href="https://www.linkedin.com/in/noeldcosta/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-corbeau/70 hover:text-papaya transition-colors"
              >
                LinkedIn
              </a>
              <span aria-hidden className="text-corbeau/25">·</span>
              <a
                href="https://www.youtube.com/@NoelDCostaERPAI"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-corbeau/70 hover:text-papaya transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
