import { expect, test } from "vitest";

import { getPage } from "./content.ts";
import {
  CONTENT_LOCALES,
  PUBLIC_LOCALE_PREFIXES,
  buildLocalizedPath,
  contentLocaleFromPublicPrefix,
  normalizePublicPath,
  publicPathFromOriginalUrl,
  publicPrefixFromContentLocale,
} from "./locale-url.ts";

test("defines the seventeen first-class content locales", () => {
  expect(CONTENT_LOCALES).toEqual([
    "en",
    "ar",
    "de",
    "el",
    "es",
    "fr",
    "hi",
    "hr",
    "it",
    "ja",
    "ko",
    "nl",
    "pt",
    "ru",
    "tr",
    "zh",
    "zh-TW",
  ]);
});

test("maps public locale prefixes to repository content locales", () => {
  const expectedMappings = [
    ["ar", "ar"],
    ["de", "de"],
    ["el", "el"],
    ["es", "es"],
    ["fr", "fr"],
    ["hi", "hi"],
    ["hr", "hr"],
    ["it", "it"],
    ["ja", "ja"],
    ["ko", "ko"],
    ["nl", "nl"],
    ["pt", "pt"],
    ["ru", "ru"],
    ["tr", "tr"],
    ["zh-CN", "zh"],
    ["zh-TW", "zh-TW"],
  ];

  expect(contentLocaleFromPublicPrefix(null)).toBe("en");
  expect(publicPrefixFromContentLocale("en")).toBeNull();
  expect(PUBLIC_LOCALE_PREFIXES).toEqual(expectedMappings.map(([prefix]) => prefix));

  for (const [prefix, locale] of expectedMappings) {
    expect(contentLocaleFromPublicPrefix(prefix)).toBe(locale);
    expect(publicPrefixFromContentLocale(locale)).toBe(prefix);
  }
});

test("rejects invalid or repository-only public locale prefixes", () => {
  // Greek, Croatian and Traditional Chinese are first-class since 7 October 2026.
  expect(contentLocaleFromPublicPrefix("ka")).toBeNull();
  expect(contentLocaleFromPublicPrefix("zh")).toBeNull();
  expect(contentLocaleFromPublicPrefix("en")).toBeNull();
  expect(contentLocaleFromPublicPrefix("ZH-cn")).toBeNull();
});

test("builds unprefixed English and prefixed localized paths", () => {
  expect(buildLocalizedPath("en", "article")).toBe("/article/");
  expect(buildLocalizedPath("fr", "/article/")).toBe("/fr/article/");
  expect(buildLocalizedPath("zh", "article")).toBe("/zh-CN/article/");
});

test("normalizes root, nested paths, duplicate slashes, queries, and fragments", () => {
  expect(normalizePublicPath("/")).toBe("/");
  expect(normalizePublicPath("//sap-implementation///sap-modules")).toBe("/sap-implementation/sap-modules/");
  expect(normalizePublicPath("sap-implementation//sap-modules")).toBe("/sap-implementation/sap-modules/");
  expect(normalizePublicPath("/nested/page?source=legacy#section")).toBe("/nested/page/");
});

test("extracts the complete nested path from a valid original URL", () => {
  expect(
    publicPathFromOriginalUrl(
      "https://noeldcosta.com/sap-implementation/sap-modules/?legacy=1#top",
      "sap-modules",
    ),
  ).toBe("/sap-implementation/sap-modules/");
  expect(publicPathFromOriginalUrl(undefined, "sap-modules")).toBe("/sap-modules/");
  expect(publicPathFromOriginalUrl("not a URL", "sap-modules")).toBe("/sap-modules/");
});

test("exposes fallback provenance instead of presenting English as a translation", () => {
  const page = getPage("about", "fr");

  expect(page).not.toBeNull();
  expect(page.requestedLocale).toBe("fr");
  expect(page.locale).toBe("en");
  expect(page.isFallback).toBe(true);
});

test("marks a first-class translation as non-fallback", () => {
  const page = getPage("sap-modules", "fr");

  expect(page).not.toBeNull();
  expect(page.requestedLocale).toBe("fr");
  expect(page.locale).toBe("fr");
  expect(page.isFallback).toBe(false);
});
