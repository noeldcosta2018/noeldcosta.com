"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, FADE, variants, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { list, pairs, round, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-matrix>: a 2x2 to 4x4 grid (likelihood x impact, effort x
 * value) where items drop into their cells one by one. The cell tint
 * deepens towards the high/high corner.
 *
 *   <explainer-matrix title="Where your AI use cases sit" caption="..." x-label="Likelihood of harm" y-label="Business impact" x-levels="Low|Medium|High" y-levels="Low|Medium|High" items="Credit limit approvals => 3,3|CV screening => 3,3|Supplier invoice matching => 2,2|Sales forecast assistant => 2,1|Meeting summaries => 1,1" zones="Low|Moderate|Critical"></explainer-matrix>
 *
 * Levels run low to high (y-levels bottom to top). Each item is
 * "name => x,y" with 1-based positions. `zones` (optional, 2 or 3 labels,
 * low to high) snaps the tint into that many bands along the diagonal and
 * adds a legend; items in the top band get an accent outline.
 */

const T0 = 0.1;
const DROP_STEP = 0.38;

const DROP = variants({ opacity: 0, y: -16, scale: 0.94 }, { opacity: 1, y: 0, scale: 1 }, 0.45);
const CELL = variants({ opacity: 0 }, { opacity: 1 }, 0.35);

export default function ExplainerMatrix(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const xLevels = list(props["x-levels"]).slice(0, 4);
  const yLevels = list(props["y-levels"]).slice(0, 4);
  const xLabel = text(props["x-label"]);
  const yLabel = text(props["y-label"]);
  const zones = list(props.zones).slice(0, 3);
  const nx = xLevels.length;
  const ny = yLevels.length;

  const items = pairs(props.items)
    .map((item) => {
      const [cx, cy] = item.value.split(",").map((v) => Number.parseInt(v.trim(), 10));
      return { label: item.label, x: cx - 1, y: cy - 1 };
    })
    .filter((item) => item.label && item.x >= 0 && item.x < nx && item.y >= 0 && item.y < ny);

  if (nx < 2 || ny < 2) return null;

  // 0 at low/low, 1 at high/high. With `zones`, the tint snaps to the
  // zone bands so the legend swatches match the cells exactly.
  const severity = (cx: number, cy: number) => (cx / (nx - 1) + cy / (ny - 1)) / 2;
  const zoneOf = (s: number) => Math.min(zones.length - 1, Math.floor(s * zones.length));
  const zoneHeat = (z: number) => round(0.02 + (z / Math.max(zones.length - 1, 1)) * 0.16, 3);
  const heat = (s: number) => (zones.length > 1 ? zoneHeat(zoneOf(s)) : round(0.02 + s * 0.16, 3));
  const hot = (s: number) => (zones.length > 1 ? zoneOf(s) === zones.length - 1 : s >= 0.75);
  const gridEnd = T0 + 0.35;
  const dropAt = new Map(items.map((item, k) => [item, gridEnd + k * DROP_STEP]));

  // Rows render top (highest y) to bottom.
  const rows = Array.from({ length: ny }, (_, r) => ny - 1 - r);

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="matrix" {...frameText(props)}>
      <div
        className="nd-x-mx"
        style={{ ["--cols" as string]: String(nx), ["--rows" as string]: String(ny) }}
      >
        {yLabel && (
          <span className="ytitle" style={{ gridRow: `1 / span ${ny}` }} aria-hidden="true">
            {yLabel}
          </span>
        )}
        {rows.map((cy, r) => (
          <span key={`yl${cy}`} className="ylvl" style={{ gridRow: r + 1 }} aria-hidden="true">
            {yLevels[cy]}
          </span>
        ))}
        {rows.map((cy, r) =>
          xLevels.map((_, cx) => {
            const s = severity(cx, cy);
            const inCell = items.filter((item) => item.x === cx && item.y === cy);
            const cellName = [
              yLabel ? `${yLabel}: ${yLevels[cy]}` : yLevels[cy],
              xLabel ? `${xLabel}: ${xLevels[cx]}` : xLevels[cx],
            ].join(", ");
            return (
              <motion.div
                key={`c${cx}-${cy}`}
                role="group"
                aria-label={cellName}
                className={`cell${hot(s) ? " is-hot" : ""}`}
                style={{
                  gridRow: r + 1,
                  gridColumn: cx + 3,
                  ["--heat" as string]: String(heat(s)),
                }}
                variants={CELL}
                custom={T0 + (r + cx) * 0.05}
              >
                {inCell.length > 0 && (
                  <ul>
                    {inCell.map((item, k) => (
                      <motion.li key={k} variants={DROP} custom={dropAt.get(item)}>
                        {item.label}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            );
          }),
        )}
        {xLevels.map((lvl, cx) => (
          <span key={`xl${cx}`} className="xlvl" style={{ gridColumn: cx + 3, gridRow: ny + 1 }} aria-hidden="true">
            {lvl}
          </span>
        ))}
        {xLabel && (
          <span className="xtitle" style={{ gridRow: ny + 2 }} aria-hidden="true">
            {xLabel}
          </span>
        )}
      </div>
      {zones.length > 1 && (
        <motion.ul className="nd-x-mx-zones" variants={FADE} custom={T0 + 0.3}>
          {zones.map((zone, z) => (
            <li key={z} style={{ ["--heat" as string]: String(zoneHeat(z)) }}>
              <i aria-hidden="true" />
              {zone}
            </li>
          ))}
        </motion.ul>
      )}
    </ExplainerFrame>
  );
}
