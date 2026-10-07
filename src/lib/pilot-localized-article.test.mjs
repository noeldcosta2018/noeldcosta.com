import { describe, expect, it } from "vitest";
import {
  getLocalizedArticle,
  getLocalizedDocumentAttributes,
} from "./localized-article-routing.ts";
import { articleJsonLd, buildPostMetadata, documentTitle } from "./seo.ts";
import {
  getArticleCategoryLabel,
  getArticleMessages,
} from "./article-localization.ts";

const PILOT_SLUG =
  "create-and-manage-sap-universal-id-link-s-user-and-p-user-ids";

describe("Phase 2 localized article pilot", () => {
  it("preserves the approved Japanese pilot in the expanded route set", () => {
    expect(getLocalizedDocumentAttributes("ja")).toEqual({
      contentLocale: "ja",
      lang: "ja",
      dir: "ltr",
    });
    expect(getLocalizedArticle("ja", PILOT_SLUG)).not.toBeNull();
  });

  it("loads first-class Japanese MDX without English fallback", () => {
    const post = getLocalizedArticle("ja", PILOT_SLUG);

    expect(post).not.toBeNull();
    expect(post?.requestedLocale).toBe("ja");
    expect(post?.locale).toBe("ja");
    expect(post?.isFallback).toBe(false);
    expect(post?.frontmatter.title).toContain("SAP");
    expect(post?.frontmatter.translationSource).toBe("reviewed-en-2026-10");
    expect(post?.body).toContain("Universal ID");
    expect(post?.body).not.toMatch(/^#\s/m);
    expect(post?.body).not.toContain(
      "When I was new to SAP, I spent weeks trying to figure out",
    );
  });

  it("emits Japanese canonical and Open Graph metadata", () => {
    const post = getLocalizedArticle("ja", PILOT_SLUG);
    expect(post).not.toBeNull();

    const metadata = buildPostMetadata(post);
    const canonical =
      "https://noeldcosta.com/ja/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/";

    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(metadata.openGraph?.url).toBe(canonical);
    expect(metadata.openGraph?.locale).toBe("ja_JP");
    // Brand suffix only when the full title fits (documentTitle in seo.ts).
    expect(metadata.title).toEqual(documentTitle(post.frontmatter.metaTitle));
    expect(metadata.description).toBe(post.frontmatter.metaDescription);
  });

  it("emits Japanese Article schema with the localized page URL", () => {
    const post = getLocalizedArticle("ja", PILOT_SLUG);
    expect(post).not.toBeNull();

    const schema = articleJsonLd(post);

    expect(schema.inLanguage).toBe("ja");
    expect(schema.mainEntityOfPage).toEqual({
      "@type": "WebPage",
      "@id":
        "https://noeldcosta.com/ja/create-and-manage-sap-universal-id-link-s-user-and-p-user-ids/",
    });
  });

  it("localizes pilot utility labels and disables unpublished article modules", () => {
    expect(getArticleMessages("ja")).toEqual({
      home: "ホーム",
      category: "記事",
      contents: "目次",
      desktopContents: "目次",
      dateLocale: "ja-JP",
      updatedPrefix: "更新日 ",
      reviewedPrefix: "確認日 ",
      readingTimeSuffix: "分で読めます",
      englishDestinationTitle: "英語ページ",
      englishDestinationNotice: "サイト内ナビゲーションのリンク先は英語ページです。",
      showEnglishArticleModules: false,
    });
    expect(getArticleMessages("en").showEnglishArticleModules).toBe(true);
    expect(getArticleCategoryLabel("en", "AI Governance")).toBe(
      "AI Governance",
    );
    // Without a translated category label the localized "Articles" is used.
    expect(getArticleCategoryLabel("ja", "SAP Modules")).toBe("記事");
  });
});
