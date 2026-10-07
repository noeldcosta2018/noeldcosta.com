"use client";

import { motion, type Variants } from "framer-motion";
import { DIM, EASE, ExplainerFrame, RISE, flash, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { list, parallel, round, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-cycle>: a loop where the active step travels around once and
 * comes back to the start. Build-test-fix sprints, plan-do-check-act,
 * model monitoring, the month-end close.
 *
 *   <explainer-cycle title="The build loop" caption="..." steps="Learn|Build|Submit|Feedback|Fix" notes="One concept|A working automation|Evidence, not a quiz|Reviewed by a practitioner|Ship the corrected version" center="Repeat until it works in production"></explainer-cycle>
 *
 * Three to eight steps. A ring from ~520px of figure width when there are
 * six or fewer; a numbered list with a loop-back row below that.
 */

const T0 = 0.2;
const SEG = 0.7;
const R = 36; // ring radius, % of the square stage

export default function ExplainerCycle(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const steps = list(props.steps).slice(0, 8);
  const notes = parallel(props.notes, steps.length);
  const center = text(props.center);
  if (steps.length < 3) return null;

  const n = steps.length;
  const ring = n <= 6;
  const arrive = (i: number) => T0 + i * SEG;
  const loop = n * SEG; // one full turn
  const back = T0 + loop; // the marker is home again

  const angle = (i: number) => -90 + (i * 360) / n;
  const pos = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: round(50 + R * Math.cos(rad), 2), y: round(50 + R * Math.sin(rad), 2) };
  };

  // Marker and progress arc: stop-and-go, one eased segment per step.
  const turns = Array.from({ length: n + 1 }, (_, i) => (i * 360) / n);
  const times = turns.map((_, i) => round(i / n, 4));
  const segEase = Array.from({ length: n }, () => EASE);
  const MARKER: Variants = {
    static: { rotate: 0, opacity: 0, transition: { duration: 0 } },
    armed: { rotate: 0, opacity: 0, transition: { duration: 0 } },
    play: {
      rotate: turns,
      opacity: [0, 1, 1, 0],
      transition: {
        rotate: { delay: T0, duration: loop, times, ease: segEase },
        opacity: { delay: T0, duration: loop + 0.2, times: [0, 0.04, 0.92, 1] },
      },
    },
  };
  const ARC: Variants = {
    static: { pathLength: 1, opacity: 0, transition: { duration: 0 } },
    armed: { pathLength: 0, opacity: 1, transition: { duration: 0 } },
    play: {
      pathLength: times,
      opacity: [1, 1, 0],
      transition: {
        pathLength: { delay: T0, duration: loop, times, ease: segEase },
        opacity: { delay: T0, duration: loop + 0.6, times: [0, 0.88, 1] },
      },
    },
  };
  // Step one lights at the start and again when the loop closes.
  const total = loop + 0.4;
  const HOME: Variants = {
    static: { opacity: 1, transition: { duration: 0 } },
    armed: { opacity: 0, transition: { duration: 0 } },
    play: {
      opacity: [0, 1, 1, 0, 0, 1],
      transition: {
        delay: T0,
        duration: total,
        times: [0, round(0.2 / total, 4), round(0.55 / total, 4), round(0.85 / total, 4), round(loop / total, 4), 1],
      },
    },
  };

  const chevrons = Array.from({ length: n }, (_, i) => {
    const deg = angle(i) + 180 / n;
    const p = pos(deg);
    return { ...p, rot: round(deg + 90, 2) };
  });

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="cycle" {...frameText(props)}>
      <div className={`nd-x-cyc${ring ? " is-ring" : ""}`} style={{ ["--n" as string]: String(n) }}>
        {ring && (
          <div className="nd-x-cyc-art" aria-hidden="true">
            <svg viewBox="0 0 100 100" focusable="false">
              <circle className="base" cx="50" cy="50" r={R} />
              <g transform="rotate(-90 50 50)">
                <motion.circle className="arc" cx="50" cy="50" r={R} variants={ARC} />
              </g>
              {chevrons.map((c, i) => (
                <path
                  key={i}
                  className="chev"
                  d="M-1 -1.5 L0.7 0 L-1 1.5"
                  transform={`translate(${c.x} ${c.y}) rotate(${c.rot})`}
                />
              ))}
            </svg>
            <motion.span className="nd-x-cyc-arm" variants={MARKER}>
              <span className="marker" />
            </motion.span>
          </div>
        )}
        <ol className="nd-x-cyc-steps">
          {steps.map((step, i) => {
            const p = pos(angle(i));
            return (
              <li key={i} style={{ ["--x" as string]: String(p.x), ["--y" as string]: String(p.y) }}>
                <motion.span className="nd-x-cyc-card" variants={DIM} custom={arrive(i)}>
                  <span className="nd-x-node" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                    <motion.span
                      className="nd-x-hot"
                      variants={i === 0 ? HOME : flash(0, SEG + 0.15)}
                      custom={arrive(i)}
                    />
                  </span>
                  <span className="nd-x-cyc-text">
                    <span className="lbl">{step}</span>
                    {notes[i] && <span className="note">{notes[i]}</span>}
                  </span>
                </motion.span>
              </li>
            );
          })}
        </ol>
        {center && (
          <motion.p className="nd-x-cyc-center" variants={RISE} custom={back}>
            <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
              <path d="M13.25 8A5.25 5.25 0 1 1 11.6 4.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13.5 2.25v3.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{center}</span>
          </motion.p>
        )}
      </div>
    </ExplainerFrame>
  );
}
