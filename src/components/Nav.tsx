import type { Locale } from "@/lib/content";
import { getArticleMessages } from "@/lib/article-localization";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import { localizeHref } from "@/lib/link-repair";
import { hasTranslation, translator } from "@/i18n";
import {
  ABOUT,
  ABOUT_GROUP,
  ACADEMY,
  ARTICLES_INDEX,
  ARTICLE_GROUPS,
  CLIENT_WORK,
  CONTACT,
  EXPERTISE,
  EXPERTISE_GROUPS,
  type MenuGroup,
} from "@/data/site-menu";
import NavClient, { type NavCopy, type NavMenu } from "./NavClient";

/**
 * Global navigation. Server wrapper: translates the menu for the page's locale
 * and points each link at the translated page when one is published, then hands
 * plain strings to the interactive client part (NavClient), so no dictionary
 * ships to the browser.
 */
export default function Nav({
  locale = "en",
  languages,
}: {
  locale?: Locale;
  /** hreflang map (absolute URLs) for the current page, when it has translations. */
  languages?: Record<string, string>;
}) {
  const tr = translator(locale);
  const prefix = publicPrefixFromContentLocale(locale);
  const href = (h: string) => localizeHref(prefix, h);
  const translated = locale === "en" || hasTranslation(locale, "Expertise");

  const group = (g: MenuGroup): MenuGroup => ({
    ...g,
    title: tr(g.title),
    links: g.links.map((l) => ({
      ...l,
      label: tr(l.label),
      note: l.note ? tr(l.note) : undefined,
      href: l.external ? l.href : href(l.href),
    })),
  });

  const copy: NavCopy = {
    lang: translated ? undefined : "en",
    notice: translated ? null : getArticleMessages(locale).englishDestinationNotice,
    skip: tr("Skip to content"),
    homeLabel: tr("Noel D'Costa, home"),
    siteLabel: tr("Enterprise applications · Data · AI"),
    expertise: tr("Expertise"),
    clientWork: tr("Client work"),
    aiAcademy: tr("AI Academy"),
    articlesTools: tr("Articles & tools"),
    aboutNoel: tr("About Noel"),
    discuss: tr("Discuss your project"),
    menu: tr("Menu"),
    close: tr("Close"),
    home: tr("Home"),
    thisPageIn: tr("This page in"),
    allExpertise: tr("All expertise"),
    browseLibrary: tr("Browse the full library"),
    clientWorkAcademy: tr("Client work and academy"),
    caseStudies: tr("Case studies"),
    expertisePrefix: tr("Expertise"),
    themeToggle: tr("Switch between light and dark theme"),
    changeLanguage: tr("Change language"),
    primary: tr("Primary"),
    siteMenu: tr("Site menu"),
  };

  const menu: NavMenu = {
    expertise: EXPERTISE_GROUPS.map(group),
    articles: ARTICLE_GROUPS.map(group),
    about: group(ABOUT_GROUP),
    href: {
      home: href("/"),
      expertise: href(EXPERTISE),
      clientWork: href(CLIENT_WORK),
      academy: href(ACADEMY),
      about: href(ABOUT),
      contact: href(CONTACT),
      library: href(ARTICLES_INDEX),
    },
  };

  return <NavClient locale={locale} languages={languages} copy={copy} menu={menu} />;
}
