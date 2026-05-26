// Single source of truth for the three book-page accordion questions
// (Who is this for?, What will you get from this book?, How do I access
// this?). Consumers:
//   - src/components/books/BookCard.tsx — per-book accordion (questions
//     paired with the book's `details` answers)
//   - src/app/(site-en)/books/page.tsx — FAQPage JSON-LD emission for
//     the books index
// Block 6c will translate these strings against this single source so
// the on-page accordion and the schema markup stay in lockstep.
export const BOOK_ACCORDION_QUESTIONS = [
  "Who is this for?",
  "What will you get from this book?",
  "How do I access this?",
] as const;

export type BookAccordionQuestion = (typeof BOOK_ACCORDION_QUESTIONS)[number];
