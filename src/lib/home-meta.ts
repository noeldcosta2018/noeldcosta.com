import type { Metadata } from "next";
import type { Locale } from "./locales";
import { translator } from "@/i18n";
import { readyLocales } from "@/i18n/ready";
import { DEFAULT_OG_IMAGE, SITE_URL, clampDescription } from "./seo";
import { publicPrefixFromContentLocale } from "./locale-url";

// Homepage metadata for English (/) and each translated homepage (/de/ ...).
// Translated homepages exist only for locales whose interface dictionary is
// ready, and every published homepage lists the others as alternates.

/** Internal path segment a translated homepage is served from (/de/ is rewritten to /de/__home/). */
export const LOCALIZED_HOME_SLUG = "__home";

export const HOME_TITLE = "Noel D'Costa | Enterprise applications, data & AI";
export const HOME_DESCRIPTION =
  "I help leadership teams choose the right SAP, Oracle and Microsoft platforms, deliver programmes, fix reporting and put AI to work where it solves a real problem.";

export function homeAlternates(): Record<string, string> {
  const languages: Record<string, string> = { en: `${SITE_URL}/` };
  for (const l of readyLocales()) languages[l] = `${SITE_URL}/${l}/`;
  languages["x-default"] = `${SITE_URL}/`;
  return languages;
}

export function homeMetadata(locale: Locale = "en"): Metadata {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const url = prefix ? `${SITE_URL}/${prefix}/` : `${SITE_URL}/`;
  const title = tr(HOME_TITLE);
  const description = clampDescription(tr(HOME_DESCRIPTION)) ?? HOME_DESCRIPTION;
  const languages = homeAlternates();
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, ...(Object.keys(languages).length > 2 ? { languages } : {}) },
    openGraph: {
      title,
      description,
      type: "profile",
      url,
      locale: locale === "en" ? "en" : prefix ?? locale,
      siteName: "Noel D'Costa",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: "@noeldcosta2018",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
