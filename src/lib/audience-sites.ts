/**
 * Which site a sign-up came from. Every site's sign-ups live in the one ERPCV3
 * database; the source key's prefix says the site. No server imports here, so
 * the admin's browser-side table can use it.
 */

export type Site = "noeldcosta.com" | "ERPCV" | "SAPopedia";
export const SITES: Site[] = ["noeldcosta.com", "ERPCV", "SAPopedia"];

export function sourceSite(source: string): Site {
  if (source.startsWith("erpcv-")) return "ERPCV";
  if (source.startsWith("sapopedia-")) return "SAPopedia";
  return "noeldcosta.com";
}

/** The sites a contact has used, in SITES order. */
export function contactSites(sources: string[]): Site[] {
  const used = new Set(sources.map(sourceSite));
  return SITES.filter((s) => used.has(s));
}
