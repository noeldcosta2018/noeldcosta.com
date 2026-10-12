import { getPostsByAnyTag } from "./content";
import { WORDPRESS_TAG_SLUGS, tagSynonyms } from "@/components/tagMeta";

// Tag archives that list a single article are about 150 words of chrome around
// one card. Search engines read them as thin pages (Noel, 12 October 2026), so
// they stay live for readers but carry noindex,follow and leave the sitemap.
// The six WordPress topic archives are always indexed.
const MIN_INDEXED_POSTS = 2;

export function isThinTag(tag: string): boolean {
  if ((WORDPRESS_TAG_SLUGS as readonly string[]).includes(tag)) return false;
  return getPostsByAnyTag(tagSynonyms(tag), "en").length < MIN_INDEXED_POSTS;
}
