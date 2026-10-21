"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, variants, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { pairs, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-fixes>: matched pairs of a common mistake and its fix, read as
 * one row each. Use it where a "what goes wrong / what works" comparison has
 * items that answer each other one to one.
 *
 *   <explainer-fixes title="..." caption="..." wrong-label="How it goes wrong" right-label="What works" rows="A chatbot as the first project => Internal copilots first|Pilots outside model risk => Model risk from day one"></explainer-fixes>
 *
 * Two to six rows, each "mistake => fix". The mistake is set back and struck
 * through; the fix follows it in full weight.
 */

const T0 = 0.15;
const STEP = 0.42;

const RISE = variants({ opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.5);
const SLIDE = variants({ opacity: 0, x: -12 }, { opacity: 1, x: 0 }, 0.5);

export default function ExplainerFixes(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const rows = pairs(props.rows).slice(0, 6).filter((r) => r.label && r.value);
  if (rows.length < 2) return null;
  const wrongLabel = text(props["wrong-label"]) || "What goes wrong";
  const rightLabel = text(props["right-label"]) || "What works";

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="fixes" {...frameText(props)}>
      <div className="nd-x-fixes">
        <div className="nd-x-fixes-head" aria-hidden="true">
          <span />
          <span className="wrong">{wrongLabel}</span>
          <span />
          <span className="right">{rightLabel}</span>
        </div>
        <ol>
          {rows.map((row, i) => {
            const t = T0 + i * STEP;
            return (
              <li key={i} className="nd-x-fix">
                <motion.span className="idx" variants={RISE} custom={t} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </motion.span>
                <motion.span className="wrong" variants={RISE} custom={t}>
                  <span className="sr-only">{wrongLabel}: </span>
                  <span className="txt">{row.label}</span>
                </motion.span>
                <motion.span className="arrow" variants={RISE} custom={t + 0.45} aria-hidden="true">
                  →
                </motion.span>
                <motion.span className="right" variants={SLIDE} custom={t + 0.5}>
                  <span className="sr-only">{rightLabel}: </span>
                  {row.value}
                </motion.span>
              </li>
            );
          })}
        </ol>
      </div>
    </ExplainerFrame>
  );
}
