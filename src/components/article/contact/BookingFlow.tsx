"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { BookingCopy } from "./booking-copy";

/**
 * Contact page booking flow: four short questions, a slot picker fed by
 * Cal.com's free times (/api/booking/slots), name and email, then the
 * booking itself (/api/booking). Cal.com sends the invite with the Google Meet
 * link. If Cal.com cannot be reached, the visitor gets a link to the Cal.com
 * booking page with the answers prefilled.
 */

type Answers = { need: string; stage: string; size: string; goal: string };
type Slots = { state: "loading" } | { state: "ready"; slots: string[]; from: number } | { state: "fallback"; url: string };
type Done = { email: string; startTime: string; cancelUrl: string | null; rescheduleUrl: string | null };

const QUESTIONS = ["need", "stage", "size", "goal"] as const;
const CAL = "https://cal.com/noel-benjamin-dcosta-xay9yo/30min";

function dayKey(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

export default function BookingFlow({ copy, locale: contentLocale = "en" }: { copy: BookingCopy; locale?: string }) {
  // British dates for English; the content locale everywhere else.
  const locale = contentLocale === "en" ? "en-GB" : contentLocale;
  const [step, setStep] = useState(0);
  const [q, setQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({ need: "", stage: "", size: "", goal: "" });
  const [slots, setSlots] = useState<Slots>({ state: "loading" });
  const [tz, setTz] = useState("UTC");
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // Fetch free times early, while the visitor answers the questions. The
  // visitor's time zone is read here too, so server and client render alike.
  const fetchSlots = () => {
    fetch("/api/booking/slots/")
      .then((r) => r.json())
      .then((d) => {
        try {
          setTz((current) => (current === "UTC" ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" : current));
        } catch {
          /* keep UTC */
        }
        setSlots(d.configured ? { state: "ready", slots: d.slots as string[], from: Date.now() } : { state: "fallback", url: d.bookingUrl || CAL });
      })
      .catch(() => setSlots({ state: "fallback", url: CAL }));
  };
  const reloadSlots = () => {
    setSlots({ state: "loading" });
    fetchSlots();
  };
  useEffect(fetchSlots, []);

  // Move focus to the new heading on every step change (not on first paint).
  useEffect(() => {
    if (!started.current) {
      started.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step, q]);

  const fmtDay = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", day: "numeric", month: "short" }),
    [locale, tz],
  );
  const fmtTime = useMemo(() => new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" }), [locale, tz]);
  const fmtFull = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }),
    [locale, tz],
  );

  // Group slots by local day and show the next 21 days, free or not.
  const days = useMemo(() => {
    if (slots.state !== "ready") return [];
    const byDay = new Map<string, string[]>();
    for (const s of slots.slots) {
      const k = dayKey(s, tz);
      byDay.set(k, [...(byDay.get(k) ?? []), s]);
    }
    const out: { key: string; label: string; times: string[] }[] = [];
    const start = slots.from;
    for (let i = 0; i < 21; i++) {
      const iso = new Date(start + i * 86400000).toISOString();
      const k = dayKey(iso, tz);
      if (out.some((d) => d.key === k)) continue;
      out.push({ key: k, label: fmtDay.format(new Date(iso)), times: byDay.get(k) ?? [] });
    }
    return out;
  }, [slots, tz, fmtDay]);

  // The chosen day, or the first day with free times.
  const activeDay = days.some((d) => d.key === day && d.times.length) ? day : (days.find((d) => d.times.length)?.key ?? "");

  const zones = useMemo(() => {
    try {
      const list = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.("timeZone") ?? [];
      return list.includes(tz) ? list : [tz, ...list];
    } catch {
      return [tz];
    }
  }, [tz]);

  const label = (list: { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? "";

  const summary = [
    answers.need && `${copy.qNeed} ${label(copy.needs, answers.need)}`,
    answers.stage && `${copy.qStage} ${label(copy.stages, answers.stage)}`,
    answers.size && `${copy.qSize} ${label(copy.sizes, answers.size)}`,
    answers.goal && `${copy.qGoal} ${answers.goal}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const choose = (key: keyof Answers, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setQ((n) => n + 1);
  };

  const finishQuestions = () => {
    setQ(0);
    setStep(1);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!name.trim()) return setError(copy.errName);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(copy.errEmail);
    setBusy(true);
    try {
      const res = await fetch("/api/booking/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...answers,
          name,
          email,
          company,
          startTime: slots.state === "ready" ? slot : "",
          timezone: tz,
          locale: contentLocale,
          page: window.location.pathname,
          website: trap,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok && data.booked) {
        setDone({ email: email.trim(), startTime: slot, cancelUrl: data.cancelUrl ?? null, rescheduleUrl: data.rescheduleUrl ?? null });
        setStep(3);
      } else if (data.ok) {
        // Saved, but not booked directly: offer the prefilled Cal.com page.
        setSlots({ state: "fallback", url: data.bookingUrl || CAL });
        setStep(3);
      } else if (data.error === "slot") {
        setError(copy.errSlot);
        setSlot("");
        reloadSlots();
        setStep(1);
      } else {
        setError(data.error === "rate" ? copy.errRate : data.error === "email" ? copy.errEmail : copy.errGeneric);
      }
    } catch {
      setError(copy.errGeneric);
    } finally {
      setBusy(false);
    }
  };

  const fallbackUrl = (base: string) => {
    const u = new URL(base);
    if (name) u.searchParams.set("name", name);
    if (email) u.searchParams.set("email", email);
    if (summary) u.searchParams.set("notes", summary);
    u.searchParams.set("utm_source", "noeldcosta.com");
    return u.toString();
  };

  const total = 4;
  const stepLabel = copy.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(total));
  const selectedDay = days.find((d) => d.key === activeDay);

  return (
    <section className="not-prose nd-book" aria-label={copy.steps.join(", ")}>
      <ol className="nd-book-progress" aria-label={stepLabel}>
        {copy.steps.map((s, i) => (
          <li key={s} className={i < step ? "is-done" : i === step ? "is-current" : ""} aria-current={i === step ? "step" : undefined}>
            <span className="bar" aria-hidden="true" />
            <span className="txt">{s}</span>
          </li>
        ))}
      </ol>

      <div className="nd-book-body" aria-live="polite">
        {step === 0 && (
          <div className="nd-book-step" key={`q${q}`}>
            <p className="nd-book-kicker">
              {copy.steps[0]} · {q + 1}/{QUESTIONS.length}
            </p>
            {q < 3 ? (
              <>
                <h2 className="nd-book-h" tabIndex={-1} ref={headingRef}>
                  {[copy.qNeed, copy.qStage, copy.qSize][q]}
                </h2>
                <div className="nd-book-options" role="group" aria-label={[copy.qNeed, copy.qStage, copy.qSize][q]}>
                  {[copy.needs, copy.stages, copy.sizes][q].map((o) => {
                    const key = QUESTIONS[q] as keyof Answers;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        className="nd-book-option"
                        aria-pressed={answers[key] === o.value}
                        onClick={() => choose(key, o.value)}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h2 className="nd-book-h" tabIndex={-1} ref={headingRef}>
                  <label htmlFor="nd-book-goal">{copy.qGoal}</label>
                </h2>
                <p className="nd-book-hint">{copy.goalHint}</p>
                <textarea
                  id="nd-book-goal"
                  className="nd-book-input"
                  rows={3}
                  maxLength={600}
                  placeholder={copy.goalPlaceholder}
                  value={answers.goal}
                  onChange={(e) => setAnswers((a) => ({ ...a, goal: e.target.value }))}
                />
              </>
            )}
            <div className="nd-book-actions">
              {q > 0 && (
                <button type="button" className="nd-btn nd-btn-secondary" onClick={() => setQ((n) => n - 1)}>
                  {copy.back}
                </button>
              )}
              {q === 3 ? (
                <button type="button" className="nd-btn nd-btn-accent" onClick={finishQuestions}>
                  {answers.goal.trim() ? copy.next : copy.skip}
                </button>
              ) : (
                answers[QUESTIONS[q] as keyof Answers] && (
                  <button type="button" className="nd-btn nd-btn-secondary" onClick={() => setQ((n) => n + 1)}>
                    {copy.next}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="nd-book-step">
            <h2 className="nd-book-h" tabIndex={-1} ref={headingRef}>
              {slots.state === "fallback" ? copy.fallbackTitle : copy.pickTitle}
            </h2>
            {error && <p className="nd-book-error" role="alert">{error}</p>}

            {slots.state === "loading" && <p className="nd-book-hint">{copy.loadingTimes}</p>}

            {slots.state === "fallback" && (
              <>
                <p className="nd-book-hint">{copy.fallbackBody}</p>
                <a className="nd-btn nd-btn-accent" href={fallbackUrl(slots.url)} target="_blank" rel="noopener noreferrer">
                  {copy.useCalendar}
                </a>
              </>
            )}

            {slots.state === "ready" && (
              <>
                <div className="nd-book-tz">
                  <label htmlFor="nd-book-tz">{copy.timesIn}</label>
                  <select id="nd-book-tz" value={tz} onChange={(e) => setTz(e.target.value)}>
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                {!days.some((d) => d.times.length) ? (
                  <p className="nd-book-hint">{copy.noDays}</p>
                ) : (
                  <div className="nd-book-picker">
                    <div className="nd-book-days" role="listbox" aria-label={copy.pickTitle}>
                      {days.map((d) => (
                        <button
                          key={d.key}
                          type="button"
                          role="option"
                          aria-selected={d.key === activeDay}
                          disabled={!d.times.length}
                          className="nd-book-day"
                          onClick={() => {
                            setDay(d.key);
                            setSlot("");
                          }}
                        >
                          <span className="dw">{d.label}</span>
                          <span className="dn" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                    <div className="nd-book-times" role="group" aria-label={selectedDay?.label}>
                      {selectedDay?.times.length ? (
                        selectedDay.times.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="nd-book-time"
                            aria-pressed={slot === t}
                            onClick={() => {
                              setSlot(t);
                              setError("");
                              setStep(2);
                            }}
                          >
                            {fmtTime.format(new Date(t))}
                          </button>
                        ))
                      ) : (
                        <p className="nd-book-hint">{copy.noTimes}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="nd-book-actions">
              <button type="button" className="nd-btn nd-btn-secondary" onClick={() => { setStep(0); setQ(3); }}>
                {copy.back}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="nd-book-step" onSubmit={submit} noValidate>
            <h2 className="nd-book-h" tabIndex={-1} ref={headingRef}>
              {copy.detailsTitle}
            </h2>
            {slot && (
              <p className="nd-book-slot">
                <span>
                  <strong>{fmtFull.format(new Date(slot))}</strong> · {copy.minutes}
                </span>
                <button type="button" className="nd-book-link" onClick={() => setStep(1)}>
                  {copy.change}
                </button>
              </p>
            )}
            <div className="nd-book-fields">
              <label htmlFor="nd-book-name">
                <span>{copy.name}</span>
                <input id="nd-book-name" className="nd-book-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
              <label htmlFor="nd-book-email">
                <span>{copy.email}</span>
                <input id="nd-book-email" className="nd-book-input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              <label htmlFor="nd-book-company">
                <span>{copy.company}</span>
                <input id="nd-book-company" className="nd-book-input" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} />
              </label>
              <label className="nd-book-trap" aria-hidden="true">
                Website
                <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
              </label>
            </div>
            {error && <p className="nd-book-error" role="alert">{error}</p>}
            <p className="nd-book-hint">{copy.privacy}</p>
            <div className="nd-book-actions">
              <button type="button" className="nd-btn nd-btn-secondary" onClick={() => setStep(1)}>
                {copy.back}
              </button>
              <button type="submit" className="nd-btn nd-btn-accent" disabled={busy}>
                {busy ? copy.booking : copy.book}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="nd-book-step">
            {done ? (
              <>
                <h2 className="nd-book-h" tabIndex={-1} ref={headingRef}>
                  {copy.doneTitle}
                </h2>
                <p className="nd-book-slot">
                  <span>
                    <strong>{fmtFull.format(new Date(done.startTime))}</strong> · {copy.minutes}
                  </span>
                </p>
                <p>{copy.doneBody.replace("{email}", done.email)}</p>
                <div className="nd-book-actions">
                  {done.rescheduleUrl && (
                    <a className="nd-btn nd-btn-secondary" href={done.rescheduleUrl} target="_blank" rel="noopener noreferrer">
                      {copy.reschedule}
                    </a>
                  )}
                  {done.cancelUrl && (
                    <a className="nd-btn nd-btn-secondary" href={done.cancelUrl} target="_blank" rel="noopener noreferrer">
                      {copy.cancel}
                    </a>
                  )}
                </div>
                <p className="nd-book-hint">{copy.doneEmail}</p>
              </>
            ) : (
              <>
                <h2 className="nd-book-h" tabIndex={-1} ref={headingRef}>
                  {copy.fallbackTitle}
                </h2>
                <p className="nd-book-hint">{copy.fallbackBody}</p>
                <div className="nd-book-actions">
                  <a className="nd-btn nd-btn-accent" href={fallbackUrl(slots.state === "fallback" ? slots.url : CAL)} target="_blank" rel="noopener noreferrer">
                    {copy.useCalendar}
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
