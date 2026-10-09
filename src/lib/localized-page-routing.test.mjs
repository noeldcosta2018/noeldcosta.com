import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  getLocalizedContentParams,
  getLocalizedPage,
  getLocalizedPageParams,
} from "./localized-page-routing.ts";
import {
  buildPageMetadata,
  contactPageJsonLd,
  pageArticleJsonLd,
  pageWebPageJsonLd,
} from "./seo.ts";

// Public prefixes with translated pages.
const PAGE_LOCALES = [
  "ar", "de", "es", "fr", "hi", "it", "ja", "ko", "nl", "pt", "ru", "tr", "zh-CN", "zh-TW",
];

describe("Phase 3B localized MDX page routing", () => {
  it("generates only approved non-tool page paths for translated locales", () => {
    const params = getLocalizedPageParams();

    // 29 routed pages in each language that has translated pages (9 October
    // 2026); Greek and Croatian have none yet.
    expect(params).toHaveLength(29 * PAGE_LOCALES.length);
    for (const locale of PAGE_LOCALES) {
      expect(params.filter((p) => p.locale === locale)).toHaveLength(29);
    }
    expect(params).toContainEqual({
      locale: "es",
      slug: ["sap-implementation", "sap-modules"],
    });
    expect(params).toContainEqual({
      locale: "ja",
      slug: ["contact-noel-erp-support"],
    });
    expect(params).toContainEqual({ locale: "ar", slug: ["case-studies"] });
    expect(params.some(({ locale }) => locale === "el")).toBe(false);
    expect(params.some(({ locale }) => locale === "hr")).toBe(false);
    expect(params.some(({ slug }) => slug.join("/") === "about")).toBe(false);
    expect(
      params.some(({ slug }) => slug.join("/") === "sap-solution-builder"),
    ).toBe(false);
    expect(
      params.some(
        ({ slug }) =>
          slug.join("/") ===
          "sap-s4hana-migration-strategy-greenfield-vs-brownfield",
      ),
    ).toBe(true); // plain MDX page, translations routed
    expect(params.some(({ slug }) => slug.length === 0)).toBe(false);
  });

  it("uses manifest public_path exactly and rejects guessed flat aliases", () => {
    const nested = getLocalizedPage("es", [
      "sap-implementation",
      "sap-modules",
    ]);

    expect(nested).not.toBeNull();
    expect(nested?.frontmatter.slug).toBe("sap-modules");
    expect(nested?.publicPath).toBe("/sap-implementation/sap-modules/");
    expect(nested?.locale).toBe("es");
    expect(nested?.isFallback).toBe(false);
    expect(nested?.body).not.toMatch(/^#\s/m);
    expect(getLocalizedPage("es", ["sap-modules"])).toBeNull();
  });

  it("cannot publish an existing page outside the approved manifest boundary", () => {
    const params = getLocalizedPageParams([
      {
        kind: "page",
        slug: "contact-noel-erp-support",
        public_path: "contact-noel-erp-support/",
        available_locales: ["en", "es"],
      },
    ]);

    expect(params).toEqual([
      { locale: "es", slug: ["contact-noel-erp-support"] },
    ]);
    expect(getLocalizedPage("de", ["contact-noel-erp-support"], [])).toBeNull();
  });

  it("combines the approved article and page inventories without collisions", () => {
    const params = getLocalizedContentParams();
    const keys = params.map(({ locale, slug }) => `${locale}/${slug.join("/")}`);

    // 81 articles in 16 languages plus the routed pages above.
    expect(params).toHaveLength(81 * 16 + 29 * PAGE_LOCALES.length);
    expect(new Set(keys).size).toBe(params.length);
  });

  it("emits nested localized metadata and schema URLs with the content language", () => {
    const page = getLocalizedPage("es", [
      "sap-implementation",
      "sap-modules",
    ]);
    expect(page).not.toBeNull();

    const metadata = buildPageMetadata(page, page?.publicPath);
    expect(metadata.alternates?.canonical).toBe(
      "https://noeldcosta.com/es/sap-implementation/sap-modules/",
    );
    expect(metadata.openGraph?.url).toBe(
      "https://noeldcosta.com/es/sap-implementation/sap-modules/",
    );
    expect(metadata.openGraph?.locale).toBe("es_ES");

    expect(pageWebPageJsonLd(page, page?.publicPath)).toMatchObject({
      url: "https://noeldcosta.com/es/sap-implementation/sap-modules/",
      inLanguage: "es",
    });
    expect(pageArticleJsonLd(page, page?.publicPath)).toMatchObject({
      mainEntityOfPage: {
        "@id":
          "https://noeldcosta.com/es/sap-implementation/sap-modules/#webpage",
      },
      inLanguage: "es",
    });
  });

  it("localizes contact schema language and uses protected page copy", () => {
    expect(
      contactPageJsonLd(
        "https://noeldcosta.com/es/contact-noel-erp-support/",
        "es",
        "Contacto",
        "Descripción protegida",
      ),
    ).toMatchObject({
      url: "https://noeldcosta.com/es/contact-noel-erp-support/",
      name: "Contacto",
      description: "Descripción protegida",
      inLanguage: "es",
    });
  });

  it("lets translated breadcrumb text inherit the document language", () => {
    const source = readFileSync(
      "src/components/MdxPageLayout.tsx",
      "utf8",
    );

    expect(source).not.toContain(
      'lang={page.locale === "en" ? undefined : "en"}',
    );
    expect(source).toContain("{ name: messages.home");
  });
});
