/**
 * Split a markdown body into two chunks at the Nth H2 past the midpoint.
 *
 * Used so PostPage can render `{body-top} <Promo /> {body-bottom}` without
 * needing to parse MDX into an AST. If the body has fewer than `minH2` H2
 * blocks we return `[body, ""]` so the caller can skip the interleaved promo.
 *
 * The split happens *before* the target H2 so the promo card ends a section
 * cleanly rather than interrupting mid-topic.
 */
export function splitAtMidH2(
  body: string,
  { minH2 = 4 }: { minH2?: number } = {}
): [string, string] {
  const lines = body.split("\n");
  const h2Lines: number[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (/^##\s+/.test(l)) h2Lines.push(i);
  }

  if (h2Lines.length < minH2) return [body, ""];

  // Target the H2 closest to the midpoint of the body (not the midpoint of
  // the H2 list — that skews early for front-loaded articles).
  const mid = Math.floor(lines.length / 2);
  let splitLine = h2Lines[0];
  let bestDelta = Math.abs(h2Lines[0] - mid);
  for (const h of h2Lines) {
    const d = Math.abs(h - mid);
    if (d < bestDelta) {
      bestDelta = d;
      splitLine = h;
    }
  }

  // Never split before the first ~30% of content — feels promotional.
  const floor = Math.floor(lines.length * 0.3);
  if (splitLine < floor) {
    const next = h2Lines.find((h) => h >= floor);
    if (next !== undefined) splitLine = next;
  }

  const top = lines.slice(0, splitLine).join("\n").trimEnd();
  const bottom = lines.slice(splitLine).join("\n").trimStart();
  return [top, bottom];
}
