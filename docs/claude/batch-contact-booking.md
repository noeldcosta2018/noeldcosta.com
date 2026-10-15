# Batch review: contact page booking flow (15 October 2026)

Noel's request: the "Discuss your project" page should start with three or four questions about the project, then a better slot picker, then name and email, then the booking.

## What changed

- `/contact-noel-erp-support/` (all 17 languages): the embedded Calendly widget is replaced by `<booking-flow>`, a four-step flow in the site's own design.
  1. Four questions, one per screen: what they need help with (six options), where they are (five), organisation size (four), and an optional "what would make this call worth your time?".
  2. Slot picker: the next three weeks as day buttons (a dot marks days with free times), times for the chosen day, shown in the visitor's time zone with a selector to change it. On phones the days scroll sideways.
  3. Name, work email, organisation (optional).
  4. Booked: date and time, reschedule and cancel links from Calendly.
- Bookings go through Calendly's Scheduling API (`GET /event_type_available_times`, `POST /invitees`), so Noel's calendar, invites and reminders work as before. The answers are written into the event type's first text question, so they appear in the invite.
- Every request is also saved to ERPCV3 `nd_meeting_requests` (source `contact`, status `booked` once Calendly confirms) and the contact to `nd_contacts` (no marketing consent). No schema change.
- Contact hero translated (it was English on every language version) and its line now describes the new flow.
- Interface text translated into 16 languages (57 strings), added to `src/i18n/vocabulary.json`.

## Needs Noel

The new slot picker only switches on once a Calendly personal access token is set in Vercel as `CALENDLY_TOKEN` (Production). Calendly: Integrations, API and webhooks, Personal access tokens. The Scheduling API needs a paid Calendly plan. Optional `CALENDLY_EVENT_TYPE` pins the event type; otherwise the event whose link ends in `/30min` is used.

Until the token is set, the flow still asks the four questions and then shows the Calendly widget with the answers prefilled (Calendly field a1). In that mode the request is not saved to the database; Calendly holds it.

## Checks

Types, lint and i18n checker clean (remaining i18n warnings predate this batch). Flow tested on the dev server with mocked slots (desktop, English; phone, German; dark theme) and with the real fallback (no token). No horizontal scroll at 375px. Tests and build: see commit.

Files: `src/lib/calendly.ts`, `src/app/api/booking/route.ts`, `src/app/api/booking/slots/route.ts`, `src/components/article/contact/BookingFlow.tsx`, `booking-copy.ts`, `booking-options.ts`, `ContactHero.tsx`, `CalendlyEmbed.tsx` (optional prefilled URL), `MdxBody.tsx`, `nd-articles.css`.
