// Articles a visitor saves for later. Kept in this browser only (localStorage):
// no account, nothing sent to a server. The nav's "Saved" menu and the
// article bookmark button share this list and listen for SAVED_EVENT.

export type SavedItem = { href: string; title: string; savedAt: string };

const KEY = "nd-saved";
export const SAVED_EVENT = "nd-saved-change";

export function readSaved(): SavedItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((i) => i && typeof i.href === "string" && typeof i.title === "string") : [];
  } catch {
    return [];
  }
}

function write(items: SavedItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 50)));
  } catch {
    /* storage unavailable: the list lasts for this page only */
  }
  window.dispatchEvent(new Event(SAVED_EVENT));
}

export function isSaved(href: string): boolean {
  return readSaved().some((i) => i.href === href);
}

/** Adds or removes an article; returns whether it is saved afterwards. */
export function toggleSaved(item: Omit<SavedItem, "savedAt">): boolean {
  const items = readSaved();
  if (items.some((i) => i.href === item.href)) {
    write(items.filter((i) => i.href !== item.href));
    return false;
  }
  write([{ ...item, savedAt: new Date().toISOString() }, ...items]);
  return true;
}

export function removeSaved(href: string) {
  write(readSaved().filter((i) => i.href !== href));
}
