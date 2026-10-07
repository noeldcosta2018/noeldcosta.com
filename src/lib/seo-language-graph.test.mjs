import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import localeContentManifest from "../data/locale-content-manifest.json";
import { getPage, getPost } from "./content.ts";
import {
  getLocalizedArticle,
  getLocalizedArticleParams,
} from "./localized-article-routing.ts";
import {
  getLocalizedContentParams,
  getLocalizedPage,
  getLocalizedPageParams,
} from "./localized-page-routing.ts";
import {
  articleJsonLd,
  buildPageMetadata,
  buildPostMetadata,
  pageArticleJsonLd,
  pageWebPageJsonLd,
} from "./seo.ts";
import { buildLanguageAlternates } from "./seo-graph.ts";

// hreflang keys (public locale codes). Articles exist in all 16 published
// translations (7 October 2026); routed pages in 12 (no Simplified Chinese,
// Greek, Croatian or Traditional Chinese pages yet).
const POST_LANGUAGE_KEYS = [
  "en", "ar", "de", "el", "es", "fr", "hi", "hr", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh-CN", "zh-TW",
  "x-default",
];
const PAGE_LANGUAGE_KEYS = [
  "en", "ar", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr",
  "x-default",
];

const POST_SLUG = "best-sap-implementation-templates-activate-2024";
const NESTED_PAGE_SLUG = "sap-modules";
const NESTED_PAGE_PATH = "/sap-implementation/sap-modules/";

function expectAbsoluteTrailingSlashUrls(languages, keys = POST_LANGUAGE_KEYS) {
  expect(Object.keys(languages)).toEqual(keys);
  for (const url of Object.values(languages)) {
    expect(url).toMatch(/^https:\/\/noeldcosta\.com\/.+\/$/);
  }
}

function expectReciprocalMember(metadata, expected, locale, keys = POST_LANGUAGE_KEYS) {
  expect(metadata.alternates?.languages).toEqual(expected);
  expect(metadata.alternates?.languages?.[locale]).toBe(
    metadata.alternates?.canonical,
  );
  expect(metadata.alternates?.languages?.["x-default"]).toBe(
    metadata.alternates?.languages?.en,
  );
  expectAbsoluteTrailingSlashUrls(metadata.alternates?.languages, keys);
}

