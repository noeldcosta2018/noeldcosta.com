"use client";

import MdxBody from "@/components/mdx/MdxBody";

interface ToolOutputProps {
  markdown: string;
  isStreaming: boolean;
  onReset?: () => void;
}

export default function ToolOutput({
  markdown,
  isStreaming,
  onReset,
}: ToolOutputProps) {
  if (!markdown) return null;

  function handleCopy() {
    navigator.clipboard.writeText(markdown).catch(() => {});
  }

  return (
    <div className="mt-8 border border-corbeau/10 rounded-xl overflow-hidden bg-paper">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-corbeau/10 bg-bone">
        <span className="font-mono text-[0.68rem] uppercase tracking-[1.5px] text-silver">
          {isStreaming ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-papaya animate-pulse-dot" />
              Generating…
            </span>
          ) : (
            "Result"
          )}
        </span>
        {!isStreaming && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="font-mono text-[0.7rem] text-night hover:text-corbeau transition-colors"
            >
              Copy as markdown
            </button>
            {onReset && (
              <button
                onClick={onReset}
                className="font-mono text-[0.7rem] text-papaya hover:text-[#fdaa78] transition-colors font-semibold"
              >
                Start over
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
