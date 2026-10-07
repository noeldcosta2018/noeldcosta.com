"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { EASE, ExplainerFrame, FADE, GROW_X, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { decimals, formatNumber, list, num, round, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-before-after>: one metric in two states with a toggle. Plays
 * the "before" state first, then switches to "after"; readers can flip
 * between them. Both values and both bars stay visible as text.
 *
 *   <explainer-before-after title="Month-end close after the Universal Journal" caption="..." metric="Working days to close" before-label="ECC 6.0" after-label="S/4HANA" before-value="12" after-value="5" unit="days" before-points="FI and CO reconciled every period|Aggregate tables rebuilt overnight|Intercompany matched in spreadsheets" after-points="FI and CO share one journal (ACDOCA)|No aggregates to rebuild|Intercompany matched in the system"></explainer-before-after>
 *
 * Values are numbers; `prefix` ("$") and `unit` ("days", "%") wrap them.
 * The change between the two values is shown as an absolute and a
 * percentage difference.
 */

type State = "before" | "after";

const BEFORE_AT = 0.2;
const SWITCH_AT = 1.5;
const AFTER_AT = SWITCH_AT + 0.15;

export default function ExplainerBeforeAfter(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const metric = text(props.metric);
  const labels = {
    before: text(props["before-label"]) || "Before",
    after: text(props["after-label"]) || "After",
  };
  const rawBefore = text(props["before-value"]);
  const rawAfter = text(props["after-value"]);
  const vBefore = num(rawBefore);
  const vAfter = num(rawAfter);
  const values = { before: vBefore, after: vAfter };
  const points = { before: list(props["before-points"]), after: list(props["after-points"]) };
  const unit = text(props.unit);
  const prefix = text(props.prefix);
  const places = decimals([rawBefore, rawAfter]);
  const valid = Number.isFinite(vBefore) && Number.isFinite(vAfter);

  const [active, setActive] = useState<State>("after");
  const count = useMotionValue(valid ? vAfter : 0);
  const shown = useTransform(count, (v) => `${prefix}${formatNumber(v, places)}`);
  // Auto-play timers live in a ref so a click can cancel them.
  const timers = useRef<number[]>([]);
  const tween = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (!valid) return;
    if (x.phase === "armed") {
      count.jump(vBefore);
      return;
    }
    if (x.phase !== "play") return;
    count.jump(vBefore);
    const ids = [
      window.setTimeout(() => setActive("before"), 0),
      window.setTimeout(() => {
        setActive("after");
        tween.current?.stop();
        tween.current = animate(count, vAfter, { duration: 0.7, ease: EASE });
      }, SWITCH_AT * 1000),
    ];
    timers.current = ids;
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [x.phase, x.run, valid, count, vBefore, vAfter]);

  useEffect(() => () => tween.current?.stop(), []);

  if (!valid) return null;

  const pick = (state: State) => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setActive(state);
    tween.current?.stop();
    tween.current = animate(count, values[state], { duration: 0.7, ease: EASE });
  };

  const max = Math.max(Math.abs(values.before), Math.abs(values.after)) || 1;
  const diff = values.after - values.before;
  const sign = diff > 0 ? "+" : diff < 0 ? "−" : "";
  const pct = values.before !== 0 ? Math.round((Math.abs(diff) / Math.abs(values.before)) * 100) : null;
  const fmt = (v: number) => `${prefix}${formatNumber(v, places)}${unit ? ` ${unit}` : ""}`;
  const order: State[] = ["before", "after"];

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="before-after" {...frameText(props)}>
      <div className="nd-x-ba" data-active={active}>
        <motion.div
          className="nd-x-ba-toggle"
          role="group"
          aria-label={metric || undefined}
          variants={FADE}
          custom={0}
        >
          {order.map((state) => (
            <button key={state} type="button" aria-pressed={active === state} onClick={() => pick(state)}>
              {labels[state]}
            </button>
          ))}
        </motion.div>

        <div className="nd-x-ba-main">
          <div className="nd-x-ba-metric">
            {metric && <span className="k">{metric}</span>}
            <span className="v">
              <motion.span>{shown}</motion.span>
              {unit && <span className="u">{unit}</span>}
            </span>
            <motion.span className="delta" variants={FADE} custom={AFTER_AT + 0.5}>
              {sign}
              {fmt(Math.abs(diff))}
              {pct !== null && (
                <>
                  {" · "}
                  {sign}
                  {pct}%
                </>
              )}
            </motion.span>
          </div>

          <div className="nd-x-ba-bars">
            {order.map((state) => (
              <div key={state} className={`row${active === state ? " is-on" : ""}`}>
                <span className="lbl">{labels[state]}</span>
                <span className="val">{fmt(values[state])}</span>
                <span className="track" aria-hidden="true">
                  <motion.span
                    className="fill"
                    style={{ width: `${round((Math.abs(values[state]) / max) * 100, 2)}%` }}
                    variants={GROW_X}
                    custom={state === "before" ? BEFORE_AT : AFTER_AT}
                  />
                </span>
              </div>
            ))}
          </div>
        </div>

        {(points.before.length > 0 || points.after.length > 0) && (
          <motion.div className="nd-x-ba-points" variants={FADE} custom={BEFORE_AT + 0.2}>
            {order.map((state) =>
              points[state].length > 0 ? (
                <ul key={state} data-state={state} hidden={active !== state}>
                  {points[state].map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              ) : null,
            )}
          </motion.div>
        )}
      </div>
    </ExplainerFrame>
  );
}
