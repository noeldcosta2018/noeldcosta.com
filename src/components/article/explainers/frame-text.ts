import { text, type ExplainerAttrs } from "./parse";

/** The attributes every explainer shares, mapped to ExplainerFrame props. */
export function frameText(props: ExplainerAttrs) {
  return {
    title: text(props.title) || undefined,
    caption: text(props.caption) || undefined,
    source: text(props.source) || undefined,
    // An explicit empty source-label drops the "Source:" prefix.
    sourceLabel: props["source-label"] !== undefined ? text(props["source-label"]) : undefined,
    replayLabel: text(props["replay-label"]) || undefined,
  };
}
