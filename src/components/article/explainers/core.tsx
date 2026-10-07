"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useInView, type TargetAndTransition, type Transition, type Variants } from "framer-motion";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * Shared playback for the explainer figures.
 *
 * Rendering contract:
 * 1. The server HTML, and the first client render, are the FINISHED state.
 *    Every label is visible, no inline opacity 0, so crawlers, GTranslate,
 *    no-JS readers and screen readers get the whole figure.
 * 2. After hydration, a figure that sits below the fold is "armed": its
 *    moving parts snap to their start state while still off screen.
 * 3. When it scrolls into view it plays once ("play"). Figures already on
 *    screen at load stay finished (no flash back to empty).
 * 4. prefers-reduced-motion: always the finished state, no Replay control.
 *
 * Children are framer-motion elements that only declare `variants` and a
 * `custom` delay; the root figure drives them through one variant label
 * (static | armed | play), so every timeline is plain data.
 */

export const EASE = [0.2, 0.8, 0.2, 1] as const;

export type Phase = "static" | "armed" | "play";
type Mode = "static" | "armed" | "reset" | "play";

const subscribeNothing = () => () => {};

/** False on the server and during hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

export type Explainer = {
  phase: Phase;
  /** Increments on every replay; effects that run timers key on it. */
  run: number;
  reduced: boolean;
  canReplay: boolean;
  replay: () => void;
};

/**
 * Returns the figure ref separately from the playback state so render code
 * only ever reads plain values (the ref goes straight to ExplainerFrame).
 */
export function useExplainer(): [React.RefObject<HTMLElement | null>, Explainer] {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const hydrated = useHydrated();
  const [mode, setMode] = useState<Mode>("static");
  const [run, setRun] = useState(0);
  const frames = useRef<number[]>([]);
  // Plays when the top of the figure crosses 82% of the viewport height.
  const inView = useInView(ref, { once: true, margin: "0px 0px -18% 0px" });

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight * 0.82) {
        setMode((m) => (m === "static" ? "armed" : m));
      }
    });
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  useEffect(() => {
    const pending = frames.current;
    return () => pending.forEach((id) => cancelAnimationFrame(id));
  }, []);

  const replay = useCallback(() => {
    setMode("reset");
    setRun((r) => r + 1);
    // Two frames: the reset (start) state commits and paints first.
    const a = requestAnimationFrame(() => {
      const b = requestAnimationFrame(() => setMode("play"));
      frames.current.push(b);
    });
    frames.current.push(a);
  }, []);

  let phase: Phase;
  if (reduced) phase = "static";
  else if (mode === "armed") phase = inView ? "play" : "armed";
  else if (mode === "reset") phase = "armed";
  else phase = mode;

  return [ref, { phase, run, reduced, canReplay: hydrated && !reduced, replay }];
}

/* ---------- variants ---------- */

/**
 * Three-state variants for one moving part. `static` and `play` share the
 * finished values; `armed` holds the start values. The `custom` prop is the
 * delay in seconds for `play`.
 */
export function variants(
  hidden: TargetAndTransition,
  shown: TargetAndTransition,
  duration = 0.5,
  extra?: Transition,
): Variants {
  return {
    static: { ...shown, transition: { duration: 0 } },
    armed: { ...hidden, transition: { duration: 0 } },
    play: (delay: number = 0) => ({
      ...shown,
      transition: { delay, duration, ease: EASE, ...extra },
    }),
  };
}

/** Opacity + small rise. Labels and cards. */
export const RISE = variants({ opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.5);
/** Opacity only. */
export const FADE = variants({ opacity: 0 }, { opacity: 1 }, 0.45);
/** Pending items sit dimmed, then come up to full strength. */
export const DIM = variants({ opacity: 0.28 }, { opacity: 1 }, 0.35);
/** Nodes and dots. */
export const POP = variants({ opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1 }, 0.4);
/** Bars and lines that grow from their CSS transform-origin. */
export const GROW_X = variants({ scaleX: 0 }, { scaleX: 1 }, 0.6);
export const GROW = variants({ scale: 0 }, { scale: 1 }, 0.55);

/**
 * A highlight that flashes while the "active" marker passes and then
 * settles. `end` is the opacity it rests at in the finished state.
 */
export function flash(end: 0 | 1, hold = 0.9): Variants {
  return {
    static: { opacity: end, transition: { duration: 0 } },
    armed: { opacity: 0, transition: { duration: 0 } },
    play: (delay: number = 0) =>
      end === 1
        ? { opacity: 1, transition: { delay, duration: 0.35, ease: EASE } }
        : {
            opacity: [0, 1, 1, 0],
            transition: { delay, duration: hold, times: [0, 0.25, 0.7, 1], ease: EASE },
          },
  };
}

/* ---------- frame ---------- */

function ReplayIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2.75 8a5.25 5.25 0 1 0 1.6-3.78"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M2.5 2.25v3.5H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export type FrameProps = {
  figureRef: React.RefObject<HTMLElement | null>;
  x: Explainer;
  kind: string;
  title?: string;
  caption?: string;
  source?: string;
  sourceLabel?: string;
  replayLabel?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/**
 * Figure chrome shared by every explainer: title + one-line caption in the
 * figcaption, the visual, then a foot row with the source and Replay.
 * Visible strings that are not author attributes ("Replay", "Source") can
 * be overridden per tag (replay-label, source-label) for translated MDX.
 */
export function ExplainerFrame({
  figureRef,
  x,
  kind,
  title,
  caption,
  source,
  sourceLabel,
  replayLabel,
  className,
  style,
  children,
}: FrameProps) {
  const label = title || caption || undefined;
  const sourcePrefix = sourceLabel ?? "Source";
  return (
    <motion.figure
      ref={figureRef as React.RefObject<HTMLElement>}
      role="figure"
      aria-label={label}
      data-explainer={kind}
      className={`not-prose nd-x nd-x--${kind}${className ? ` ${className}` : ""}`}
      style={style}
      initial={false}
      animate={x.phase}
    >
      {(title || caption) && (
        <figcaption className="nd-x-cap">
          {title && <span className="nd-x-title">{title}</span>}
          {caption && <span className="nd-x-sub">{caption}</span>}
        </figcaption>
      )}
      <div className="nd-x-body">{children}</div>
      <div className="nd-x-foot">
        {source ? (
          <p className="nd-x-source">
            {sourcePrefix ? `${sourcePrefix}: ` : ""}
            {source}
          </p>
        ) : (
          <span />
        )}
        {x.canReplay && (
          <button type="button" className="nd-x-replay" onClick={x.replay}>
            <ReplayIcon />
            <span>{replayLabel || "Replay"}</span>
          </button>
        )}
      </div>
    </motion.figure>
  );
}
