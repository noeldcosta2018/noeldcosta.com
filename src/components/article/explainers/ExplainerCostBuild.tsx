"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { EASE, ExplainerFrame, FADE, GROW_X, RISE, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { decimals, formatNumber, index, num, pairs, parallel, round, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-cost-build>: a total built from its components. A stacked bar
 * grows segment by segment while the running total counts up; a legend
 * lists every part with its value and a proportional bar.
 *
 *   <explainer-cost-build title="Where a mid-market S/4HANA budget goes" caption="..." parts="System integration => 42|Licences and subscription => 15|Customisation and BTP => 10|Data migration => 8|Training and change => 8|Infrastructure => 7|Contingency => 6|Hypercare => 4" suffix="%" total-label="of the programme budget"></explainer-cost-build>
 *
 * Values are numbers ("42", "1.5", "250,000"). `prefix` and `suffix` wrap
 * every value ("$", "K", "%"; default suffix "%"). `total` replaces the
 * counted sum with your own text ("$6.5M"). `highlight` (1-based) picks the
 * accent part; default is the largest.
 */

const T0 = 0.15;
const STEP = 0.32;
const SEG = 0.45;

export default function ExplainerCostBuild(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const raw = pairs(props.parts).slice(0, 10);
  const parts = raw
    .map((p) => ({ label: p.label, raw: p.value, value: num(p.value) }))
    .filter((p) => p.label && Number.isFinite(p.value) && p.value > 0);
  const notes = parallel(props.notes, parts.length);
  const prefix = text(props.prefix);
  const suffix = props.suffix !== undefined ? text(props.suffix) : "%";
  const places = decimals(parts.map((p) => p.raw));
  const sum = parts.reduce((acc, p) => acc + p.value, 0);
  const max = parts.reduce((acc, p) => Math.max(acc, p.value), 0);
  const largest = parts.findIndex((p) => p.value === max);
  const chosen = index(props.highlight, parts.length);
  const hl = chosen >= 0 ? chosen : largest;
  const totalText = text(props.total);
  const totalLabel = props["total-label"] !== undefined ? text(props["total-label"]) : "Total";

  const fmt = (v: number) => `${prefix}${formatNumber(v, places)}${suffix}`;
  const count = useMotionValue(sum);
  const shown = useTransform(count, (v) => fmt(v));
  const end = T0 + parts.length * STEP + SEG;

  useEffect(() => {
    if (x.phase === "armed") {
      count.jump(0);
      return;
    }
    if (x.phase !== "play") return;
    count.jump(0);
    const controls = animate(count, sum, { delay: T0, duration: end - T0, ease: EASE });
    return () => controls.stop();
  }, [x.phase, x.run, count, sum, end]);

  if (parts.length < 2) return null;
  const at = (i: number) => T0 + i * STEP;
  // Neutral tones step down by rank so neighbours stay distinct; the
  // highlighted part alone carries the accent.
  const alpha = (i: number) => round(Math.max(0.2, 0.68 - i * 0.07), 2);

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="cost" {...frameText(props)}>
      <div className="nd-x-cost-total">
        {totalText ? (
          <motion.span className="v" variants={FADE} custom={end}>
            {totalText}
          </motion.span>
        ) : (
          <motion.span className="v">{shown}</motion.span>
        )}
        {totalLabel && <span className="k">{totalLabel}</span>}
      </div>

      <div className="nd-x-cost-bar" aria-hidden="true">
        {parts.map((p, i) => (
          <motion.span
            key={i}
            className={`seg${i === hl ? " is-hl" : ""}`}
            style={{ flexGrow: round(p.value / sum, 4), ["--a" as string]: String(alpha(i)) }}
            variants={GROW_X}
            custom={at(i)}
          />
        ))}
      </div>

      <ol className="nd-x-cost-list" style={{ ["--rows" as string]: String(Math.ceil(parts.length / 2)) }}>
        {parts.map((p, i) => (
          <motion.li key={i} className={i === hl ? "is-hl" : undefined} variants={RISE} custom={at(i)}>
            <span className="sw" style={{ ["--a" as string]: String(alpha(i)) }} aria-hidden="true" />
            <span className="lbl">
              {p.label}
              {notes[i] && <span className="note">{notes[i]}</span>}
            </span>
            <span className="val">{fmt(p.value)}</span>
            <span className="track" aria-hidden="true">
              <motion.span
                className="fill"
                style={{ width: `${round((p.value / max) * 100, 2)}%`, ["--a" as string]: String(alpha(i)) }}
                variants={GROW_X}
                custom={at(i) + 0.08}
              />
            </span>
          </motion.li>
        ))}
      </ol>
    </ExplainerFrame>
  );
}
