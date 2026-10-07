// Browser-safe markdown repairs for WordPress-exported MDX (no file system).
// Used by MdxBody, which also renders inside client components (tool output),
// and by the server templates before segmenting a body.

/**
 * WordPress "card" grids were exported as links that span several blocks:
 *   [
 *   ### Card heading
 *   Card text
 *   ](https://noeldcosta.com/x/)[
 * Markdown cannot link across blocks, so the syntax showed up as text. Each card
 * becomes its heading linked to the card's URL; the stray brackets go.
 */
export function repairCardLinks(body: string): string {
  const lines = body.split("\n");
  let lastHeading = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*\[\s*$/.test(line)) {
      lines[i] = "";
      lastHeading = -1;
      continue;
    }
    if (/^#{2,6}\s+\S/.test(line)) {
      lastHeading = i;
      continue;
    }
    const close = line.match(/^\s*\]\(([^)\s]+)\)\s*\[?\s*$/);
    if (close) {
      if (lastHeading >= 0 && !/\]\(/.test(lines[lastHeading])) {
        lines[lastHeading] = lines[lastHeading].replace(/^(#{2,6})\s+(.+?)\s*$/, `$1 [$2](${close[1]})`);
      }
      lines[i] = "";
      lastHeading = -1;
    }
  }
  return lines.join("\n");
}

/**
 * Heading levels never skip; a body "#" becomes "##" (the page H1 is in the
 * banner). Headings that were siblings in the source stay siblings: a stack
 * maps each open source level to its rendered level, so "## A / #### b /
 * #### c" renders b and c both as h3.
 */
export function normalizeHeadingLevels(body: string): string {
  const open: { source: number; level: number }[] = [];
  let inFence = false;
  return body
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) inFence = !inFence;
      if (inFence) return line;
      // Migrated WordPress pages carry indented headings inside list items;
      // they render as headings too.
      const m = line.match(/^( *)(#{1,6})(\s+\S.*)$/);
      if (!m) return line;
      const source = m[2].length;
      while (open.length && open[open.length - 1].source >= source) open.pop();
      const parent = open.length ? open[open.length - 1].level : 1;
      const level = Math.max(2, Math.min(source, parent + 1));
      open.push({ source, level });
      return m[1] + "#".repeat(level) + m[3];
    })
    .join("\n");
}
