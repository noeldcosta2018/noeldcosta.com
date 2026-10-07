"use client";

import { motion, type Variants } from "framer-motion";
import { DIM, ExplainerFrame, RISE, flash, useExplainer, variants } from "./core";
import { frameText } from "./frame-text";
import { list, parallel, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-flow>: a process flow where a pulse travels node to node.
 * Procure-to-pay, record-to-report, order-to-cash, an approval chain.
 *
 *   <explainer-flow title="Procure-to-pay in S/4HANA" caption="..." steps="Purchase requisition|Purchase order|Goods receipt|Invoice receipt|Payment run" notes="ME51N|ME21N|MIGO posts GR/IR|MIRO three-way match|F110 clears GR/IR" result="Vendor paid, GR/IR account cleared"></explainer-flow>
 *
 * Two to seven steps. A row from ~560px of figure width when there are six
 * or fewer; a vertical rail otherwise.
 */

const T0 = 0.15; // first node lights
const HOLD = 0.2; // pause on a node before the pulse leaves
const TRAVEL = 0.6; // pulse travel time between nodes

// The link fills as --p runs 0% to 100%; the pulse dot rides the same value.
const DRAW = variants({ "--p": "0%" }, { "--p": "100%" }, TRAVEL);
const PULSE: Variants = {
  static: { opacity: 0, transition: { duration: 0 } },
  armed: { opacity: 0, transition: { duration: 0 } },
  play: (delay: number = 0) => ({
    opacity: [0, 1, 1, 0],
    transition: { delay, duration: TRAVEL + 0.08, times: [0, 0.12, 0.86, 1] },
  }),
};

export default function ExplainerFlow(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const steps = list(props.steps).slice(0, 7);
  const notes = parallel(props.notes, steps.length);
  const result = text(props.result);
  if (steps.length < 2) return null;

  const n = steps.length;
  const arrive = (i: number) => T0 + i * (HOLD + TRAVEL);
  const row = n <= 6;

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="flow" {...frameText(props)}>
      <ol
        className={`nd-x-flow${row ? " is-row" : ""}`}
        style={{ ["--n" as string]: String(n) }}
      >
        {steps.map((step, i) => (
          <li key={i} className={i === n - 1 ? "is-last" : undefined}>
            <motion.span className="nd-x-node" variants={DIM} custom={arrive(i)} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
              <motion.span
                className="nd-x-hot"
                variants={flash(i === n - 1 ? 1 : 0, HOLD + TRAVEL)}
                custom={arrive(i)}
              />
            </motion.span>
            <motion.span className="nd-x-flow-text" variants={RISE} custom={arrive(i) + 0.05}>
              <span className="nd-x-flow-label">{step}</span>
              {notes[i] && <span className="nd-x-flow-note">{notes[i]}</span>}
            </motion.span>
            {i < n - 1 && (
              <motion.span className="nd-x-link" aria-hidden="true" variants={DRAW} custom={arrive(i) + HOLD}>
                <span className="fill" />
                <motion.span className="pulse" variants={PULSE} custom={arrive(i) + HOLD} />
              </motion.span>
            )}
          </li>
        ))}
      </ol>
      {result && (
        <motion.p className="nd-x-result" variants={RISE} custom={arrive(n - 1) + 0.35}>
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
            <path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{result}</span>
        </motion.p>
      )}
    </ExplainerFrame>
  );
}
