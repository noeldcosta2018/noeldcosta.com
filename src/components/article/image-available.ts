import { existsSync } from "node:fs";
import path from "node:path";
import { getImageDimensions } from "@/lib/image-dimensions";

/**
 * Whether a frontmatter image can actually be served. A few migrated posts
 * reference hero files that were never imported; rendering those gives a
 * broken image (and a 400 from the image optimiser), so callers fall back
 * to their image-free layout instead. Server-only: articles are statically
 * generated, so this runs at build time against /public.
 */
export function imageAvailable(src: string | undefined): src is string {
  if (!src) return false;
  if (!src.startsWith("/")) return true;
  if (getImageDimensions(src)) return true;
  const file = decodeURIComponent(src.split(/[?#]/)[0]);
  return existsSync(path.join(process.cwd(), "public", file));
}
