"use client";

import { OPEN_CONSENT_EVENT } from "./CookieConsent";

/** Footer link that reopens the cookie bar with the preferences shown. */
export default function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="nd-footer-cookie" onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))}>
      {label}
    </button>
  );
}
