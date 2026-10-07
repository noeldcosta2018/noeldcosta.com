import { describe, expect, it } from "vitest";
import {
  getLocalizedArticle,
  getLocalizedArticleParams,
  getLocalizedDocumentAttributes,
  getLocalizedLocaleParams,
  hasExpectedLocaleScript,
} from "./localized-article-routing.ts";
import { PUBLISHED_TRANSLATED_LOCALES } from "./locale-url.ts";
import {
  getArticleCategoryLabel,
  getArticleMessages,
} from "./article-localization.ts";
import { CONTENT_LOCALES } from "./locales.ts";
import { buildPostMetadata } from "./seo.ts";
import { MDX_BODY_LINK_CLASS } from "./article-layout.ts";

describe("Phase 3A localized article routing", () => {
  it("generates every supported non-English locale prefix", () => {
    expect(getLocalizedLocaleParams()).toEqual([
      { locale: "ar" },
      { locale: "de" },
      { locale: "el" },
      { locale: "es" },
      { locale: "fr" },
      { locale: "hi" },
      { locale: "hr" },
      { locale: "it" },
      { locale: "ja" },
      { locale: "ko" },
      { locale: "nl" },
      { locale: "pt" },
      { locale: "ru" },
      { locale: "tr" },
      { locale: "zh-CN" },
      { locale: "zh-TW" },
    ]);
  });

  it("sets public HTML language and direction from a validated prefix", () => {
    expect(getLocalizedDocumentAttributes("ar")).toEqual({
      contentLocale: "ar",
      lang: "ar",
      dir: "rtl",
    });
    expect(getLocalizedDocumentAttributes("zh-CN")).toEqual({
      contentLocale: "zh",
      lang: "zh-CN",
      dir: "ltr",
    });
    expect(getLocalizedDocumentAttributes("ja")).toEqual({
      contentLocale: "ja",
      lang: "ja",
      dir: "ltr",
    });
    expect(getLocalizedDocumentAttributes("zh-TW")).toEqual({
      contentLocale: "zh-TW",
      lang: "zh-TW",
      dir: "ltr",
    });
    expect(getLocalizedDocumentAttributes("en")).toBeNull();
    expect(getLocalizedDocumentAttributes("ka")).toBeNull();
  });

  it("generates only first-class text MDX article variants", () => {
    const params = getLocalizedArticleParams();

    // Every article in every published translated language (16 since 7 October 2026).
    expect(params).toHaveLength(81 * PUBLISHED_TRANSLATED_LOCALES.length);
    expect(params).toContainEqual({
      locale: "es",
      slug: "best-sap-implementation-templates-activate-2024",
    });
    expect(params).toContainEqual({
      locale: "ja",
      slug: "create-and-manage-sap-universal-id-link-s-user-and-p-user-ids",
    });
    expect(params).toContainEqual({ locale: "zh-CN", slug: "sap-cpi" });
    expect(params).toContainEqual({ locale: "ar", slug: "sap-cpi" });
    expect(params.some(({ locale }) => locale === "en")).toBe(false);
  });

  it("cannot publish an existing article variant outside the approved manifest", () => {
    const params = getLocalizedArticleParams([
      {
        kind: "post",
        slug: "best-sap-implementation-templates-activate-2024",
        public_path: "best-sap-implementation-templates-activate-2024/",
        available_locales: ["en", "es"],
      },
    ]);

    expect(params).toEqual([
      {
        locale: "es",
        slug: "best-sap-implementation-templates-activate-2024",
      },
    ]);
    expect(params).not.toContainEqual({
      locale: "de",
      slug: "create-and-manage-sap-universal-id-link-s-user-and-p-user-ids",
    });
  });

  it("loads the requested translation without fallback and removes migrated page chrome", () => {
    const post = getLocalizedArticle(
      "es",
      "best-sap-implementation-templates-activate-2024",
    );

    expect(post).not.toBeNull();
    expect(post?.locale).toBe("es");
    expect(post?.requestedLocale).toBe("es");
    expect(post?.isFallback).toBe(false);
    // Reviewed translations (October 2026) carry no migrated WordPress chrome,
    // so there is no scraped category label to lift out of the body.
    expect(post?.localizedCategoryLabel).toBeUndefined();
    expect(post?.body.trimStart()).not.toMatch(/^#\s/m);
  });

  it("returns 404 data for unsupported, missing, fallback, raw, or binary variants", () => {
    expect(
      getLocalizedArticle("ka", "best-sap-implementation-templates-activate-2024"),
    ).toBeNull();
    expect(getLocalizedArticle("fr", "not-a-real-post")).toBeNull();
    // English text under translated metadata is never served as a translation
    // in a language with its own script.
    const english = "This article is still the English text under translated metadata.";
    expect(hasExpectedLocaleScript(english, "zh")).toBe(false);
    expect(hasExpectedLocaleScript(english, "ar")).toBe(false);
    expect(hasExpectedLocaleScript(english, "el")).toBe(false);
    expect(hasExpectedLocaleScript(english, "hr")).toBe(true);
  });

  it("uses localized article utility copy and suppresses English-only modules", () => {
    for (const locale of CONTENT_LOCALES.filter((value) => value !== "en")) {
      const messages = getArticleMessages(locale);
      expect(messages.home).not.toBe("Home");
      expect(messages.contents).not.toBe("Contents");
      expect(messages.englishDestinationNotice).toBeTruthy();
      expect(messages.showEnglishArticleModules).toBe(false);
    }

    expect(getArticleMessages("es")).toMatchObject({
      home: "Inicio",
      contents: "Contenido",
      dateLocale: "es-ES",
    });
    expect(getArticleMessages("ar")).toMatchObject({
      home: "الرئيسية",
      contents: "المحتويات",
      dateLocale: "ar-AE",
    });
    expect(getArticleMessages("zh")).toMatchObject({
      home: "首页",
      contents: "目录",
      dateLocale: "zh-CN",
    });
    expect(
      getArticleCategoryLabel("es", "SAP Modules", "Artículos de SAP"),
    ).toBe("Artículos de SAP");
  });

  it("emits locale-correct canonical and Open Graph metadata", () => {
    const spanish = getLocalizedArticle(
      "es",
      "best-sap-implementation-templates-activate-2024",
    );
    const arabic = getLocalizedArticle(
      "ar",
      "best-sap-implementation-templates-activate-2024",
    );

    expect(buildPostMetadata(spanish).alternates?.canonical).toBe(
      "https://noeldcosta.com/es/best-sap-implementation-templates-activate-2024/",
    );
    expect(buildPostMetadata(spanish).openGraph?.locale).toBe("es_ES");
    expect(buildPostMetadata(arabic).openGraph?.locale).toBe("ar_AE");
  });

  it("allows long migrated URLs to wrap inside the reading column", () => {
    expect(MDX_BODY_LINK_CLASS).toContain("[overflow-wrap:anywhere]");
  });
});
