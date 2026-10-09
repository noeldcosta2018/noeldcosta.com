"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, Search, X } from "lucide-react";
import type { Locale } from "@/lib/content";
import { publicPrefixFromContentLocale } from "@/lib/locale-url";
import { LANGUAGE_NAMES, YOUTUBE, type MenuGroup } from "@/data/site-menu";
import { SAVED_EVENT, readSaved, removeSaved, type SavedItem } from "@/lib/saved-items";

/** Interface text for the navigation, already translated by the server wrapper (Nav.tsx). */
export type NavCopy = {
  lang?: string;
  notice: string | null;
  skip: string;
  homeLabel: string;
  siteLabel: string;
  expertise: string;
  clientWork: string;
  aiAcademy: string;
  articlesTools: string;
  aboutNoel: string;
  about: string;
  discuss: string;
  menu: string;
  close: string;
  home: string;
  thisPageIn: string;
  allExpertise: string;
  browseLibrary: string;
  clientWorkAcademy: string;
  caseStudies: string;
  expertisePrefix: string;
  themeToggle: string;
  changeLanguage: string;
  primary: string;
  siteMenu: string;
  utility: string;
  books: string;
  youtube: string;
  subscribe: string;
  contact: string;
  saved: string;
  savedEmpty: string;
  remove: string;
  explore: string;
  searchLabel: string;
  searchPlaceholder: string;
  noResults: string;
  allArticles: string;
  closeSearch: string;
};

export type NavMenu = {
  expertise: MenuGroup[];
  articles: MenuGroup[];
  about: MenuGroup;
  href: {
    home: string;
    expertise: string;
    clientWork: string;
    academy: string;
    about: string;
    contact: string;
    library: string;
    books: string;
    searchIndex: string;
  };
};

const LOCALE_PATH = /^\/(?:ar|de|es|fr|hi|it|ja|ko|nl|pt|ru|tr|zh-CN|zh-TW|el|hr)(?=\/)/;

type Panel = "expertise" | "articles" | "about" | "language" | "saved" | "search" | null;

const AREA_VAR: Record<string, string> = {
  apps: "var(--area-apps)",
  data: "var(--area-data)",
  ai: "var(--area-ai)",
};

/**
 * Global navigation, two rows. A slim utility row (books, YouTube, subscribe,
 * contact, language, saved articles, theme) slides away once the page scrolls;
 * the main row keeps the brand, the menus (opened by click or keyboard, never
 * hover-only), Explore search and the primary action. Every menu link is a real
 * anchor; panels are rendered hidden in the server HTML so crawlers and no-JS
 * visitors still see the full menu.
 */
export default function NavClient({
  locale = "en",
  languages,
  copy,
  menu,
}: {
  locale?: Locale;
  /** hreflang map (absolute URLs) for the current page, when it has translations. */
  languages?: Record<string, string>;
  copy: NavCopy;
  menu: NavMenu;
}) {
  const pathname = usePathname() ?? "/";
  return <NavForPath key={pathname} pathname={pathname} locale={locale} languages={languages} copy={copy} menu={menu} />;
}

function toPath(url: string): string {
  try {
    const u = new URL(url);
    return `${u.pathname}${u.hash}`;
  } catch {
    return url;
  }
}

