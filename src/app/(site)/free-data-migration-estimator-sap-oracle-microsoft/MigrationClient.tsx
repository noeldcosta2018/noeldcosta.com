"use client";

import { useState } from "react";
import ToolForm, { type FieldDef } from "@/components/tools/ToolForm";
import ToolOutput, { toolErrorMessage } from "@/components/tools/ToolOutput";
import { TOOL_COPY_EN, type ToolCopy } from "@/components/tools/tool-copy";
import { FIELDS, HEADING, SUBMIT, TOOL } from "./tool";

// Labels arrive translated from the server on translated pages; English
// pages use the defaults from ./tool.
export default function MigrationClient({
  fields = FIELDS,
  heading = HEADING,
  submitLabel = SUBMIT,
  copy = TOOL_COPY_EN,
}: {
  fields?: FieldDef[];
  heading?: string;
  submitLabel?: string;
  copy?: ToolCopy;
}) {
  const [markdown, setMarkdown] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setMarkdown("");
    setStreaming(false);
    setError("");
  }

  return (
    <div>
      <div>
        <div className="nda-tool-head">
          <h2>{heading}</h2>
          <p>{copy.required}</p>
        </div>
        <ToolForm
          slug={TOOL.slug}
          fields={fields}
          copy={copy}
          submitLabel={submitLabel}
          onResult={(md) => {
            setMarkdown(md);
            setStreaming(false);
          }}
          onStreamChunk={(partial) => {
            setMarkdown(partial);
            setStreaming(true);
          }}
          onError={(msg) => {
            setError(msg);
            setStreaming(false);
          }}
          onSubmitting={(s) => {
            if (s) {
              setMarkdown("");
              setError("");
              setStreaming(false);
            }
          }}
        />
        {error && (
          <p role="alert" className="nda-alert" style={{ marginTop: 16 }}>
            {toolErrorMessage(error, copy)}
          </p>
        )}
      </div>

      {markdown && (
        <ToolOutput
          markdown={markdown}
          isStreaming={streaming}
          onReset={reset}
          copy={copy}
        />
      )}
    </div>
  );
}
