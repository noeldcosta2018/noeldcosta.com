import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener?.("change", onChange);
  return () => mq.removeEventListener?.("change", onChange);
}

const getSnapshot = (): boolean => window.matchMedia(QUERY).matches;

// The server never knows the visitor's preference. Returning false here makes
// the server HTML and the hydration render identical; React then re-renders
// with the real client value straight after hydration. Content hidden by the
// first render is covered by the reduced-motion and no-script CSS guards in
// globals.css (`data-motion-reveal`), so it is never stuck invisible.
const getServerSnapshot = (): boolean => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
