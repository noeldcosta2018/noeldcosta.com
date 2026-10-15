import type { Locale } from "@/lib/locales";
import { translator } from "@/i18n";
import { NEED_LABELS, SIZE_LABELS, STAGE_LABELS } from "./booking-options";

/** Translated text for the contact page's booking flow (server only). */
export type BookingCopy = ReturnType<typeof bookingCopy>;

export function bookingCopy(locale: Locale | undefined) {
  const tr = translator(locale);
  const options = (labels: Record<string, string>) =>
    Object.entries(labels).map(([value, label]) => ({ value, label: tr(label) }));
  return {
    steps: [tr("Your project"), tr("Pick a time"), tr("Your details"), tr("Booked")],
    stepOf: tr("Step {n} of {total}"),
    qNeed: tr("What do you need help with?"),
    qStage: tr("Where are you now?"),
    qSize: tr("How big is the organisation?"),
    qGoal: tr("What would make this call worth your time?"),
    goalHint: tr("Optional. One or two lines is plenty."),
    goalPlaceholder: tr("e.g. A second opinion on our migration plan before the board meeting"),
    needs: options(NEED_LABELS),
    stages: options(STAGE_LABELS),
    sizes: options(SIZE_LABELS),
    next: tr("Continue"),
    skip: tr("Skip"),
    back: tr("Back"),
    pickTitle: tr("Pick a time for a 30-minute call"),
    timesIn: tr("Times shown in"),
    loadingTimes: tr("Loading free times…"),
    noTimes: tr("No free times on this day."),
    noDays: tr("No free times in the next three weeks. Please email me instead."),
    loadError: tr("The calendar did not load."),
    useCalendar: tr("Open the calendar instead"),
    detailsTitle: tr("Where should I send the invite?"),
    name: tr("Your name"),
    email: tr("Work email"),
    company: tr("Organisation (optional)"),
    change: tr("Change"),
    book: tr("Book the call"),
    booking: tr("Booking…"),
    privacy: tr("Your details are used only to arrange this call."),
    doneTitle: tr("You're booked."),
    doneBody: tr("A calendar invite is on its way to {email}."),
    reschedule: tr("Reschedule"),
    cancel: tr("Cancel"),
    doneEmail: tr("Need to reach me before then? Email solutions@noeldcosta.com."),
    fallbackTitle: tr("Pick a slot on my calendar"),
    fallbackBody: tr("Your answers are already filled in."),
    errName: tr("Please add your name."),
    errEmail: tr("Please check your email address."),
    errSlot: tr("That time was just taken. Please pick another."),
    errRate: tr("Too many attempts. Please try again later."),
    errGeneric: tr("Something went wrong. Please try again, or use the calendar."),
    minutes: tr("30 minutes"),
  };
}
