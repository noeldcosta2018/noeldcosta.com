"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ChatCopy } from "./chat-copy";

type Msg = { role: "user" | "assistant"; content: string };

const CALENDLY = "https://calendly.com/noeldcosta/30min";
const ADVISORY = "https://erpcv.com/advisory";



/** Render [text](url) links and line breaks from assistant text; everything else stays plain text. */
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]{1,120})\]\(((?:https?:\/\/|\/)[^\s)]{1,300})\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const href = m[2];
    const external = href.startsWith("http") && !href.startsWith("https://noeldcosta.com");
    parts.push(
      <a key={k++} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts.map((p, i) => (typeof p === "string" ? p.split("\n").flatMap((line, j) => (j ? [<br key={`${i}-${j}`} />, line] : [line])) : p))}</>;
}

export default function ChatWidget({ copy, locale = "en" }: { copy: ChatCopy; locale?: string }) {
  const GREETING: Msg = { role: "assistant", content: copy.greeting };
  const id = useId();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"chat" | "book" | "booked">("chat");
  const [messages, setMessages] = useState<Msg[]>(() => [GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [bookError, setBookError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const [hint, setHint] = useState(false);

  // Show the prompt bubble a moment after load, unless dismissed earlier in this visit.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem("nd-chat-hint") === "off";
    } catch {
      /* storage unavailable: show the hint */
    }
    if (dismissed) return;
    const t = window.setTimeout(() => setHint(true), 2500);
    return () => window.clearTimeout(t);
  }, []);

  function dismissHint() {
    setHint(false);
    try {
      sessionStorage.setItem("nd-chat-hint", "off");
    } catch {
      /* storage unavailable: hidden for this page only */
    }
  }

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (mode === "book") {
      const form = list.querySelector<HTMLFormElement>("form.book");
      if (form) list.scrollTo({ top: form.offsetTop - 12 });
      form?.querySelector("input")?.focus();
      return;
    }
    list.scrollTo({ top: list.scrollHeight });
  }, [messages, mode, busy]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        launcherRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1), page: window.location.pathname, locale }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string };
      setMessages([...next, { role: "assistant", content: data.reply || copy.error }]);
    } catch {
      setMessages([...next, { role: "assistant", content: `${copy.networkBook} [${copy.bookLink}](${CALENDLY}).` }]);
    } finally {
      setBusy(false);
    }
  }

  async function book(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setBookError("");
    try {
      const res = await fetch("/api/meeting/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          email: f.get("email"),
          company: f.get("company"),
          topic: f.get("topic"),
          preferredTime: f.get("preferredTime"),
          website: f.get("website"),
          page: window.location.pathname,
          source: "chatbot",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; bookingUrl?: string };
      if (res.ok && data.ok) {
        setMode("booked");
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `${copy.thanks} [${copy.chooseSlot}](${data.bookingUrl || CALENDLY}).`,
          },
        ]);
      } else {
        setBookError(data.error || copy.bookError);
      }
    } catch {
      setBookError(copy.bookError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="nd-chat" data-open={open || undefined}>
      {open && (
        <section className="nd-chat-panel" role="dialog" aria-modal="false" aria-labelledby={`${id}-title`}>
          <header>
            <div>
              <h2 id={`${id}-title`}>{copy.title}</h2>
              <p>{copy.disclaimer}</p>
            </div>
            <button
              type="button"
              className="close"
              aria-label={copy.close}
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </header>

          <div className="log" ref={listRef} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <RichText text={m.content} />
              </div>
            ))}
            {busy && mode === "chat" && <div className="msg assistant typing" aria-label={copy.typing}><i /><i /><i /></div>}

            {mode === "chat" && messages.length === 1 && (
              <div className="starters">
                {copy.starters.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {mode === "book" && (
              <form className="book" onSubmit={book}>
                <p className="lead">{copy.bookLead}</p>
                <label>
                  {copy.name}
                  <input name="name" required maxLength={120} autoComplete="name" />
                </label>
                <label>
                  {copy.email}
                  <input name="email" type="email" required maxLength={254} autoComplete="email" />
                </label>
                <label>
                  {copy.organisation}
                  <input name="company" maxLength={160} autoComplete="organization" />
                </label>
                <label>
                  {copy.topic}
                  <input name="topic" maxLength={160} placeholder={copy.topicExample} />
                </label>
                <label>
                  {copy.preferred}
                  <input name="preferredTime" maxLength={160} />
                </label>
                <div aria-hidden="true" className="nd-hp">
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </div>
                {bookError && <p className="err" role="alert">{bookError}</p>}
                <div className="row">
                  <button className="nd-btn nd-btn-primary" type="submit" disabled={busy}>
                    {busy ? copy.sending : copy.request}
                  </button>
                  <button type="button" className="nd-btn nd-btn-secondary" onClick={() => setMode("chat")}>
                    {copy.back}
                  </button>
                </div>
                <p className="fine">
                  {copy.bookFine}{" "}
                  <a href={CALENDLY} target="_blank" rel="noopener noreferrer">
                    {copy.calendar}
                  </a>
                  . <a href={ADVISORY} target="_blank" rel="noopener noreferrer">{copy.careerPaid}</a>
                </p>
              </form>
            )}
          </div>

          {mode !== "book" && (
            <div className="actions">
              <button type="button" className="chip" onClick={() => setMode("book")}>
                {copy.bookCall}
              </button>
              <a className="chip" href={ADVISORY} target="_blank" rel="noopener noreferrer">
                {copy.careerPaid}
              </a>
            </div>
          )}

          {mode !== "book" && (
            <form
              className="compose"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <label className="sr-only" htmlFor={`${id}-input`}>
                {copy.question}
              </label>
              <textarea
                id={`${id}-input`}
                ref={inputRef}
                rows={1}
                value={input}
                maxLength={1500}
                placeholder={copy.placeholder}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button type="submit" className="send" aria-label={copy.send} disabled={busy || !input.trim()}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}
        </section>
      )}

      <div className="nd-chat-dock">
        {/* A one-line prompt beside the launcher, until the visitor opens the
            chat or dismisses it (remembered for the visit). */}
        {hint && !open && (
          <div className="nd-chat-hint">
            <button type="button" className="text" onClick={() => {
                setOpen(true);
                dismissHint();
              }}>
              {copy.hint}
            </button>
            <button type="button" className="x" aria-label={copy.dismiss} onClick={dismissHint}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}
        <button
          ref={launcherRef}
          type="button"
          className="nd-chat-launcher"
          aria-expanded={open}
          aria-label={open ? copy.close : copy.open}
          title={copy.launcher}
          onClick={() => {
            setOpen((o) => !o);
            if (hint) dismissHint();
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/nd-monogram-on-dark.svg" alt="" width={34} height={21} />
        </button>
      </div>
    </div>
  );
}
