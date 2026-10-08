import type { Locale } from "@/lib/locales";
import { translator } from "@/i18n";
import type { ConsentCopy } from "./CookieConsent";

/** Translated text for the cookie bar (server only). */
export function consentCopy(locale: Locale | undefined): ConsentCopy {
  const tr = translator(locale);
  return {
    text: tr(
      "This site uses essential cookies to work, for example to remember your theme and language. With your consent, it may also use analytics cookies to see which articles help readers. There are no advertising cookies. You can change your choice at any time under Cookie settings at the bottom of the page.",
    ),
    policy: tr("Privacy Policy"),
    preferences: tr("Preferences"),
    essentialOnly: tr("Essential only"),
    acceptAll: tr("Accept all"),
    save: tr("Save choices"),
    title: tr("Cookie settings"),
    essential: tr("Essential"),
    essentialNote: tr("Theme, language, your cookie choice and saved articles. Needed for the site to work."),
    alwaysOn: tr("Always on"),
    analytics: tr("Analytics"),
    analyticsNote: tr("Shows which pages are read, so I can write more of what helps. Off unless you turn it on."),
  };
}