describe("Phase 4A reciprocal manifest-backed SEO language graph", () => {
  it("limits the graph inventory to 81 post families and 28 equivalent page families", () => {
    const postFamilies = localeContentManifest.items.filter(
      (item) =>
        item.kind === "post" &&
        buildPostMetadata(getPost(item.slug, "en")).alternates?.languages,
    );
    const pageFamilies = localeContentManifest.items.filter(
      (item) =>
        item.kind === "page" &&
        buildPageMetadata(getPage(item.slug, "en")).alternates?.languages,
    );

    expect(postFamilies).toHaveLength(81);
    expect(pageFamilies.map((item) => item.slug)).toEqual(
      localeContentManifest.items
        .filter(
          (item) =>
            item.kind === "page" &&
            item.public_path &&
            ![
              "about",
              "erp-implementation-cost-calculator",
              "free-data-migration-estimator-sap-oracle-microsoft",
              "sap-implementation-cost-calculator",
              "sap-job-description-generator",
              "sap-solution-builder",
            ].includes(item.slug),
        )
        .map((item) => item.slug),
    );
    expect(pageFamilies).toHaveLength(29);
  });

  it(
    "proves reciprocity, self-inclusion, URL shape, and x-default across every member of all 110 eligible families",
    () => {
      const eligiblePosts = localeContentManifest.items.filter(
        (item) =>
          item.kind === "post" &&
          buildPostMetadata(getPost(item.slug, "en")).alternates?.languages,
      );
      const eligiblePages = localeContentManifest.items.filter(
        (item) =>
          item.kind === "page" &&
          buildPageMetadata(getPage(item.slug, "en")).alternates?.languages,
      );

      expect(eligiblePosts).toHaveLength(81);
      expect(eligiblePages).toHaveLength(29);

      for (const item of eligiblePosts) {
        const english = getPost(item.slug, "en");
        const expected = buildPostMetadata(english).alternates?.languages;
        expectAbsoluteTrailingSlashUrls(expected);

        for (const locale of POST_LANGUAGE_KEYS.filter(
          (value) => value !== "x-default",
        )) {
          const prefix =
            locale === "en" ? null : locale;
          const record =
            locale === "en"
              ? english
              : getLocalizedArticle(prefix, item.slug);
          expect(record).not.toBeNull();
          expectReciprocalMember(buildPostMetadata(record), expected, locale);
        }
      }

      for (const item of eligiblePages) {
        const english = getPage(item.slug, "en");
        const expected = buildPageMetadata(english).alternates?.languages;
        const pathSegments = item.public_path.split("/").filter(Boolean);
        expectAbsoluteTrailingSlashUrls(expected, PAGE_LANGUAGE_KEYS);

        for (const locale of PAGE_LANGUAGE_KEYS.filter(
          (value) => value !== "x-default",
        )) {
          const prefix =
            locale === "en" ? null : locale;
          const record =
            locale === "en"
              ? english
              : getLocalizedPage(prefix, pathSegments);
          expect(record).not.toBeNull();
          expectReciprocalMember(
            buildPageMetadata(record, record.publicPath),
            expected,
            locale,
            PAGE_LANGUAGE_KEYS,
          );
        }
      }

      const excludedPages = localeContentManifest.items.filter(
        (item) =>
          item.kind === "page" &&
          !buildPageMetadata(getPage(item.slug, "en")).alternates?.languages,
      );
      expect(excludedPages).toHaveLength(7);
      expect(excludedPages.map((item) => item.slug)).toEqual(
        expect.arrayContaining([
          "about",
          "erp-implementation-cost-calculator",
          "free-data-migration-estimator-sap-oracle-microsoft",
          "sap-implementation-cost-calculator",
          "sap-job-description-generator",
          "sap-solution-builder",
          "https-noeldcosta-com-sap-implementation-expert",
        ]),
      );
      for (const item of excludedPages) {
        for (const locale of PAGE_LANGUAGE_KEYS.filter(
          (value) => value !== "x-default",
        )) {
          expect(
            buildPageMetadata(getPage(item.slug, locale)).alternates?.languages,
          ).toBeUndefined();
        }
      }
    },
    180_000,
  );

  it("keeps category, tag and category-shortcut archive metadata outside the language graph", async () => {
    const seoModule = await import("./seo.ts");
    expect(seoModule.buildArchiveMetadata).toBeTypeOf("function");

    const surfaces = [
      seoModule.buildArchiveMetadata?.({
        title: "SAP Modules | Noel D'Costa",
        description: "Category archive",
        canonical: "https://noeldcosta.com/category/sap-modules/",
      }),
      seoModule.buildArchiveMetadata?.({
        title: "SAP | Noel D'Costa",
        description: "Tag archive",
        canonical: "https://noeldcosta.com/tag/sap/",
      }),
      seoModule.buildArchiveMetadata?.({
        title: "SAP Case Studies | Noel D'Costa",
        description: "Category shortcut",
        canonical: "https://noeldcosta.com/category/sap-case-studies/",
      }),
    ];

    expect(surfaces.map((metadata) => metadata?.alternates?.canonical)).toEqual([
      "https://noeldcosta.com/category/sap-modules/",
      "https://noeldcosta.com/tag/sap/",
      "https://noeldcosta.com/category/sap-case-studies/",
    ]);
    for (const metadata of surfaces) {
      expect(metadata?.alternates?.languages).toBeUndefined();
    }

    const archiveLikeRecord = getPost(POST_SLUG, "en");
    expect(buildLanguageAlternates("archive", archiveLikeRecord)).toBeUndefined();
  });

  it("emits one reciprocal 12-locale post cluster plus item-specific x-default", () => {
    const english = getPost(POST_SLUG, "en");
    expect(english).not.toBeNull();

    const expected = buildPostMetadata(english).alternates?.languages;
    expectAbsoluteTrailingSlashUrls(expected);
    expect(expected?.en).toBe(`https://noeldcosta.com/${POST_SLUG}/`);
    expect(expected?.es).toBe(`https://noeldcosta.com/es/${POST_SLUG}/`);
    expect(expected?.["x-default"]).toBe(expected?.en);

    for (const locale of POST_LANGUAGE_KEYS.filter(
      (value) => value !== "en" && value !== "x-default",
    )) {
      const localized = getLocalizedArticle(locale, POST_SLUG);
      expect(localized?.isFallback).toBe(false);
      const metadata = buildPostMetadata(localized);
      expect(metadata.alternates?.languages).toEqual(expected);
      expect(metadata.alternates?.languages?.[locale]).toBe(
        metadata.alternates?.canonical,
      );
    }
  });

  it("emits one reciprocal nested-page cluster with the nested English x-default", () => {
    const english = getPage(NESTED_PAGE_SLUG, "en");
    expect(english).not.toBeNull();

    const expected = buildPageMetadata(english).alternates?.languages;
    expectAbsoluteTrailingSlashUrls(expected, PAGE_LANGUAGE_KEYS);
    expect(expected?.en).toBe(`https://noeldcosta.com${NESTED_PAGE_PATH}`);
    expect(expected?.es).toBe(
      `https://noeldcosta.com/es${NESTED_PAGE_PATH}`,
    );
    expect(expected?.["x-default"]).toBe(expected?.en);

    for (const locale of PAGE_LANGUAGE_KEYS.filter(
      (value) => value !== "en" && value !== "x-default",
    )) {
      const localized = getLocalizedPage(locale, [
        "sap-implementation",
        "sap-modules",
      ]);
      expect(localized).not.toBeNull();
      const metadata = buildPageMetadata(localized, localized?.publicPath);
      expect(metadata.alternates?.languages).toEqual(expected);
      expect(metadata.alternates?.languages?.[locale]).toBe(
        metadata.alternates?.canonical,
      );
    }
  });

  it("includes /case-studies/ in the same reciprocal family its routed translations use", () => {
    const english = buildPageMetadata(getPage("case-studies", "en")).alternates?.languages;
    expectAbsoluteTrailingSlashUrls(english, PAGE_LANGUAGE_KEYS);
    expect(english?.en).toBe("https://noeldcosta.com/case-studies/");
    expect(english?.["x-default"]).toBe(english?.en);
    for (const locale of PAGE_LANGUAGE_KEYS.filter(
      (value) => value !== "en" && value !== "x-default",
    )) {
      const localized = getLocalizedPage(locale, ["case-studies"]);
      expect(localized).not.toBeNull();
      expect(buildPageMetadata(localized, localized?.publicPath).alternates?.languages).toEqual(english);
    }
  });

  it("excludes unpublished, tool, missing, fallback, and noindex members", () => {
    const arabicPost = getPost(POST_SLUG, "ar");
    const chinesePost = getPost(POST_SLUG, "zh");
    const about = getPage("about", "en");
    const tools = [
      "erp-implementation-cost-calculator",
      "free-data-migration-estimator-sap-oracle-microsoft",
      "sap-implementation-cost-calculator",
      "sap-job-description-generator",
      "sap-solution-builder",
    ];

    // Arabic and Simplified Chinese are published members since 7 October 2026.
    expect(buildPostMetadata(arabicPost).alternates?.languages?.ar).toBe(`https://noeldcosta.com/ar/${POST_SLUG}/`);
    expect(buildPostMetadata(chinesePost).alternates?.languages?.["zh-CN"]).toBe(`https://noeldcosta.com/zh-CN/${POST_SLUG}/`);
    expect(buildPageMetadata(about).alternates?.languages).toBeUndefined();
    for (const slug of tools) {
      expect(
        buildPageMetadata(getPage(slug, "en")).alternates?.languages,
      ).toBeUndefined();
    }

    const unmanifested = {
      ...getPost(POST_SLUG, "en"),
      frontmatter: {
        ...getPost(POST_SLUG, "en").frontmatter,
        slug: "not-in-the-approved-manifest",
      },
    };
    const fallback = { ...getPost(POST_SLUG, "en"), isFallback: true };
    const noindex = {
      ...getPost(POST_SLUG, "en"),
      frontmatter: {
        ...getPost(POST_SLUG, "en").frontmatter,
        noindex: true,
      },
    };
    const unsupportedLocale = {
      ...getPost(POST_SLUG, "en"),
      locale: "el",
      requestedLocale: "el",
    };

    expect(buildPostMetadata(unmanifested).alternates?.languages).toBeUndefined();
    expect(buildPostMetadata(fallback).alternates?.languages).toBeUndefined();
    expect(buildPostMetadata(noindex).alternates?.languages).toBeUndefined();
    expect(
      buildPostMetadata(unsupportedLocale).alternates?.languages,
    ).toBeUndefined();
  });

  it("rejects a real raw MDX variant even when it shares a manifest slug and published locale", () => {
    const rawSource = readFileSync(
      `content/posts/${POST_SLUG}/es.raw.mdx`,
      "utf8",
    );
    const parsedRaw = matter(rawSource);
    const published = getPost(POST_SLUG, "es");
    const rawRecord = {
      ...published,
      frontmatter: parsedRaw.data,
      body: parsedRaw.content,
      locale: "es",
      requestedLocale: "es",
      isFallback: false,
    };

    expect(rawRecord.frontmatter.slug).toBe(POST_SLUG);
    expect(rawRecord.body).not.toBe(published.body);
    expect(buildPostMetadata(rawRecord).alternates?.languages).toBeUndefined();
  });

  it("uses the approved nested path for metadata and schema on all nine English nested pages", () => {
    const nestedPages = localeContentManifest.items.filter(
      (item) =>
        item.kind === "page" &&
        item.public_path.split("/").filter(Boolean).length > 1 &&
        item.slug !== "erp-implementation-cost-calculator",
    );
    expect(nestedPages).toHaveLength(9);

    for (const item of nestedPages) {
      const page = getPage(item.slug, "en");
      const canonical = `https://noeldcosta.com/${item.public_path}`;
      const metadata = buildPageMetadata(page);

      expect(metadata.alternates?.canonical).toBe(canonical);
      expect(metadata.openGraph?.url).toBe(canonical);
      expect(pageWebPageJsonLd(page)).toMatchObject({ url: canonical });
      expect(pageArticleJsonLd(page)).toMatchObject({
        mainEntityOfPage: { "@id": `${canonical}#webpage` },
      });
      expect(metadata.alternates?.languages?.en).toBe(canonical);
    }
  });

  it("keeps flat nested aliases on the approved canonical graph", () => {
    const page = getPage(NESTED_PAGE_SLUG, "en");
    const flatAliasMetadata = buildPageMetadata(page, "/sap-modules/");
    const canonicalMetadata = buildPageMetadata(page, NESTED_PAGE_PATH);

    expect(flatAliasMetadata.alternates).toEqual(canonicalMetadata.alternates);
    expect(flatAliasMetadata.openGraph?.url).toBe(
      `https://noeldcosta.com${NESTED_PAGE_PATH}`,
    );
  });

  it("normalizes canonical fields without allowing invalid, external, or wrong-locale values to corrupt policy", () => {
    const english = getPost(POST_SLUG, "en");
    const spanish = getPost(POST_SLUG, "es");
    const expectedEnglish = `https://noeldcosta.com/${POST_SLUG}/`;
    const expectedSpanish = `https://noeldcosta.com/es/${POST_SLUG}/`;

    expect(
      buildPostMetadata({
        ...english,
        frontmatter: {
          ...english.frontmatter,
          canonical: "https://example.com/stolen/",
          canonicalUrl: expectedEnglish,
        },
      }).alternates?.canonical,
    ).toBe(expectedEnglish);
    expect(
      buildPostMetadata({
        ...english,
        frontmatter: {
          ...english.frontmatter,
          canonical: "not a URL",
          canonicalUrl: "https://example.com/stolen/",
        },
      }).alternates?.canonical,
    ).toBe(expectedEnglish);
    expect(
      buildPostMetadata({
        ...spanish,
        frontmatter: {
          ...spanish.frontmatter,
          canonicalUrl: expectedEnglish,
        },
      }).alternates?.canonical,
    ).toBe(expectedSpanish);
  });

  it("documents canonical-before-canonicalUrl precedence and preserves the deliberate about relationship", () => {
    const about = getPage("about", "en");
    const storyCanonical =
      "https://noeldcosta.com/sap-erp-consultant-my-story-noel-dcosta/";

    expect(buildPageMetadata(about).alternates?.canonical).toBe(storyCanonical);
    expect(
      buildPageMetadata({
        ...about,
        frontmatter: {
          ...about.frontmatter,
          canonical: storyCanonical,
          canonicalUrl: "https://noeldcosta.com/about/",
        },
      }).alternates?.canonical,
    ).toBe(storyCanonical);
    expect(
      buildPageMetadata({
        ...about,
        frontmatter: {
          ...about.frontmatter,
          canonical: "   ",
          canonicalUrl: storyCanonical,
        },
      }).alternates?.canonical,
    ).toBe(storyCanonical);
    expect(
      buildPageMetadata({
        ...about,
        frontmatter: {
          ...about.frontmatter,
          canonical: "https://noeldcosta.com/about/",
          canonicalUrl: storyCanonical,
        },
      }).alternates?.canonical,
    ).toBe(storyCanonical);
  });

  it("keeps Article schema on the same approved canonical as metadata", () => {
    const english = getPost(POST_SLUG, "en");
    const metadata = buildPostMetadata(english);
    expect(articleJsonLd(english).mainEntityOfPage["@id"]).toBe(
      metadata.alternates?.canonical,
    );
  });

  it("preserves the approved route parameter inventory", () => {
    expect(getLocalizedArticleParams()).toHaveLength(81 * 16);
    expect(getLocalizedPageParams()).toHaveLength(29 * 12);
    expect(getLocalizedContentParams()).toHaveLength(81 * 16 + 29 * 12);
  });
});
