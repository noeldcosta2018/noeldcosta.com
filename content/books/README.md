# content/books/

One MDX file per book. The /books page reads from this directory through
`src/lib/books.ts` and renders the catalogue.

## Adding a book

1. Pick a slug. Use kebab-case. The slug is the filename minus `.mdx`,
   and is also what shows up in the in-page anchor (`#book-{slug}`).
   Do not prefix with `book-N-` — the order field handles sorting.

2. Copy an existing file as a template. For a free book, start from
   `enterprise-ai-what-works.mdx`. For a paid book, start from
   `sap-career-playbook-ai-era.mdx`.

3. Fill in the frontmatter. The exact shape is enforced by
   `src/types/book.ts`. Required fields: `slug`, `title`, `summary`,
   `audience`, `whatsInside`, `status`, `kind`, `order`, `coverColor`,
   `accentColor`.

4. If a cover image exists, drop it under `/public/books/` and set
   `coverImage: /books/your-cover.jpg`. The components check the file
   on disk and fall through to the typographic placeholder if it
   is missing, so a frontmatter path with no file on disk is safe.

5. Only one book should have `featured: true`. That one gets the
   larger FeaturedBook treatment at the top of the page.

6. Books with `kind: paid` must include a `pricing` block. Each tier
   (`ebook`, `paperback`, `hardcoverBundle`) needs `stripeId`, `amount`,
   `label`. Set `stripeId: null` until the real Stripe price IDs exist;
   the checkout endpoint is stubbed and accepts null.

## Notes for the writer

- Title and subtitle are sentence case. No Title Case.
- The summary appears on the card and at the top of the book panel.
  Keep it to two sentences.
- `whatsInside` is a numbered list in the UI (bullets are reserved for
  two-item juxtapositions per blog-editor.md). Aim for 4 to 6 items.
- For coming-soon books, an empty `whatsInside: []` is fine. The card
  hides the list when empty.
- Voice rules from VOICE.md apply: first person, no em-dash drama,
  no buzzword stack.

## Frontmatter reference

See `src/types/book.ts` for the full TypeScript shape. Every field is
documented inline.
