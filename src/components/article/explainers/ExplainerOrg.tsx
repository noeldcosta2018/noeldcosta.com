"use client";

import { motion } from "framer-motion";
import { ExplainerFrame, GROW, GROW_X, RISE, useExplainer } from "./core";
import { frameText } from "./frame-text";
import { index, pairs, text, type ExplainerAttrs } from "./parse";

/**
 * <explainer-org>: a programme structure that appears role by role. A short
 * reporting chain at the top, the roles that report into it below, and an
 * optional dashed "side" seat (an independent advisor, a design authority,
 * a PMO) attached to the top of the chain.
 *
 *   <explainer-org title="Who owns what on an S/4HANA programme" caption="..." chain="Executive sponsor => CFO, chairs the SteerCo|Programme director => Owns plan, budget and RAID log" side="Independent advisor => Reports to the sponsor, not the SI" roles="Finance lead => FI/CO design and the close|Supply chain lead => MM, SD and PP processes|Data lead => Migration, cleansing and reconciliation|Integration lead => Interfaces, BTP and cutover" highlight="side"></explainer-org>
 *
 * Every node is "role => what they own" (the part after => is optional).
 * One to three chain nodes, two to six roles. Up to four roles draw as a
 * top-down tree from ~560px of figure width; five or six, and narrow
 * figures, use a left spine. `highlight` is a 1-based role number, or
 * "side".
 */

const T0 = 0.1;
const STEP = 0.38;

export default function ExplainerOrg(props: ExplainerAttrs) {
  const [ref, x] = useExplainer();
  const chain = pairs(props.chain).slice(0, 3);
  const roles = pairs(props.roles).slice(0, 6);
  const side = pairs(props.side)[0];
  const hlRaw = text(props.highlight).toLowerCase();
  const hlSide = hlRaw === "side";
  const hlRole = hlSide ? -1 : index(props.highlight, roles.length);
  if (chain.length < 1) return null;

  const chainAt = (i: number) => T0 + i * STEP;
  const busAt = chainAt(chain.length) + 0.05;
  const roleAt = (j: number) => busAt + 0.3 + j * 0.16;
  const sideAt = chainAt(1) - 0.1;
  const cols = roles.length;

  return (
    <ExplainerFrame figureRef={ref} x={x} kind="org" {...frameText(props)}>
      <div
        className={`nd-x-org${roles.length > 4 ? " is-spine" : ""}`}
        style={{ ["--cols" as string]: String(Math.max(cols, 1)) }}
      >
        <motion.span className="spine" aria-hidden="true" variants={GROW} custom={T0} />
        <ol className="chain">
          {chain.map((node, i) => {
            const last = i === chain.length - 1;
            return (
              <li key={i}>
                <motion.div className="node" variants={RISE} custom={chainAt(i)}>
                  <span className="lbl">{node.label}</span>
                  {node.value && <span className="note">{node.value}</span>}
                </motion.div>
                {i === 0 && side && (
                  <motion.div className={`node side${hlSide ? " is-hl" : ""}`} variants={RISE} custom={sideAt}>
                    <motion.span className="link" aria-hidden="true" variants={GROW_X} custom={sideAt} />
                    <span className="lbl">{side.label}</span>
                    {side.value && <span className="note">{side.value}</span>}
                  </motion.div>
                )}
                {(!last || roles.length > 0) && (
                  <motion.span
                    className={`stem${last ? " to-bus" : ""}`}
                    aria-hidden="true"
                    variants={GROW}
                    custom={chainAt(i) + 0.25}
                  />
                )}
              </li>
            );
          })}
        </ol>
        {roles.length > 0 && (
          <div className="team">
            <motion.span className="bus" aria-hidden="true" variants={GROW_X} custom={busAt} />
            <ul>
              {roles.map((role, j) => (
                <motion.li
                  key={j}
                  className={`node role${j === hlRole ? " is-hl" : ""}`}
                  variants={RISE}
                  custom={roleAt(j)}
                >
                  <motion.span className="stem" aria-hidden="true" variants={GROW} custom={roleAt(j) - 0.12} />
                  <span className="lbl">{role.label}</span>
                  {role.value && <span className="note">{role.value}</span>}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ExplainerFrame>
  );
}
