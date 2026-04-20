import Link from "next/link";

/**
 * Post-article credibility block. Written once, reusable across every post;
 * if an author frontmatter field ever diverges from Noel this component can
 * accept props — but launch state is single-author so we keep it simple.
 */
export default function AuthorBox({ localePrefix }: { localePrefix: string }) {
  return (
    <aside className="mt-16 pt-10 border-t border-corbeau/10">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div className="flex-shrink-0">
          <div
            aria-hidden
            className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-corbeau text-bone font-display font-bold text-3xl flex items-center justify-center"
          >
            N
          </div>
        </div>
        <div className="flex-1">
          <p className="font-mono text-[0.62rem] font-semibold tracking-[2.5px] uppercase text-papaya mb-2">
            Written by
          </p>
          <h3 className="font-display font-bold text-corbeau text-2xl tracking-[-0.015em] mb-2">
            Noel D&apos;Costa
          </h3>
          <p className="text-night leading-[1.65] text-[0.97rem] max-w-[38rem] mb-4">
            25+ years across SAP and Oracle ERP programmes in aviation, government,
            finance, retail, and manufacturing. I help leadership teams scope
            transformations honestly, recover programmes in trouble, and build
            systems that survive their first year in production.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.72rem] uppercase tracking-[1.4px]">
            <Link
              href={`${localePrefix}/about`}
              className="text-corbeau hover:text-papaya border-b border-corbeau/20 hover:border-papaya pb-0.5 transition-colors"
            >
              About Noel
            </Link>
            <a
              href="https://www.linkedin.com/in/noeldcosta/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-corbeau hover:text-papaya border-b border-corbeau/20 hover:border-papaya pb-0.5 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.youtube.com/@NoelDCostaERPAI"
              target="_blank"
              rel="noopener noreferrer"
              className="text-corbeau hover:text-papaya border-b border-corbeau/20 hover:border-papaya pb-0.5 transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
