import { describe, expect, it, vi } from "vitest";

// The interface dictionaries are not translated yet, so readyLocales() is
// empty in the repository. The list is replaced in memory here to check the
// routes a ready locale gets; the locale JSON files are not touched.
const ready = vi.hoisted(() => ({ list: [] as string[] }));
vi.mock("@/i18n/ready", () => ({
  readyLocales: () => ready.list,
  interfaceReady: (l: string) => ready.list.includes(l),
}));

import {
  allLocalizedInterfacePaths,
  interfaceAlternates,
  interfaceMetadata,
  interfaceRouteLocales,
  localizedArchivePosts,
  localizedInterfaceParams,
  localizedInterfacePaths,
  toolPath,
} from "./localized-interface-routes";
import { getLocalizedContentParams } from "./localized-page-routing";
import { localizeHref } from "./link-repair";

const CATEGORIES = [
  "erp-consulting-guide",
  "sap-modules",
  "erp-strategy",
  "ai-governance",
  "agentic-ai",
  "sap-case-studies",
];
const WP_TAGS = [
  "sap-crisis-management",
  "sap-erp-modernization",
  "sap-implementation-strategies",
  "sap-industry-topics",
  "sap-planning-and-selection",
  "sap-technical-decisions",
];
const TOOLS = [
  "/sap-implementation-cost-calculator/",
  "/free-data-migration-estimator-sap-oracle-microsoft/",
  "/sap-job-description-generator/",
  "/sap-solution-builder/",
  "/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/",
];

describe("translated interface routes", () => {
  it("generates nothing while no interface dictionary is ready", () => {
    ready.list = [];
    expect(allLocalizedInterfacePaths()).toEqual([]);
    expect(localizedInterfacePaths("de")).toEqual([]);
    expect(localizedInterfaceParams("category", "category")).toEqual([]);
    expect(interfaceAlternates("/category/erp-strategy/")).toBeUndefined();
  });

  it("lists archives, author and tools for a ready locale only", { timeout: 180000 }, () => {
    ready.list = ["de"];
    const de = localizedInterfacePaths("de");
    expect(de).toEqual(
      expect.arrayContaining([
        ...CATEGORIES.map((c) => `/de/category/${c}/`),
        ...WP_TAGS.map((t) => `/de/tag/${t}/`),
        "/de/author/noeldcosta/",
        ...TOOLS.map((p) => `/de${p}`),
      ]),
    );
    // Only the six WordPress topic archives are translated, not every tag.
    expect(de.filter((p) => p.startsWith("/de/tag/"))).toHaveLength(WP_TAGS.length);
    expect(de).toHaveLength(CATEGORIES.length + WP_TAGS.length + 1 + TOOLS.length);
    expect(localizedInterfacePaths("fr")).toEqual([]);
    expect(localizedInterfacePaths("ar")).toEqual([]);
    expect(allLocalizedInterfacePaths()).toEqual(de);

    expect(localizedInterfaceParams("category", "category")).toContainEqual({
      locale: "de",
      category: "erp-strategy",
    });
    expect(localizedInterfaceParams("tag", "tag")).toContainEqual({
      locale: "de",
      tag: "sap-crisis-management",
    });
    expect(localizedInterfaceParams("author")).toEqual([{ locale: "de" }]);
    expect(interfaceRouteLocales(toolPath("erp-implementation-cost-calculator"))).toEqual(["de"]);
  });

  it("lists only published translations, with the English taxonomy", { timeout: 180000 }, () => {
    ready.list = ["de"];
    const posts = localizedArchivePosts("de");
    const published = new Set(
      getLocalizedContentParams()
        .filter((p) => p.locale === "de" && p.slug.length === 1)
        .map((p) => p.slug[0]),
    );
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p.locale).toBe("de");
      expect(p.isFallback).toBe(false);
      expect(published.has(p.frontmatter.slug)).toBe(true);
    }
  });

  it("does not shadow translated MDX URLs served by [locale]/[...slug]", { timeout: 180000 }, () => {
    ready.list = ["de"];
    const content = getLocalizedContentParams().map((p) => p.slug);
    const contentPaths = new Set(content.map((s) => `/${s.join("/")}/`));
    // Static folders under [locale] own their first segment (and, for the ERP
    // calculator, the two-segment path); no MDX page may live below them.
    const owned = [
      ["category"],
      ["tag"],
      ["author"],
      ["sap-implementation-cost-calculator"],
      ["free-data-migration-estimator-sap-oracle-microsoft"],
      ["sap-job-description-generator"],
      ["sap-solution-builder"],
      ["ai-insights-shiftgearx-noeldcosta", "erp-implementation-cost-calculator"],
    ];
    for (const prefix of owned) {
      const clash = content.filter((s) => prefix.every((seg, i) => s[i] === seg));
      expect(clash, prefix.join("/")).toEqual([]);
    }
    for (const p of localizedInterfacePaths("de")) {
      expect(contentPaths.has(p.replace(/^\/de/, ""))).toBe(false);
    }
    // The AI insights hub stays an MDX page next to the nested calculator.
    expect(contentPaths.has("/ai-insights-shiftgearx-noeldcosta/")).toBe(true);
  });

  it("feeds hreflang alternates, metadata and link localization", { timeout: 180000 }, () => {
    ready.list = ["de"];
    expect(interfaceAlternates("/category/erp-strategy/")).toEqual({
      en: "https://noeldcosta.com/category/erp-strategy/",
      de: "https://noeldcosta.com/de/category/erp-strategy/",
      "x-default": "https://noeldcosta.com/category/erp-strategy/",
    });
    expect(interfaceAlternates("/tag/sap-fico/")).toBeUndefined();

    const meta = interfaceMetadata({
      locale: "de",
      englishPath: "/author/noeldcosta/",
      title: "T",
      description: "D",
    });
    expect(meta.alternates?.canonical).toBe("https://noeldcosta.com/de/author/noeldcosta/");
    expect(meta.alternates?.languages).toMatchObject({ de: "https://noeldcosta.com/de/author/noeldcosta/" });
    expect((meta.openGraph as { locale?: string }).locale).toBe("de_DE");
    const en = interfaceMetadata({ locale: "en", englishPath: "/author/noeldcosta/", title: "T", description: "D" });
    expect(en.alternates?.canonical).toBe("https://noeldcosta.com/author/noeldcosta/");

    expect(localizeHref("de", "/category/erp-strategy/")).toBe("/de/category/erp-strategy/");
    expect(localizeHref("de", "/tag/sap-crisis-management/")).toBe("/de/tag/sap-crisis-management/");
    expect(localizeHref("de", "/tag/sap-fico/")).toBe("/tag/sap-fico/");
    expect(localizeHref("de", "/sap-solution-builder/")).toBe("/de/sap-solution-builder/");
    expect(localizeHref("de", "/author/noeldcosta/")).toBe("/de/author/noeldcosta/");
    expect(localizeHref("fr", "/category/erp-strategy/")).toBe("/category/erp-strategy/");
  });
});
