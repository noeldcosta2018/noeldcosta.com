import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getMessages } from "@/lib/i18n/useTranslation";

// Next.js renders this file when no route under (site-en) matches and
// for any explicit notFound() call within that route group. Sits within
// the (site-en) root layout, so Nav + Footer pick up the existing
// English chrome by default.
//
// Block 6c i18n: this is a static prerendered page (server component,
// no params, no headers), so the active locale is not directly
// derivable from the request. Defaults to English — appropriate for the
// English route group. Translated routes under (site-intl)/intl/[lang]/
// fall back to Next.js's built-in 404 unless a corresponding
// not-found.tsx is added there in a future block.

const locale = "en";

export default function NotFound() {
  const m = getMessages(locale);
  return (
    <>
      <Nav />
      <main
        className="bg-bone"
        style={{
          padding: "clamp(6rem,12vw,10rem) clamp(1.5rem,5vw,4rem)",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <div className="max-w-[640px] mx-auto text-center">
          <p className="font-mono text-[0.72rem] font-medium tracking-[2.5px] uppercase text-papaya mb-3">
            404
          </p>
          <h1
            className="font-display font-black tracking-[-0.04em] leading-[1.05] text-corbeau mb-5"
            style={{ fontSize: "clamp(2.5rem,6vw,4rem)" }}
          >
            {m.error.notFoundH1}
          </h1>
          <p className="text-night text-[1.05rem] leading-[1.65] mb-10 max-w-[480px] mx-auto">
            {m.error.notFoundBody}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-papaya text-corbeau font-bold text-[0.95rem] no-underline px-7 py-3.5 rounded-[10px] transition-all hover:bg-[#fb8843] hover:-translate-y-px min-h-[44px]"
          >
            {m.error.backHomeCta}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  );
}
