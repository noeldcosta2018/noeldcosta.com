import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import * as content from './content.ts';
import sitemap from '../app/sitemap.ts';
import { getLocalizedArticleParams, getLocalizedArticle } from './localized-article-routing.ts';
import { getLocalizedContentParams, getLocalizedPageParams, getLocalizedPage } from './localized-page-routing.ts';
import { buildPageMetadata, buildPostMetadata, toIso } from './seo.ts';
import { readyLocales } from '../i18n/ready.ts';
import { localizedInterfacePaths } from './localized-interface-routes.ts';
import { LEGACY_REDIRECT_SOURCES } from './legacy-redirects.mjs';

const origin = 'https://noeldcosta.com';
// Old WordPress paths redirect (next.config.ts) and stay out of the sitemap.
const redirected = (url) => LEGACY_REDIRECT_SOURCES.has(new URL(url).pathname.replace(/^\/(?:[a-z]{2}|zh-CN|zh-TW)(?=\/)/, ''));
const localized = [
  ...getLocalizedArticleParams().map(({ locale, slug }) => ({ url: `${origin}/${locale}/${slug}/`, kind: 'post', record: getLocalizedArticle(locale, slug) })),
  ...getLocalizedPageParams().map(({ locale, slug }) => ({ url: `${origin}/${locale}/${slug.join('/')}/`, kind: 'page', record: getLocalizedPage(locale, slug) })),
].filter(({ url }) => !redirected(url));

describe('sitemap emitter', () => {
  it('emits unique, absolute, trailing-slash first-party URLs and no held or private routes', () => {
    const urls = sitemap().map(x => x.url);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(new URL(url).origin).toBe(origin);
      expect(new URL(url).pathname.endsWith('/')).toBe(true);
      // "zh" is a content code only; the public prefixes are zh-CN and zh-TW.
      expect(url).not.toMatch(/\/(zh|admin)(\/|$)|\.raw|_not-found/);
    }
    for (const path of ['/privacy/', '/terms/', '/about/']) {
      expect(urls).not.toContain(origin + path);
    }
  }, 30000);

  it('lists the protected nested ERP calculator URL, not its flat alias', () => {
    const urls = sitemap().map(x => x.url);
    expect(urls).toContain(`${origin}/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/`);
    expect(urls).not.toContain(`${origin}/erp-implementation-cost-calculator/`);
  });

  it('lists canonical nested SAP pages, not their flat aliases', () => {
    const urls = sitemap().map(x => x.url);
    expect(urls).toContain(`${origin}/sap-implementation/sap-modules/`);
    expect(urls).not.toContain(`${origin}/sap-modules/`);
    expect(urls).toContain(`${origin}/es/sap-implementation/sap-modules/`);
    expect(urls).toContain(`${origin}/ja/sap-implementation/sap-modules/`);
  });

  it('lists exactly the routed localized variants, each with reciprocal hreflang', () => {
    const urls = new Set(sitemap().map(x => x.url));
    const routed = new Set(getLocalizedContentParams().map(({ locale, slug }) => `${origin}/${locale}/${slug.join('/')}/`));
    // Translated homepages, archives and tools (interface routes) are routed too.
    for (const l of readyLocales()) {
      routed.add(`${origin}/${l}/`);
      for (const p of localizedInterfacePaths(l)) routed.add(`${origin}${p}`);
    }
    const localizedInSitemap = [...urls].filter(u => /^https:\/\/noeldcosta\.com\/[a-z]{2}(-[A-Z]{2})?\//.test(u) && !u.startsWith(`${origin}/category/`) && !u.startsWith(`${origin}/tag/`));
    expect(localized.length).toBeGreaterThan(1000);
    for (const { url, record } of localized) {
      expect(routed.has(url)).toBe(true);
      if (record.frontmatter.noindex) continue;
      expect(urls.has(url)).toBe(true);
    }
    for (const url of localizedInSitemap) {
      if (/^https:\/\/noeldcosta\.com\/(ar|de|el|es|fr|hi|hr|it|ja|ko|nl|pt|ru|tr|zh-CN|zh-TW)\//.test(url)) expect(routed.has(url)).toBe(true);
    }
    // Shared eligibility: every published localized URL carries an hreflang
    // set that includes itself and English (case-studies included).
    for (const { url, kind, record } of localized) {
      if (record.frontmatter.noindex) continue;
      const meta = kind === 'post' ? buildPostMetadata(record) : buildPageMetadata(record, record.publicPath);
      const languages = meta.alternates?.languages ?? {};
      expect(meta.alternates?.canonical).toBe(url);
      expect(languages[record.locale === 'zh' ? 'zh-CN' : record.locale]).toBe(url);
      expect(languages.en).toBeDefined();
      expect(languages['x-default']).toBe(languages.en);
      expect(Object.keys(languages)).not.toContain('zh');
    }
    expect(urls.has(`${origin}/de/case-studies/`)).toBe(true);
  }, 120000);

  it('uses each actual published locale record for dates and images', () => {
    const map = new Map(sitemap().map(x => [x.url, x]));
    for (const { url, kind, record } of localized) {
      expect(record?.isFallback).toBe(false);
      if (record.frontmatter.noindex) continue;
      const fm = matter(readFileSync(`content/${kind === 'post' ? 'posts' : 'pages'}/${record.frontmatter.slug}/${record.locale}.mdx`, 'utf8')).data;
      const rawDate = kind === 'post' ? fm.lastReviewed || fm.updated || fm.date : fm.updated || fm.date;
      expect(map.get(url)?.lastModified?.toISOString()).toBe(toIso(rawDate));
      expect(map.get(url)?.images).toEqual(fm.hero ? [fm.hero.startsWith('http') ? fm.hero : origin + fm.hero] : undefined);
      expect(map.get(url)?.alternates).toBeUndefined();
    }
  }, 60000);

  it('collapses identical duplicate records preserving the canonical entry', () => {
    const slugs = content.getAllPageSlugs();
    const spy = vi.spyOn(content, 'getAllPageSlugs').mockReturnValue([...slugs, 'sap-modules']);
    try { expect(sitemap().filter(x => x.url === origin + '/sap-implementation/sap-modules/')).toHaveLength(1); }
    finally { spy.mockRestore(); }
  });

  it('rejects duplicate canonical records with conflicting dates', () => {
    const original = content.getPage;
    let count = 0;
    const slugs = vi.spyOn(content, 'getAllPageSlugs').mockReturnValue([...content.getAllPageSlugs(), 'sap-modules']);
    const record = vi.spyOn(content, 'getPage').mockImplementation((slug, locale) => {
      const value = original(slug, locale);
      if (slug === 'sap-modules' && locale === 'en' && ++count === 2) return { ...value, frontmatter: { ...value.frontmatter, updated: '2020-01-01' } };
      return value;
    });
    try { expect(() => sitemap()).toThrow('Conflicting sitemap entry'); }
    finally { record.mockRestore(); slugs.mockRestore(); }
  });
});
