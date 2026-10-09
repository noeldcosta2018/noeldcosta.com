"use client";

import { useState } from "react";
import Doodle from "@/components/doodles/Doodle";

/**
 * Section 2: the reader ticks what applies. From two ticks a circled line
 * answers. Nothing is stored or sent; the ticks live in the page only.
 */
export default function WorryCheck({ items, verdict }: { items: string[]; verdict: string }) {
  const [ticked, setTicked] = useState<boolean[]>(() => items.map(() => false));
  const show = ticked.filter(Boolean).length >= 2;

  return (
    <>
      <ul className="ar-ticks">
        {items.map((item, i) => (
          <li key={item}>
            <label>
              <input
                type="checkbox"
                checked={ticked[i]}
                onChange={(e) => setTicked((prev) => prev.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              <span className="ar-box" aria-hidden="true" data-dd-manual>
                <Doodle name="tick" />
              </span>
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className="ar-verdict" aria-live="polite" data-dd-manual>
        {show && (
          <p className="ar-ring">
            {verdict}
            <Doodle name="circle" className="on" />
          </p>
        )}
      </div>
    </>
  );
}
