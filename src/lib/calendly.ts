// Server-only Calendly client for the on-site booking flow on the contact page.
//
// Free slots come from GET /event_type_available_times and bookings are made
// with POST /invitees (Calendly Scheduling API, paid plan). Calendly still
// sends the invite, reminders and reschedule/cancel links, so Noel's calendar
// works as before. Needs CALENDLY_TOKEN (a personal access token); without it
// the contact page falls back to the embedded Calendly widget.
//
// Optional CALENDLY_EVENT_TYPE pins the event type URI; otherwise the event
// whose booking page ends in /30min (the site's intro call) is used.

const API = "https://api.calendly.com";
const SLUG = "/30min";
const DAY = 24 * 60 * 60 * 1000;

type Question = { name: string; type: string; position: number; enabled: boolean; required: boolean };
type Location = { kind: string; location?: string };
type EventType = { uri: string; schedulingUrl: string; duration: number; questions: Question[]; locations: Location[] };

let cachedEventType: { value: EventType; at: number } | null = null;

export function calendlyConfigured(): boolean {
  return !!process.env.CALENDLY_TOKEN;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path.startsWith("http") ? path : API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.CALENDLY_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Calendly ${res.status}: ${detail.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

/** The intro-call event type, cached for an hour. */
export async function eventType(): Promise<EventType> {
  if (cachedEventType && Date.now() - cachedEventType.at < 60 * 60 * 1000) return cachedEventType.value;
  let resource: Record<string, unknown>;
  const pinned = process.env.CALENDLY_EVENT_TYPE;
  if (pinned) {
    resource = (await call<{ resource: Record<string, unknown> }>(pinned)).resource;
  } else {
    const me = await call<{ resource: { uri: string } }>("/users/me");
    const list = await call<{ collection: Record<string, unknown>[] }>(
      `/event_types?user=${encodeURIComponent(me.resource.uri)}&active=true&count=100`,
    );
    const match = list.collection.find((e) => String(e.scheduling_url ?? "").endsWith(SLUG)) ?? list.collection[0];
    if (!match) throw new Error("Calendly: no active event type");
    resource = match;
  }
  const value: EventType = {
    uri: String(resource.uri),
    schedulingUrl: String(resource.scheduling_url ?? ""),
    duration: Number(resource.duration ?? 30),
    questions: ((resource.custom_questions as Question[] | undefined) ?? []).filter((q) => q.enabled),
    locations: (resource.locations as Location[] | undefined) ?? [],
  };
  cachedEventType = { value, at: Date.now() };
  return value;
}

/** Available start times (UTC ISO strings) over the next `days` days. */
export async function availableSlots(days: number): Promise<string[]> {
  const type = await eventType();
  // Calendly rejects a start in the past; ask in windows of seven days.
  const first = Date.now() + 5 * 60 * 1000;
  const last = first + days * DAY;
  const slots: string[] = [];
  for (let from = first; from < last; from += 7 * DAY) {
    const to = Math.min(from + 7 * DAY, last);
    const qs = new URLSearchParams({
      event_type: type.uri,
      start_time: new Date(from).toISOString(),
      end_time: new Date(to).toISOString(),
    });
    const page = await call<{ collection: { status: string; start_time: string }[] }>(`/event_type_available_times?${qs}`);
    for (const s of page.collection) if (s.status === "available") slots.push(s.start_time);
  }
  return Array.from(new Set(slots)).sort();
}

export type BookingResult = { cancelUrl: string | null; rescheduleUrl: string | null };

/**
 * Books the slot. The visitor's answers go into the event type's first text
 * question so Noel sees them in the invite; other required questions get the
 * same summary so the booking is not rejected.
 */
export async function bookSlot(input: {
  startTime: string;
  name: string;
  email: string;
  timezone: string;
  summary: string;
}): Promise<BookingResult> {
  const type = await eventType();
  const textQuestions = type.questions.filter((q) => q.type === "text" || q.type === "string");
  const answerFor = new Set<Question>();
  if (textQuestions[0]) answerFor.add(textQuestions[0]);
  for (const q of type.questions) if (q.required) answerFor.add(q);
  const location = type.locations[0];

  const body: Record<string, unknown> = {
    event_type: type.uri,
    start_time: input.startTime,
    invitee: { name: input.name, email: input.email, timezone: input.timezone },
    questions_and_answers: Array.from(answerFor).map((q) => ({
      question: q.name,
      answer: input.summary.slice(0, 1000),
      position: q.position,
    })),
    tracking: { utm_source: "noeldcosta.com", utm_medium: "contact-page" },
  };
  if (location) body.location = location.location ? { kind: location.kind, location: location.location } : { kind: location.kind };

  const res = await call<{ resource: { cancel_url?: string; reschedule_url?: string } }>("/invitees", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return { cancelUrl: res.resource?.cancel_url ?? null, rescheduleUrl: res.resource?.reschedule_url ?? null };
}
