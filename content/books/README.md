# content/books/

One MDX file per book. The /books page reads from this directory through
`src/lib/books.ts` and renders the two-section catalogue (Free, Paid).

## Adding a book

1. Pick a slug. Use kebab-case. The slug is the filename minus `.mdx`
   and is also the storage object name (`<slug>.pdf` inside the
   `book-files` bucket on Supabase).

2. Copy an existing file as a template.
   - Free book: start from `enterprise-ai-what-works.mdx`.
   - Paid book: start from `sap-career-playbook-ai-era.mdx`.

3. Fill in the frontmatter. The exact shape is enforced by
   `src/types/book.ts`. Required: `slug`, `title`, `status`, `kind`,
   `order`, `coverColor`, `accentColor`, `details` (three keys).

4. If a cover image exists, drop it under `/public/books/covers/` and
   set `coverImage: /books/covers/<slug>.jpg`. The page checks the file
   on disk and falls back to the typographic placeholder if it is missing.

5. Upload the PDF to the private Supabase Storage bucket `book-files`
   with the object name `<slug>.pdf`. The API route signs a short URL
   to that object when a free-book lead is captured.

6. Paid books require a `price` (USD number). `stripeId` stays `null`
   until Stripe is wired.

## Frontmatter reference

See `src/types/book.ts` for the TypeScript shape. The three accordion
detail fields are:

- `whoFor` — Who is this for?
- `whatYouGet` — What will you get from this book?
- `howToAccess` — How do I access this?

Each is one short sentence. No paragraphs.

## Voice

Voice rules from VOICE.md apply: first person, no em-dash drama, no
banned buzzwords, no "coming soon" / "early access" / "available soon".
