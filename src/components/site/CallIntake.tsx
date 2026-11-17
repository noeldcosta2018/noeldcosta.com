"use client";

import { useState } from "react";
import { CAREER_CALL_URL, CONSULTING_CAL_URL, MIN_INTENT, consultingBookingUrl } from "@/lib/call-intake";

/**
 * Every "Book a call" on the site lands here first (Noel, 16 and 17 November 2026).
 * The visitor says whether the call is for business consulting or career advice.
 * Career advice is paid and booked on erpcv.com, which asks its own questions.
 * Consulting is free: the visitor writes the intent of the meeting and a few
 * details, then picks a time on the hidden Cal.com "Business consulting call",
 * with the answers filled in so they reach Noel in the booking.
 */

type Purpose = "career" | "consulting";
type Field = { key: string; label: string; placeholder?: string; options?: string[] };

const FIELDS: Field[] = [
  { key: "company", label: "Organisation", placeholder: "Company name" },
  { key: "role", label: "Your role", placeholder: "For example, CFO or programme director" },
  { key: "need", label: "What the call is about", options: ["SAP or ERP implementation", "S/4HANA migration", "A programme in trouble", "Partner selection or contract review", "Data and AI", "Something else"] },
  { key: "stage", label: "Where the programme is", options: ["Exploring options", "Choosing a partner or system", "In design", "Mid-implementation", "Live and fixing issues"] },
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CallIntake() {
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [intent, setIntent] = useState("");
  const [extra, setExtra] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return setError("Please add your name.");
    if (!EMAIL_RE.test(email.trim())) return setError("Please check your email address.");
    if (!extra.company?.trim()) return setError("Please add your organisation.");
    if (intent.trim().length < MIN_INTENT) return setError(`Please describe what you want from the call in a sentence or two (at least ${MIN_INTENT} characters).`);
    setError("");
    const answers = FIELDS.map((f) => [f.label, extra[f.key] ?? ""]).filter(([, a]) => a.trim());
    setBookingUrl(consultingBookingUrl(CONSULTING_CAL_URL, { name: name.trim(), email: email.trim(), intent, answers }));
  }

  if (bookingUrl) {
    return (
      <div className="not-prose nd-book">
        <h2 className="nd-book-h">Choose a time</h2>
        <p className="nd-book-hint">Your answers are filled in. Pick a 30-minute slot and confirm.</p>
        <iframe src={bookingUrl} title="Book a business consulting call with Noel D'Costa" style={{ width: "100%", minHeight: 720, border: 0 }} />
      </div>
    );
  }

  return (
    <div className="not-prose nd-book">
      <h2 className="nd-book-h">What is the call for?</h2>
      <div className="nd-book-options" role="radiogroup" aria-label="What is the call for?">
        <button type="button" role="radio" aria-checked={purpose === "consulting"} className="nd-book-option" onClick={() => setPurpose("consulting")}>
          <strong>Business consulting</strong>
          <span>An ERP, data or AI programme in your organisation. The first call is free.</span>
        </button>
        <button type="button" role="radio" aria-checked={purpose === "career"} className="nd-book-option" onClick={() => setPurpose("career")}>
          <strong>Career advice</strong>
          <span>Your CV, a move, a promotion or the Middle East. A paid 30-minute call, booked on erpcv.com.</span>
        </button>
      </div>

      {purpose === "career" && (
        <div className="nd-book-fields">
          <p className="nd-book-hint">Career calls are paid at ERPCV&rsquo;s advisory rates. On erpcv.com you answer a few questions, choose a time and pay before the call is booked.</p>
          <div className="nd-book-actions">
            <a className="nd-btn nd-btn-accent" href={CAREER_CALL_URL}>Continue to paid career call</a>
          </div>
        </div>
      )}

      {purpose === "consulting" && (
        <form className="nd-book-fields" onSubmit={submit} noValidate>
          <label className="nd-book-input">
            <span>Intent of the meeting</span>
            <textarea required rows={4} value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="What is happening in the programme, and what would make the call worth it?" />
          </label>
          {FIELDS.map((f) => (
            <label className="nd-book-input" key={f.key}>
              <span>{f.label}</span>
              {f.options ? (
                <select value={extra[f.key] ?? ""} onChange={(e) => setExtra({ ...extra, [f.key]: e.target.value })}>
                  <option value="">Choose one</option>
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input value={extra[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => setExtra({ ...extra, [f.key]: e.target.value })} />
              )}
            </label>
          ))}
          <label className="nd-book-input">
            <span>Your name</span>
            <input required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="nd-book-input">
            <span>Work email</span>
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && <p className="nd-book-error" role="alert">{error}</p>}
          <div className="nd-book-actions">
            <button type="submit" className="nd-btn nd-btn-accent">Choose a time</button>
          </div>
        </form>
      )}
    </div>
  );
}
