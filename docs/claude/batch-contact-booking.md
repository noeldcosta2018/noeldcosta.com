# Batch review: contact page booking flow (15 October 2026)

Noel's request: the "Discuss your project" page should start with three or four questions about the project, then a better slot picker, then name and email, then the booking.

## What changed

- `/contact-noel-erp-support/` (all 17 languages): the embedded Calendly widget is replaced by `<booking-flow>`, a four-step flow in the site's own design.
  1. Four questions, one per screen: what they need help with (six options), where they are (five), organisation size (four), and an optional "what would make this call worth your time?".
  2. Slot picker: the next three weeks as day buttons (a dot marks days with free times), times for the chosen day, shown in the visitor's time zone with a selector to change it. On phones the days scroll sideways.
  3. Name, work email, organisation (optional).
  4. Booked: date and time, reschedule and cancel links from Cal.com.
- Bookings go through Cal.com (switched from Calendly on 15 October 2026 at Noel's request): public `GET /v2/slots` and `POST /v2/bookings` for `cal.com/noel-benjamin-dcosta-xay9yo/30min` (event 2113440, Google Meet), the same account ERPCV uses. No API key or paid plan needed. The answers go into the event's notes field. Cal.com sends the invite, reminders and reschedule/cancel emails.
- Every request is also saved to ERPCV3 `nd_meeting_requests` (source `contact`, status `booked` once Cal.com confirms) and the contact to `nd_contacts` (no marketing consent). No schema change.
- Contact hero translated (it was English on every language version) and its line now describes the new flow.
- Interface text translated into 16 languages (57 strings), added to `src/i18n/vocabulary.json`.

## Needs Noel

Cal.com checks only Google (noeldcosta2018@gmail.com) for conflicts; Calendly did the same. Noel wants his DXC Outlook checked too: install Outlook Calendar in Cal.com and sign in with DXC (may need DXC admin approval), or publish the DXC calendar as an ICS link (busy times only) and add it with Cal.com's ICS Feed app, if DXC policy allows. If Cal.com is unreachable, the page offers a link to the Cal.com booking page with the answers prefilled.

## Checks

Types, lint and i18n checker clean (remaining i18n warnings predate this batch). Flow tested on the dev server with mocked slots (desktop, English; phone, German; dark theme) and against live Cal.com free times (335 slots over three weeks, 09:00 to 16:30 Dubai); no real booking was made. No horizontal scroll at 375px. Tests and build: see commit.

Files: `src/lib/cal.ts` (replaces `calendly.ts`), `src/app/api/booking/route.ts`, `src/app/api/booking/slots/route.ts`, `src/components/article/contact/BookingFlow.tsx`, `booking-copy.ts`, `booking-options.ts`, `ContactHero.tsx`, `CalendlyEmbed.tsx` (optional prefilled URL), `MdxBody.tsx`, `nd-articles.css`.
