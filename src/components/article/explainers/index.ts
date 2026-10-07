/**
 * Animated explainer figures for articles. Each one is a client component
 * that takes its data as string attributes from a single-line MDX tag
 * (see README.md in this folder for the exact syntax of every tag).
 * MdxBody registers the tags; `explainerProps` strips the markdown node
 * before the attributes cross into the client components.
 */
export { default as ExplainerFlow } from "./ExplainerFlow";
export { default as ExplainerTimeline } from "./ExplainerTimeline";
export { default as ExplainerCostBuild } from "./ExplainerCostBuild";
export { default as ExplainerCompare } from "./ExplainerCompare";
export { default as ExplainerCycle } from "./ExplainerCycle";
export { default as ExplainerLayers } from "./ExplainerLayers";
export { default as ExplainerFunnel } from "./ExplainerFunnel";
export { default as ExplainerMatrix } from "./ExplainerMatrix";
export { default as ExplainerBeforeAfter } from "./ExplainerBeforeAfter";
export { default as ExplainerOrg } from "./ExplainerOrg";
export { explainerProps } from "./parse";

/** Tag names, for MdxBody's block-level paragraph unwrapping. */
export const EXPLAINER_TAGS = [
  "explainer-flow",
  "explainer-timeline",
  "explainer-cost-build",
  "explainer-compare",
  "explainer-cycle",
  "explainer-layers",
  "explainer-funnel",
  "explainer-matrix",
  "explainer-before-after",
  "explainer-org",
] as const;
