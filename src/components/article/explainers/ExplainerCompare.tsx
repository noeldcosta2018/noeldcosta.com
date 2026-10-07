"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, FADE, RISE, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { index, list, pairs, type ExplainerAttrs } from "./parse";

/**
 * <explainer-compare>: two to four options compared criterion by criterion,
 * revealed row by row.
 *
 *   <explainer-compare title="Three ways off ECC" caption="..." options="Greenfield|Brownfield|Selective data transition" criteria="Process redesign => [3] Full redesign ; [0] Kept as they are ; [2] Chosen per process|Historical data => [1] Open items only ; [3] All of it ; [2] Chosen years and entities" highlight="3"></explainer-compare>
 *
 * Each criterion is "name => value ; value ; value", one value per option,
 * separated by semicolons. A value may start with a level in brackets,
 * [0] to [3], drawn as a small meter before the text. `highlight` (1-based)
 * marks one option column in accent.
 */

const T0 = 0.1;
const ROW = 0.42;
const CELL = 0.08;

type Cell = { level: number; text: string };

function parseCell(raw: string): Cell {
  const match = raw.match(/^\[(\d)\]\s*/);
  if (!match) return { level: -1, text: raw };
  return { level: Math.min(Number(match[1]), 5), text: raw.slice(match[0].length).trim() };
}

function Meter({ level, scale }: { level: number; scale: number }) {
  return (
    <span className="nd-x-meter" aria-hidden="true">
      {Array.from({ length: scale }, (_, i) => (
        <i key={i} className={i < level ? "on" : undefined} />
      ))}
    </span>
  );
}

export default function ExplainerCompare(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const options = list(props.options).slice(0, 4);
  const rows = pairs(props.criteria).map((row) => ({
    label: row.label,
    cells: Array.from({ length: options.length }, (_, j) =>
      parseCell((row.value.split(";")[j] ?? "").trim()),
    ),
  }));
  const hl = index(props.highlight, options.length);
  if (options.length < 2 || rows.length < 1) return null;

  const scale = Math.max(3, ...rows.flatMap((r) => r.cells.map((c) => c.level)));
  const rowAt = (r: number) => T0 + 0.25 + r * ROW;
  const cls = (j: number, base: string) => `${base}${j === hl ? " is-hl" : ""}`;

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="compare" {...frameText(props)}>
      <div className="nd-x-cmp" role="table" style={{ ["--cols" as string]: String(options.length) }}>
        <div className="nd-x-cmp-head" role="row">
          <span role="columnheader" className="corner" />
          {options.map((o, j) => (
            <motion.span key={j} role="columnheader" className={cls(j, "opt")} variants={RISE} custom={T0 + j * CELL}>
              {o}
            </motion.span>
          ))}
        </div>
        {rows.map((row, r) => (
          <div key={r} role="row" className="nd-x-cmp-row">
            <motion.span role="rowheader" className="crit" variants={FADE} custom={rowAt(r)}>
              {row.label}
            </motion.span>
            {row.cells.map((cell, j) => (
              <motion.span
                key={j}
                role="cell"
                className={cls(j, "cell")}
                variants={RISE}
                custom={rowAt(r) + 0.08 + j * CELL}
              >
                <span className="opt-inline">{options[j]}</span>
                <span className="val">
                  {cell.level >= 0 && <Meter level={cell.level} scale={scale} />}
                  <span>{cell.text}</span>
                </span>
              </motion.span>
            ))}
          </div>
        ))}
      </div>
    </ExplainerFrame>
  );
}
