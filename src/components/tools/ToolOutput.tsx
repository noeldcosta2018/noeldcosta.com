"use client";

import { usePathname } from "next/navigation";
import MdxBody from "@/components/mdx/MdxBody";
import { isTargetLanguage, type Locale } from "@/lib/locales";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ToolOutputProps {
  markdown: string;
  isStreaming: boolean;
  onReset?: () => void;
}

// Mirrors detectLocale in the other Pass 2a/2b client components.
function detectLocale(pathname: string | null): Locale {
  if (!pathname) return "en";
  const path = pathname.startsWith("/intl/") ? pathname.slice(5) : pathname;
  const first = path.split("/").filter(Boolean)[0];
  if (first && isTargetLanguage(first)) return first;
  return "en";
}

export default function ToolOutput({
  markdown,
  isStreaming,
  onReset,
}: ToolOutputProps) {
  const pathname = usePathname();
  const { messages } = useTranslation(detectLocale(pathname));
  const m = messages.toolOutput;

  if (!markdown) return null;

  function handleCopy() {
    navigator.clipboard.writeText(markdown).catch(() => {});
  }

  return (
    <div className="mt-8 border border-corbeau/10 rounded-xl overflow-hidden bg-paper">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-corbeau/10 bg-bone">
        <span className="font-mono text-[0.72rem] uppercase tracking-[1.5px] text-eyebrow">
          {isStreaming ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-papaya animate-pulse-dot" />
              {m.generating}
            </span>
          ) : (
            m.resultHeading
          )}
        </span>
        {!isStreaming && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="font-mono text-[0.7rem] text-night hover:text-corbeau transition-colors"
            >
              {m.copyMarkdown}
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="font-mono text-[0.7rem] text-papaya hover:text-[#fdaa78] transition-colors font-semibold"
              >
                {m.startOver}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6 prose-noel">
        <MdxBody source={markdown} />
        {isStreaming && (
          <span
            aria-hidden
            className="inline-block w-[2px] h-[1em] bg-papaya ml-0.5 align-text-bottom animate-soft-pulse"
          />
        )}
      </div>
    </div>
  );
}
