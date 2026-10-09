"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { SignupCopy } from "./signup-copy";

const ENGLISH: SignupCopy = {
  name: "Your name",
  email: "Work email",
  consent:
    "I agree to receive occasional emails from Noel D'Costa about new articles, videos and the AI Academy. I can unsubscribe at any time.",
  privacy: "Privacy",
  sending: "Sending…",
  done: "You're on the list. New articles and videos will reach your inbox.",
  network: "Network problem. Please try again.",
  generic: "Something went wrong. Please try again.",
  button: "Get new articles",
};

/**
 * Name + email sign-up. Posts to /api/subscribe, which stores the contact in
 * Supabase (nd_contacts). Explicit consent box; honeypot field for bots.
 * Text comes translated from the server (signupCopy); English is the default.
 */
export default function SignupForm({
  source = "newsletter",
  compact = false,
  copy = ENGLISH,
  privacyHref = "/privacy-policy-noeldcosta/",
  serverErrors = true,
  endpoint = "/api/subscribe/",
  buttonBefore,
  buttonAfter,
}: {
  source?: "newsletter" | "footer" | "article" | "academy" | "ai-ready-waitlist";
  compact?: boolean;
  copy?: SignupCopy;
  privacyHref?: string;
  /** false: always show copy.generic instead of the server's message. */
  serverErrors?: boolean;
  /** Where the form posts; the /api/subscribe handler by default. */
  endpoint?: string;
  /** Optional decoration either side of the submit button (AI Academy arrows). */
  buttonBefore?: React.ReactNode;
  buttonAfter?: React.ReactNode;
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    setMessage("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
          source,
          page: window.location.pathname,
          locale: document.documentElement.lang || "en",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setState("done");
        setMessage(copy.done);
      } else {
        setState("error");
        setMessage((serverErrors && data.error) || copy.generic);
      }
    } catch {
      setState("error");
      setMessage(serverErrors ? copy.network : copy.generic);
    }
  }

  const submit = (
    <button className="nd-btn nd-btn-primary" type="submit" disabled={state === "sending"}>
      {state === "sending" ? copy.sending : copy.button} <span aria-hidden="true">→</span>
    </button>
  );

  if (state === "done") {
    return (
      <p className="nd-signup-done" role="status">
        <span aria-hidden="true">✓</span> {message}
      </p>
    );
  }

  return (
    <form className={`nd-signup${compact ? " compact" : ""}`} onSubmit={onSubmit}>
      <div className="fields">
        <label className="sr-only" htmlFor={`${id}-name`}>
          {copy.name}
        </label>
        <input id={`${id}-name`} name="name" type="text" autoComplete="name" placeholder={copy.name} required maxLength={120} />
        <label className="sr-only" htmlFor={`${id}-email`}>
          {copy.email}
        </label>
        <input id={`${id}-email`} name="email" type="email" autoComplete="email" placeholder={copy.email} required maxLength={254} />
        {buttonBefore || buttonAfter ? (
          <div className="nd-signup-btnrow">
            {buttonBefore}
            {submit}
            {buttonAfter}
          </div>
        ) : (
          submit
        )}
      </div>
      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="nd-hp">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent" htmlFor={`${id}-consent`}>
        <input id={`${id}-consent`} name="consent" type="checkbox" required />
        <span>
          {copy.consent} <Link href={privacyHref}>{copy.privacy}</Link>.
        </span>
      </label>
      {state === "error" && (
        <p className="nd-signup-error" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
