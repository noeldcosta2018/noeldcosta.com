"use client";

import { useState } from "react";
import MdxBody from "@/components/mdx/MdxBody";
import { TOOL_COPY_EN, fill, type ToolCopy } from "@/components/tools/tool-copy";

interface ToolOutputProps {
  markdown: string;
  isStreaming: boolean;
  onReset?: () => void;
  /** Widget text, already translated on translated pages. Defaults to English. */
  copy?: ToolCopy;
}

/**
 * Visitor-facing wording for tool errors. Validation messages stay specific;
 * rate limits, timeouts and server faults read as a calm retry note instead of
 * a raw technical message.
 */
export function toolErrorMessage(raw: string, copy: ToolCopy = TOOL_COPY_EN): string {
  const msg = raw.trim();
  if (/^validation failed/i.test(msg)) {
    const detail = msg.replace(/^validation failed:?\s*/i, "");
    return detail ? fill(copy.checkFormDetail, { detail }) : copy.checkForm;
  }
  if (/rate limit/i.test(msg)) {
    return copy.rateLimit;
  }
  if (/timeout/i.test(msg)) {
    return copy.timeout;
  }
  if (/^invalid json/i.test(msg)) {
    return copy.checkForm;
  }
  return copy.failed;
}

export default function ToolOutput({
  markdown,
  isStreaming,
  onReset,
  copy = TOOL_COPY_EN,
}: ToolOutputProps) {
  const [copied, setCopied] = useState(false);
  if (!markdown) return null;

  function handleCopy() {
    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => {});
  }

  return (
    <div className="nda-out" aria-live="polite" aria-busy={isStreaming}>
      <div className="bar">
        <span className="state">
          {isStreaming && <i aria-hidden="true" />}
          {isStreaming ? copy.generating : copy.yourResult}
        </span>
        {!isStreaming && (
          <div className="acts">
            <button type="button" onClick={handleCopy}>
              {copied ? copy.copied : copy.copy}
            </button>
            <button type="button" onClick={() => window.print()}>
              {copy.print}
            </button>
            {onReset && (
              <button type="button" onClick={onReset}>
                {copy.startOver}
              </button>
            )}
          </div>
        )}
      </div>

      {/* The generated result is English; marked as such on translated pages. */}
      <div className="body prose-noel" lang={copy.englishLang}>
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
