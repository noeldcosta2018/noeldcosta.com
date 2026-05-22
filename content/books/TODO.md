# /books — owner punch list before launch

Things that are stubbed, mocked, or placeholder. Walk this list before
the page goes live to a paid traffic source.

## Email service provider

The /api/email/subscribe endpoint is a stub. It validates the email,
waits 800 ms, and console.logs the submission. Nothing is stored,
nothing is sent.

- [ ] Pick an ESP. Likely candidates: ConvertKit, MailerLite, Beehiiv.
- [ ] Create a list or form per book so each subscriber is tagged with
      which title they downloaded.
- [ ] Store the ESP API key in environment variables (do not commit).
- [ ] Replace the stub in `src/app/api/email/subscribe/route.ts` with
      the real API call.
- [ ] Decide whether to use double opt-in. If yes, the confirmation
      email is what carries the download link.

## Stripe

The /api/stripe/create-checkout-session endpoint is a stub. The Stripe
SDK is not installed yet, and the paid book has no real price IDs.

- [ ] Install the Stripe SDK (`npm i stripe`). Confirm with Noel
      before adding the dependency.
- [ ] Create Stripe products and prices for the paid book in three
      tiers: ebook ($9.99), paperback ($19.99), hardcover + ebook ($39.99).
- [ ] Paste each Stripe price ID into the `pricing` block in
      `content/books/sap-career-playbook-ai-era.mdx`, replacing the
      `null` values.
- [ ] Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Vercel
      env vars.
- [ ] Replace the stub in `src/app/api/stripe/create-checkout-session/route.ts`
      with a real `stripe.checkout.sessions.create` call.
- [ ] Build a `/api/stripe/webhook` route for fulfilment + receipt
      email. Decide whether fulfilment is a download link or a
      mailed paperback.
- [ ] Decide success/cancel routes. Suggested: `/books/thanks` and `/books`.

## Cover images

Three of the four books have no cover image yet. The components fall
through to a typographic placeholder when the image file is missing,
so the page is safe to ship without these. But the photographic covers
will lift conversion materially.

- [ ] Design or commission cover for `enterprise-ai-what-works`.
      Save as `/public/books/enterprise-ai-cover.jpg` and add
      `coverImage: /books/enterprise-ai-cover.jpg` to the frontmatter.
- [ ] Design or commission cover for `autonomous-agents-enterprise`.
      Same pattern.
- [ ] Design final cover for `sap-career-playbook-ai-era`. The
      frontmatter already points at `/books/sap-playbook-cover.jpg` —
      drop the file there and the placeholder switches off automatically.
- [ ] Confirm the cover for `sap-careers-200k-ai-era` (the active
      featured book) lands at `/public/books/sap-careers-cover.jpg`.

## Downloads

The `downloadUrl` on the available book points at
`/books/sap-careers-200k-ai-era`, which currently has no file behind
it. The email stub does not actually deliver a PDF.

- [ ] Decide where the PDF will be hosted. Options: same Vercel project,
      S3, ConvertKit attachment, gated download page.
- [ ] If hosting on Vercel, drop the PDF at
      `/public/downloads/sap-careers-200k-ai-era.pdf` and have the
      real ESP send that URL in the confirmation email.
- [ ] Produce an EPUB and host it the same way.

## Analytics

- [ ] Decide whether email signups and checkout starts get tracked.
      The CLAUDE.md rule is "no tracking scripts without asking" — ask
      before adding anything.
- [ ] If yes, instrument the form submit and checkout button click.

## Copy review

- [ ] Noel reads the four MDX files end-to-end before launch. The
      summaries and audience lines were drafted to match VOICE.md but
      have not been through a human pass yet.
- [ ] Confirm the price tier labels on the paid book ("Ebook",
      "Paperback", "Hardcover + ebook") match Noel's intended wording.
- [ ] Confirm the experience dropdown ranges (1-3, 4-7, 8-15, 15+)
      match how Noel wants to segment the audience.

## SEO

- [ ] After launch, confirm `/books` appears in `sitemap.xml` and
      submit the updated sitemap in Search Console.
- [ ] Decide whether each book should have its own detail page (right
      now they all live on `/books` with `#book-{slug}` anchors).