function NavForPath({
  pathname,
  locale,
  languages,
  copy,
  menu,
}: {
  pathname: string;
  locale: Locale;
  languages?: Record<string, string>;
  copy: NavCopy;
  menu: NavMenu;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const navLang = copy.lang;
  const EXPERTISE = menu.href.expertise;
  const CLIENT_WORK = menu.href.clientWork;
  const ACADEMY = menu.href.academy;
  const CONTACT = menu.href.contact;

  const languageList = languages
    ? Object.entries(languages)
        .filter(([code]) => code !== "x-default" && LANGUAGE_NAMES[code])
        .map(([code, url]) => ({ code, href: toPath(url), name: LANGUAGE_NAMES[code] }))
    : [];
  const currentCode = publicPrefixFromContentLocale(locale) ?? "en";
  const currentName = LANGUAGE_NAMES[currentCode] ?? "English";

  const closePanel = useCallback((restoreFocus: boolean) => {
    setPanel(null);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Scroll state and reading progress, rAF-throttled.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      progressRef.current?.style.setProperty(
        "--progress",
        String(max > 0 ? Math.min(1, window.scrollY / max) : 0),
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Saved articles live in this browser; keep the count in step with other tabs.
  useEffect(() => {
    const sync = () => setSaved(readSaved());
    sync();
    window.addEventListener(SAVED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SAVED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Outside click and Escape close the open panel or the mobile menu.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (panel) closePanel(true);
      if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [panel, menuOpen, closePanel]);

  // Lock page scroll under the mobile menu.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  function togglePanel(next: Exclude<Panel, null>, e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    triggerRef.current = e.currentTarget;
    setPanel((p) => (p === next ? null : next));
  }

  const toggleTheme = () => {
    const doc = document.documentElement;
    const order = ["hybrid", "light", "dark"];
    const current = order.indexOf(doc.getAttribute("data-theme") ?? "hybrid");
    const next = order[(current + 1) % order.length];
    doc.setAttribute("data-theme", next);
    try {
      localStorage.setItem("nd-theme-v2", next);
    } catch {
      /* storage unavailable: the choice lasts for this page only */
    }
  };

  const plainPath = pathname.replace(LOCALE_PATH, "");
  const isActive = (prefixes: string[]) =>
    prefixes.some((p) => plainPath === p || plainPath.startsWith(p));
  const expertiseActive = isActive([EXPERTISE, "/sap-implementation/", "/ai-governance-services/", "/erp-for-small-business-ai-automation/"]);
  const articlesActive = isActive(["/category/", "/tag/", "/best-sap-articles", "/books/", "/simplify-your-business", "/sap-implementation-cost-calculator/", "/sap-job-description-generator/", "/sap-solution-builder/", "/free-data-migration-estimator"]);
  const aboutActive = isActive(menu.about.links.filter((l) => !l.external).map((l) => l.href.replace(LOCALE_PATH, "")));

  const searchLinks = useMemo(
    () => [...menu.expertise, ...menu.articles, menu.about].flatMap((g) => g.links.filter((l) => !l.external)),
    [menu],
  );

  return (
    <>
      <a className="nd-skip" href="#main-content">
        {copy.skip}
      </a>
      <header ref={headerRef} className={`nd-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="nd-utility" lang={navLang}>
          <nav className="nd-utility-links" aria-label={copy.utility}>
            <Link href={menu.href.books}>{copy.books}</Link>
            <a href={YOUTUBE} target="_blank" rel="noopener noreferrer">
              {copy.youtube}
            </a>
            <a href="#newsletter">{copy.subscribe}</a>
            <Link href={CONTACT}>{copy.contact}</Link>
          </nav>
          <div className="nd-utility-tools">
            {languageList.length > 1 && (
              <div className="nd-nav-item">
                <button
                  type="button"
                  className="nd-utility-btn"
                  aria-expanded={panel === "language"}
                  aria-controls="nd-panel-language"
                  aria-label={`${currentName}. ${copy.changeLanguage}`}
                  onClick={(e) => togglePanel("language", e)}
                >
                  <GlobeIcon />
                  {currentName}
                  <Caret />
                </button>
                <div id="nd-panel-language" className="nd-panel nd-panel-end" hidden={panel !== "language"} style={{ ["--cols" as string]: 2, width: 340 }}>
                  <div className="group" style={{ gridColumn: "1 / -1" }}>
                    {copy.thisPageIn}
                  </div>
                  {languageList.map((l) => (
                    <a
                      key={l.code}
                      href={l.href}
                      hrefLang={l.code}
                      lang={l.code}
                      aria-current={l.code === currentCode ? "page" : undefined}
                      style={l.code === currentCode ? { color: "var(--accent)", fontWeight: 600 } : undefined}
                    >
                      {l.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="nd-nav-item">
              <button
                type="button"
                className="nd-utility-btn"
                aria-expanded={panel === "saved"}
                aria-controls="nd-panel-saved"
                onClick={(e) => togglePanel("saved", e)}
              >
                <Bookmark size={13} strokeWidth={2.2} aria-hidden="true" />
                {copy.saved}
                {saved.length > 0 && <span className="count">{saved.length}</span>}
                <Caret />
              </button>
              <div id="nd-panel-saved" className="nd-panel nd-panel-end nd-saved" hidden={panel !== "saved"}>
                {saved.length ? (
                  <ul>
                    {saved.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href}>{i.title}</Link>
                        <button type="button" aria-label={`${copy.remove}: ${i.title}`} onClick={() => removeSaved(i.href)}>
                          <X size={14} strokeWidth={2} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>{copy.savedEmpty}</p>
                )}
              </div>
            </div>
            <button type="button" className="nd-theme-toggle nd-theme-sm" onClick={toggleTheme} aria-label={copy.themeToggle}>
              <SunIcon />
              <MoonIcon />
              <HalfIcon />
            </button>
          </div>
        </div>

        <nav lang={navLang} className={`nd-nav${scrolled ? " is-scrolled" : ""}`} aria-label={copy.primary}>
          <Link className="nd-brand" href={menu.href.home} aria-label={copy.homeLabel}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="nd-on-dark" src="/brand/nd-monogram-on-dark.svg" alt="" width={36} height={22} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="nd-on-light" src="/brand/nd-monogram.svg" alt="" width={36} height={22} />
            <span className="word">NOEL DCOSTA</span>
          </Link>

          <ul className="nd-nav-links">
            <li className="nd-nav-item">
              <button
                type="button"
                className="nd-nav-link"
                aria-expanded={panel === "expertise"}
                aria-controls="nd-panel-expertise"
                data-active={expertiseActive || undefined}
                onClick={(e) => togglePanel("expertise", e)}
              >
                {copy.expertise} <Caret />
              </button>
              <PanelGroups
                id="nd-panel-expertise"
                open={panel === "expertise"}
                groups={menu.expertise}
                foot={{ label: copy.allExpertise, href: EXPERTISE }}
                discuss={{ label: copy.discuss, href: CONTACT }}
              />
            </li>
            <li className="nd-nav-item">
              <Link className="nd-nav-link" href={CLIENT_WORK} aria-current={pathname === CLIENT_WORK ? "page" : undefined}>
                {copy.clientWork}
              </Link>
            </li>
            <li className="nd-nav-item">
              <Link className="nd-nav-link" href={ACADEMY} aria-current={pathname === ACADEMY ? "page" : undefined}>
                {copy.aiAcademy}
              </Link>
            </li>
            <li className="nd-nav-item">
              <button
                type="button"
                className="nd-nav-link"
                aria-expanded={panel === "articles"}
                aria-controls="nd-panel-articles"
                data-active={articlesActive || undefined}
                onClick={(e) => togglePanel("articles", e)}
              >
                {copy.articlesTools} <Caret />
              </button>
              <PanelGroups
                id="nd-panel-articles"
                open={panel === "articles"}
                groups={menu.articles}
                foot={{ label: copy.browseLibrary, href: menu.href.library }}
                discuss={{ label: copy.discuss, href: CONTACT }}
              />
            </li>
            <li className="nd-nav-item">
              <button
                type="button"
                className="nd-nav-link"
                aria-expanded={panel === "about"}
                aria-controls="nd-panel-about"
                data-active={aboutActive || undefined}
                onClick={(e) => togglePanel("about", e)}
              >
                {copy.about} <Caret />
              </button>
              <PanelGroups
                id="nd-panel-about"
                open={panel === "about"}
                groups={[{ ...menu.about, links: menu.about.links.filter((l) => l.href !== CONTACT) }]}
                narrow
                foot={{ label: copy.aboutNoel, href: menu.href.about }}
                discuss={{ label: copy.discuss, href: CONTACT }}
              />
            </li>
          </ul>

          <button
            type="button"
            className="nd-explore"
            aria-expanded={panel === "search"}
            aria-controls="nd-search"
            onClick={(e) => togglePanel("search", e)}
          >
            <span className="lbl">{copy.explore}</span>
            <Search size={18} strokeWidth={1.9} aria-hidden="true" />
          </button>

          <Link className="nd-btn nd-btn-primary nd-nav-cta magnetic" href={CONTACT}>
            {copy.discuss} <span aria-hidden="true">→</span>
          </Link>

          <button
            type="button"
            className="nd-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="nd-site-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="nd-burger" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="label">{menuOpen ? copy.close : copy.menu}</span>
          </button>

          <button type="button" className="nd-theme-toggle nd-mobile-only" onClick={toggleTheme} aria-label={copy.themeToggle}>
            <SunIcon />
            <MoonIcon />
            <HalfIcon />
          </button>
        </nav>

        {panel === "search" && (
          <SearchPanel
            indexUrl={menu.href.searchIndex}
            links={searchLinks}
            libraryHref={menu.href.library}
            copy={copy}
            onClose={() => closePanel(true)}
          />
        )}
      </header>
      <div ref={progressRef} className="nd-progress" aria-hidden="true" />

      {copy.notice && (
        <p lang={publicPrefixFromContentLocale(locale) ?? "en"} className="nd-notice">
          {copy.notice}
        </p>
      )}

      <div id="nd-site-menu" className="nd-site-menu" hidden={!menuOpen} lang={navLang}>
        <nav aria-label={copy.siteMenu} className="cols" onClick={(e) => (e.target as HTMLElement).closest("a") && setMenuOpen(false)}>
          <Link className="home" href={menu.href.home}>
            {copy.home}
          </Link>
          {languageList.length > 1 && (
            <MenuColumn
              group={{
                title: copy.thisPageIn,
                links: languageList.map((l) => ({ label: l.name, href: l.href })),
              }}
            />
          )}
          {menu.expertise.map((g) => (
            <MenuColumn key={g.title} group={{ ...g, title: `${copy.expertisePrefix} · ${g.title}` }} />
          ))}
          <MenuColumn
            group={{
              title: copy.clientWorkAcademy,
              links: [
                { label: copy.caseStudies, href: CLIENT_WORK },
                { label: copy.aiAcademy, href: ACADEMY },
                { label: copy.allExpertise, href: EXPERTISE },
              ],
            }}
          />
          {menu.articles.map((g) => (
            <MenuColumn key={g.title} group={g} />
          ))}
          <MenuColumn group={menu.about} />
          {saved.length > 0 && (
            <MenuColumn group={{ title: copy.saved, links: saved.map((i) => ({ label: i.title, href: i.href })) }} />
          )}
        </nav>
      </div>
    </>
  );
}

type SearchItem = { t: string; d: string; h: string };

// Case, accents and punctuation are ignored, so "s4hana" finds "S/4HANA".
const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "");

/** Explore: searches the article titles and summaries of the page's language, plus the menu pages. */
function SearchPanel({
  indexUrl,
  links,
  libraryHref,
  copy,
  onClose,
}: {
  indexUrl: string;
  links: { label: string; href: string }[];
  libraryHref: string;
  copy: NavCopy;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    let live = true;
    fetch(indexUrl)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchItem[]) => live && setItems(Array.isArray(data) ? data : []))
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [indexUrl]);

  const results = useMemo(() => {
    const words = fold(q.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const pool: SearchItem[] = [...links.map((l) => ({ t: l.label, d: "", h: l.href })), ...items];
    const seen = new Set<string>();
    return pool
      .filter((i) => {
        if (seen.has(i.h)) return false;
        const hay = fold(`${i.t} ${i.d}`);
        const hit = words.every((w) => hay.includes(w));
        if (hit) seen.add(i.h);
        return hit;
      })
      .slice(0, 8);
  }, [q, items, links]);

  return (
    <div id="nd-search" className="nd-search" role="search">
      <div className="nd-search-inner">
        <Search size={20} strokeWidth={1.9} aria-hidden="true" />
        <label className="sr-only" htmlFor="nd-search-input">
          {copy.searchLabel}
        </label>
        <input
          id="nd-search-input"
          ref={inputRef}
          type="search"
          autoComplete="off"
          value={q}
          placeholder={copy.searchPlaceholder}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) {
              e.preventDefault();
              onClose();
              router.push(results[0].h);
            }
          }}
        />
        <button type="button" className="x" aria-label={copy.closeSearch} onClick={onClose}>
          <X size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      {q.trim() && (
        <ul className="nd-search-results" aria-live="polite">
          {results.length ? (
            results.map((r) => (
              <li key={r.h}>
                <Link href={r.h} onClick={onClose}>
                  <b>{r.t}</b>
                  {r.d && <span>{r.d}</span>}
                </Link>
              </li>
            ))
          ) : (
            <li className="empty">
              {copy.noResults}{" "}
              <Link href={libraryHref} onClick={onClose}>
                {copy.allArticles}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function PanelGroups({
  id,
  open,
  groups,
  foot,
  discuss,
  narrow,
}: {
  id: string;
  open: boolean;
  groups: MenuGroup[];
  foot: { label: string; href: string };
  discuss: { label: string; href: string };
  narrow?: boolean;
}) {
  return (
    <div
      id={id}
      className={`nd-panel${narrow ? " nd-panel-narrow" : ""}`}
      hidden={!open}
      style={{ ["--cols" as string]: groups.length }}
    >
      {groups.map((g) => (
        <div key={g.title}>
          <div className="group">
            {g.area && <i style={{ background: AREA_VAR[g.area] }} aria-hidden="true" />}
            {g.title}
          </div>
          <ul>
            {g.links.map((l) => (
              <li key={l.href}>
                {l.external ? (
                  <a href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link href={l.href}>
                    {l.label}
                    {l.note && <small>{l.note}</small>}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="foot">
        <Link className="nd-textlink" href={foot.href}>
          {foot.label} <span aria-hidden="true">→</span>
        </Link>
        <Link className="nd-textlink" href={discuss.href}>
          {discuss.label} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

function MenuColumn({ group }: { group: MenuGroup }) {
  return (
    <div>
      <div className="group">{group.title}</div>
      <ul>
        {group.links.map((l) => (
          <li key={`${group.title}-${l.href}`}>
            {l.external ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
              </a>
            ) : (
              <Link href={l.href}>{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Solid accent triangle beside menus that open a panel. */
function Caret() {
  return (
    <svg className="caret" viewBox="0 0 10 10" aria-hidden="true">
      <path d="M1 3h8L5 8z" fill="currentColor" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="sun" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="moon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function HalfIcon() {
  return (
    <svg className="half" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
