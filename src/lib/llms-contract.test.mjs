import { describe, it, expect, vi } from 'vitest';
import * as content from './content';
import { GET, dynamic } from '../app/llms.txt/route';
import { resolveCanonicalUrl } from './seo-graph';

const urls = text => [...text.matchAll(/\]\((https:\/\/noeldcosta\.com\/[^)]+)\)/g)].map(m => m[1]);
const text = async () => (await GET()).text();

describe('llms.txt route', () => {
  it('links only unique, absolute, trailing-slash first-party URLs plus the sitemap', async () => {
    const links = urls(await text());
    expect(links.length).toBeGreaterThan(10);
    expect(new Set(links).size).toBe(links.length);
    for (const link of links) {
      if (link.endsWith('/sitemap.xml')) continue;
      expect(new URL(link).pathname.endsWith('/')).toBe(true);
    }
    expect(links.filter(u => u.endsWith('/sitemap.xml'))).toEqual(['https://noeldcosta.com/sitemap.xml']);
  });

  it('starts with the canonical about page and links tools at their canonical URLs', async () => {
    const links = urls(await text());
    expect(links[0]).toBe('https://noeldcosta.com/sap-erp-consultant-my-story-noel-dcosta/');
    expect(links).toContain('https://noeldcosta.com/ai-insights-shiftgearx-noeldcosta/erp-implementation-cost-calculator/');
    expect(links).not.toContain('https://noeldcosta.com/erp-implementation-cost-calculator/');
    for (const post of content.getAllPosts('en').filter(p => !p.isFallback && !p.frontmatter.noindex)) {
      const url = `https://noeldcosta.com/${post.frontmatter.slug}/`;
      if (links.includes(url)) {
        expect(resolveCanonicalUrl({ kind: 'post', slug: post.frontmatter.slug, locale: 'en', frontmatter: post.frontmatter })).toBe(url);
      }
    }
  });

  it('retains static generation and response/cache headers', async () => {
    const response = await GET();
    expect(dynamic).toBe('force-static');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('cache-control')).toBe('public, max-age=3600, s-maxage=86400');
  });

  it.each(['noindex', 'fallback'])('excludes a real post marked %s without modifying source content', async flag => {
    const before = urls(await text());
    const real = content.getAllPosts('en').find(p => before.includes(`https://noeldcosta.com/${p.frontmatter.slug}/`));
    expect(real).toBeDefined();
    const excluded = { ...real, isFallback: flag === 'fallback', frontmatter: { ...real.frontmatter, noindex: flag === 'noindex' } };
    const spy = vi.spyOn(content, 'getAllPosts').mockReturnValue([excluded]);
    try {
      const links = urls(await text());
      expect(links).not.toContain(`https://noeldcosta.com/${real.frontmatter.slug}/`);
    } finally { spy.mockRestore(); }
  });
});
