"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, FADE, GROW_X, RISE, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { decimals, flag, formatNumber, num, pairs, parallel, round, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-funnel>: a narrowing funnel of stages with counts and the
 * share that survives each step.
 *
 *   <explainer-funnel title="From AI idea to funded use case" caption="..." stages="Ideas raised by the business => 64|Have usable data today => 27|Pass the risk review => 15|Have a named business owner => 9|Funded for build => 4"></explainer-funnel>
 *
 * Stages are "name => number", widest first. Two to seven stages.
 * `suffix`/`prefix` wrap the numbers. The survival rate between stages is
 * shown unless `rates="false"`. The last stage carries the accent.
 */

const T0 = 0.1;
const STEP = 0.42;

export default function ExplainerFunnel(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const raw = pairs(props.stages).slice(0, 7);
  const stages = raw
    .map((s) => ({ label: s.label, raw: s.value, value: num(s.value) }))
    .filter((s) => s.label && Number.isFinite(s.value) && s.value >= 0);
  const notes = parallel(props.notes, stages.length);
  const prefix = text(props.prefix);
  const suffix = text(props.suffix);
  const showRates = flag(props.rates, true);
  if (stages.length < 2) return null;

  const n = stages.length;
  const top = Math.max(...stages.map((s) => s.value)) || 1;
  const places = decimals(stages.map((s) => s.raw));
  // Floor keeps tiny final stages visible as a bar.
  const width = (v: number) => round(Math.max(v / top, 0.14) * 100, 2);
  const at = (i: number) => T0 + i * STEP;

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="funnel" {...frameText(props)}>
      <ol className="nd-x-fun">
        {stages.map((s, i) => {
          const next = stages[i + 1];
          const rate = next && s.value > 0 ? Math.round((next.value / s.value) * 100) : null;
          return (
            <li key={i} className={i === n - 1 ? "is-last" : undefined}>
              <div className="row">
                <motion.span
                  className="bar"
                  style={{ width: `${width(s.value)}%` }}
                  variants={GROW_X}
                  custom={at(i)}
                  aria-hidden="true"
                />
                <motion.span className="txt" variants={RISE} custom={at(i) + 0.12}>
                  <span className="lbl">{s.label}</span>
                  <span className="val">
                    {prefix}
                    {formatNumber(s.value, places)}
                    {suffix}
                  </span>
                </motion.span>
              </div>
              {notes[i] && (
                <motion.span className="note" variants={FADE} custom={at(i) + 0.2}>
                  {notes[i]}
                </motion.span>
              )}
              {next && (
                <div className="neck">
                  <svg viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <motion.polygon
                      points={`${round(50 - width(s.value) / 2, 2)},0 ${round(50 + width(s.value) / 2, 2)},0 ${round(50 + width(next.value) / 2, 2)},10 ${round(50 - width(next.value) / 2, 2)},10`}
                      variants={FADE}
                      custom={at(i) + 0.25}
                    />
                  </svg>
                  {showRates && rate !== null && (
                    <motion.span className="rate" variants={FADE} custom={at(i) + 0.32}>
                      {rate}%
                    </motion.span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </ExplainerFrame>
  );
}
