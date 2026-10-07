import type { Locale } from "@/lib/locales";
import { translator } from "@/i18n";

/** Translated text for the client-side sign-up form (server only). */
export type SignupCopy = {
  name: string;
  email: string;
  consent: string;
  privacy: string;
  sending: string;
  done: string;
  network: string;
  generic: string;
  button: string;
};

export function signupCopy(locale: Locale | undefined, button = "Get new articles"): SignupCopy {
  const tr = translator(locale);
  return {
    name: tr("Your name"),
    email: tr("Work email"),
    consent: tr(
      "I agree to receive occasional emails from Noel D'Costa about new articles, videos and the AI Academy. I can unsubscribe at any time.",
    ),
    privacy: tr("Privacy"),
    sending: tr("Sending…"),
    done: tr("You're on the list. New articles and videos will reach your inbox."),
    network: tr("Network problem. Please try again."),
    generic: tr("Something went wrong. Please try again."),
    button: tr(button),
  };
}
