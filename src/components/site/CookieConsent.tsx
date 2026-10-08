"use client";

import { useEffect, useState } from "react";

export type ConsentCopy = {
  text: string;
  policy: string;
  preferences: string;
  essentialOnly: string;
  acceptAll: string;
  save: string;
  title: string;
  essential: string;
  essentialNote: string;
  alwaysOn: string;
  analytics: string;
  analyticsNote: string;
};

export type Consent = { v: 1; analytics: boolean; at: string };

const KEY = "nd-consent";
/** Fired on window when the visitor saves a choice (detail: Consent). */
export const CONSENT_EVENT = "nd-consent-change";
/** Dispatch this on window (the footer's "Cookie settings" link does) to reopen the bar. */
export const OPEN_CONSENT_EVENT = "nd-open-consent";

export function readConsent(): Consent | null {
  try {
    const c = JSON.parse(localStorage.getItem(KEY) || "null");
    return c && c.v === 1 ? (c as Consent) : null;
  } catch {
    return null;
  }
}

/**
 * Cookie bar. Essential storage only until the visitor chooses; analytics
 * (none installed yet) must check readConsent()?.analytics before loading.
 * Rejecting is one click, as easy as accepting.
 */
export default function CookieConsent({ copy, policyHref }: { copy: ConsentCopy; policyHref: string }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    // Shown just after first paint so the bar never competes with the page itself.
    const show = window.setTimeout(() => {
      const existing = readConsent();
      if (!existing) setOpen(true);
      else setAnalytics(existing.analytics);
    }, 400);
    const reopen = () => {
      setAnalytics(readConsent()?.analytics ?? false);
      setPrefs(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => {
      window.clearTimeout(show);
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
    };
  }, []);

  function decide(allowAnalytics: boolean) {
    const consent: Consent = { v: 1, analytics: allowAnalytics, at: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(consent));
    } catch {
      /* storage unavailable: the bar shows again next time */
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
    setOpen(false);
    setPrefs(false);
  }

  if (!open) return null;
  return (
    <section className="nd-cookie" role="dialog" aria-modal="false" aria-label={copy.title}>
      <div className="nd-cookie-inner">
        <p className="nd-cookie-text">
          {copy.text}{" "}
          <a href={policyHref}>{copy.policy}</a>
        </p>
        {prefs && (
          <div className="nd-cookie-prefs">
            <div className="row">
              <div>
                <b>{copy.essential}</b>
                <span>{copy.essentialNote}</span>
              </div>
              <span className="always">{copy.alwaysOn}</span>
            </div>
            <label className="row">
              <div>
                <b>{copy.analytics}</b>
                <span>{copy.analyticsNote}</span>
              </div>
              <input type="checkbox" role="switch" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
            </label>
          </div>
        )}
        <div className="nd-cookie-actions">
          {prefs ? (
            <button type="button" className="nd-btn nd-btn-secondary" onClick={() => decide(analytics)}>
              {copy.save}
            </button>
          ) : (
            <button type="button" className="nd-btn nd-btn-secondary" onClick={() => setPrefs(true)}>
              {copy.preferences}
            </button>
          )}
          <button type="button" className="nd-btn nd-btn-secondary" onClick={() => decide(false)}>
            {copy.essentialOnly}
          </button>
          <button type="button" className="nd-btn nd-btn-primary" onClick={() => decide(true)}>
            {copy.acceptAll}
          </button>
        </div>
      </div>
    </section>
  );
}
