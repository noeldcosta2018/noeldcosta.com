"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, FileDown, Link2, Mail, Printer, Share2 } from "lucide-react";
import { SAVED_EVENT, isSaved, toggleSaved } from "@/lib/saved-items";

export type ArticleActionLabels = {
  share: string;
  print: string;
  pdf: string;
  save: string;
  saved: string;
  copyLink: string;
  copied: string;
  linkedin: string;
  x: string;
  email: string;
};

/**
 * Share, print, save as PDF and save for later, in the article banner.
 * Share uses the device share sheet where there is one, otherwise a small
 * menu. Print and PDF both open the browser's print dialog (the print
 * stylesheet strips the site chrome); PDF is "Save as PDF" in that dialog.
 */
export default function ArticleActions({ title, url, labels }: { title: string; url: string; labels: ArticleActionLabels }) {
  const [saved, setSaved] = useState(false);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  })();

  useEffect(() => {
    const sync = () => setSaved(isSaved(path));
    sync();
    window.addEventListener(SAVED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SAVED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [path]);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  async function share() {
    if (typeof navigator !== "undefined" && "share" in navigator && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* cancelled: fall through to the menu */
      }
    }
    setMenu((m) => !m);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the menu still has the other options */
    }
  }

  const enc = encodeURIComponent;
  return (
    <div className="nd-article-actions" ref={wrapRef}>
      <button type="button" aria-label={labels.share} title={labels.share} aria-expanded={menu} onClick={share}>
        <Share2 size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span className="sep" aria-hidden="true" />
      <button type="button" aria-label={labels.print} title={labels.print} onClick={() => window.print()}>
        <Printer size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span className="sep" aria-hidden="true" />
      <button type="button" aria-label={labels.pdf} title={labels.pdf} onClick={() => window.print()}>
        <FileDown size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <span className="sep" aria-hidden="true" />
      <button
        type="button"
        aria-label={saved ? labels.saved : labels.save}
        title={saved ? labels.saved : labels.save}
        aria-pressed={saved}
        data-on={saved || undefined}
        onClick={() => setSaved(toggleSaved({ href: path, title }))}
      >
        {saved ? <BookmarkCheck size={18} strokeWidth={1.75} aria-hidden="true" /> : <Bookmark size={18} strokeWidth={1.75} aria-hidden="true" />}
      </button>
      {menu && (
        <div className="nd-share-menu" role="menu">
          <a role="menuitem" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`} target="_blank" rel="noopener noreferrer">
            {labels.linkedin}
          </a>
          <a role="menuitem" href={`https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`} target="_blank" rel="noopener noreferrer">
            {labels.x}
          </a>
          <a role="menuitem" href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}>
            <Mail size={15} strokeWidth={1.75} aria-hidden="true" /> {labels.email}
          </a>
          <button role="menuitem" type="button" onClick={copy}>
            <Link2 size={15} strokeWidth={1.75} aria-hidden="true" /> {copied ? labels.copied : labels.copyLink}
          </button>
        </div>
      )}
    </div>
  );
}
