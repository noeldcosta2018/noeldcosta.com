"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, GROW, POP, RISE, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { index, pairs, parallel, type ExplainerAttrs } from "./parse";

/**
 * <explainer-timeline>: milestones drawn progressively along a line.
 * SAP Activate phases, ECC maintenance dates, a programme plan.
 *
 *   <explainer-timeline title="SAP ECC support runway" caption="..." items="2027 => Mainstream maintenance ends|2030 => Extended maintenance ends|2033 => Private edition transition option ends" notes="31 December 2027|Optional, at a premium|RISE customers only" highlight="1"></explainer-timeline>
 *
 * `items` are "when => what". Two to seven items. Horizontal from ~560px of
 * figure width, a vertical rail below that. `highlight` (1-based) marks the
 * milestone that matters most in accent.
 */

const T0 = 0.1;
const STEP = 0.55;

export default function ExplainerTimeline(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const items = pairs(props.items).slice(0, 7);
  const notes = parallel(props.notes, items.length);
  const hl = index(props.highlight, items.length);
  if (items.length < 2) return null;

  const n = items.length;
  const at = (i: number) => T0 + i * STEP;

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="timeline" {...frameText(props)}>
      <ol className="nd-x-tl" style={{ ["--n" as string]: String(n) }}>
        {items.map((item, i) => (
          <li key={i} className={i === hl ? "is-hl" : undefined}>
            <motion.span className="nd-x-tl-when" variants={RISE} custom={at(i) + 0.05}>
              {item.label}
            </motion.span>
            <span className="nd-x-tl-rail" aria-hidden="true">
              <motion.span className="nd-x-tl-dot" variants={POP} custom={at(i)} />
              <motion.span
                className={`nd-x-tl-seg${i === n - 1 ? " is-tail" : ""}`}
                variants={GROW}
                custom={at(i) + 0.15}
              />
            </span>
            <motion.span className="nd-x-tl-text" variants={RISE} custom={at(i) + 0.12}>
              {item.value && <span className="nd-x-tl-what">{item.value}</span>}
              {notes[i] && <span className="nd-x-tl-note">{notes[i]}</span>}
            </motion.span>
          </li>
        ))}
      </ol>
    </ExplainerFrame>
  );
}
