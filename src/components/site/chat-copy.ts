import type { Locale } from "@/lib/locales";
import { translator } from "@/i18n";

/** Translated text for the client-side chat widget (server only). */
export type ChatCopy = {
  greeting: string;
  starters: string[];
  title: string;
  disclaimer: string;
  close: string;
  open: string;
  launcher: string;
  hint: string;
  dismiss: string;
  bookCall: string;
  careerPaid: string;
  placeholder: string;
  question: string;
  send: string;
  typing: string;
  bookLead: string;
  name: string;
  email: string;
  organisation: string;
  topic: string;
  topicExample: string;
  preferred: string;
  request: string;
  sending: string;
  back: string;
  bookFine: string;
  calendar: string;
  thanks: string;
  chooseSlot: string;
  error: string;
  bookError: string;
  networkBook: string;
  bookLink: string;
};

export function chatCopy(locale: Locale | undefined): ChatCopy {
  const tr = translator(locale);
  return {
    greeting: tr(
      "Hi, I'm the assistant on Noel's site. Ask me about SAP, ERP, data or AI programmes, or book a free 30-minute intro call with Noel. For personal career advice, Noel offers paid sessions on [ERPCV](https://erpcv.com/advisory).",
    ),
    starters: [
      tr("What does Noel help with?"),
      tr("How long does an ECC to S/4HANA migration take?"),
      tr("Where should we start with AI?"),
    ],
    title: tr("Ask about your project"),
    disclaimer: tr("AI assistant on Noel's site. It can make mistakes; for decisions, book a call."),
    close: tr("Close chat"),
    open: tr("Open chat: ask about your project"),
    launcher: tr("Ask Noel's assistant"),
    hint: tr("Need help? Just ask."),
    dismiss: tr("Dismiss"),
    bookCall: tr("Book an intro call"),
    careerPaid: tr("Career advice (paid)"),
    placeholder: tr("Ask a question…"),
    question: tr("Your question"),
    send: tr("Send"),
    typing: tr("Assistant is typing"),
    bookLead: tr("Free 30-minute intro call with Noel. Tell him a little about it."),
    name: tr("Name"),
    email: tr("Work email"),
    organisation: tr("Organisation"),
    topic: tr("What would you like to discuss?"),
    topicExample: tr("e.g. S/4HANA migration plan"),
    preferred: tr("Preferred days or times (optional)"),
    request: tr("Request the call"),
    sending: tr("Sending…"),
    back: tr("Back"),
    bookFine: tr("Or pick a slot straight away:"),
    calendar: tr("calendar"),
    thanks: tr("Thanks. Noel has your request. Pick a time that suits you here:"),
    chooseSlot: tr("choose a slot"),
    error: tr("Sorry, something went wrong. Please try again."),
    bookError: tr("Something went wrong. Please use the booking link below."),
    networkBook: tr("Network problem. You can book a call directly:"),
    bookLink: tr("book an intro call"),
  };
}
