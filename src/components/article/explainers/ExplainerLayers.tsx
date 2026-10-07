"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, variants, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { pairs, parallel, type ExplainerAttrs } from "./parse";

/**
 * <explainer-layers>: an architecture stack that assembles from the
 * foundation up. Clean core, a data platform, an AI stack, an integration
 * landscape.
 *
 *   <explainer-layers title="A clean-core landscape" caption="..." layers="AI and agents => Joule and agents act on governed data|Data => Datasphere, one semantic layer for reporting|Integration => Integration Suite, released APIs only|Extensions => BTP side-by-side apps, no core modifications|Core ERP => S/4HANA kept to standard, upgradeable every release" tones="ai|data|apps|apps|accent"></explainer-layers>
 *
 * List layers top to bottom as "name => what lives there". Two to seven.
 * `tones` (optional, one per layer) colours the leading band: apps, data,
 * ai (the site's area colours, only where the colour means something),
 * accent (the layer the figure is about), or blank for neutral.
 */

const T0 = 0.1;
const STEP = 0.32;

// Layers settle from above, like a slab lowered onto the one below.
const DROP = variants({ opacity: 0, y: -18 }, { opacity: 1, y: 0 }, 0.55);

const TONES = new Set(["apps", "data", "ai", "accent"]);

export default function ExplainerLayers(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const layers = pairs(props.layers).slice(0, 7);
  const tones = parallel(props.tones, layers.length).map((t) => t.toLowerCase());
  if (layers.length < 2) return null;

  const n = layers.length;

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="layers" {...frameText(props)}>
      <ol className="nd-x-layers">
        {layers.map((layer, i) => {
          const rank = n - 1 - i; // 0 = foundation, built first
          const tone = TONES.has(tones[i]) ? tones[i] : "";
          return (
            <motion.li
              key={i}
              className={`nd-x-layer${tone ? ` tone-${tone}` : ""}`}
              variants={DROP}
              custom={T0 + rank * STEP}
            >
              <span className="idx" aria-hidden="true">
                {String(rank + 1).padStart(2, "0")}
              </span>
              <span className="lbl">{layer.label}</span>
              {layer.value && <span className="note">{layer.value}</span>}
            </motion.li>
          );
        })}
      </ol>
    </ExplainerFrame>
  );
}
