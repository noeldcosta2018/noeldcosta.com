import Image from "next/image";
import Link from "next/link";

/**
 * Post-article credibility block. Mirrors the restrained Hero pattern: real
 * headshot in a softly rounded frame, mono eyebrow label, short bio, three
 * inline links in house style (no social icon soup).
 */
export default function AuthorBox({ localePrefix }: { localePrefix: string }) {
  return (
    <aside className="mt-16 pt-10 border-t border-corbeau/10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div className="flex-shrink-0">
          <div
            className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-corbeau/[0.08]"
            style={{ background: "linear-gradient(135deg,#faf6f0,#fffdf9)" }}
          >
            <Image
              src="/headshot.png"
              alt="Noel D'Costa"
              fill
              sizes="96px"
              className="object-cover object-top"
            />
          </div>
        </div>
        <div className="flex-1">
          <p className="font-mono text-[0.68rem] font-medium tracking-[2px] uppercase text-papaya mb-2">
            Written by
          </p>
          <h3 className="font-display font-black text-corbeau text-[1.5rem] md:text-[1.65rem] tracking-[-0.03em] leading-[1.1] mb-3">
            Noel D&apos;Costa
          </h3>
          <p className="text-night leading-[1.7] text-[0.95rem] max-w-[38rem] mb-5">
            25 years across SAP and Oracle ERP programmes in aviation,
            government, finance, retail, and manufacturing. Finance background.
            I help leadership teams scope transformations honestly, recover
            programmes in trouble, and build systems that survive their first
            year in production.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.72rem] uppercase tracking-[1.6px]">
            <Link
              href={`${localePrefix}/about`}
              className="text-corbeau hover:text-papaya transition-colors"
            >
              About Noel →
            </Link>
            <a
              href="https://www.linkedin.com/in/noeldcosta/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-night hover:text-corbeau transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@NoelDCostaERPAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-night hover:text-corbeau transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
