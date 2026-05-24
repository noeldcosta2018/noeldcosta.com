# Audit 1. Mobile responsiveness

Read CLAUDE.md and AGENTS.md first. Then come back here.

Goal. Audit every component and page for mobile responsiveness. Report issues. Don't fix anything in this pass.

## Ground rules

- Don't change any URLs. Ever. They map 1:1 to WordPress URLs in Google Search Console. Any URL change breaks SEO.
- Don't refactor components. This is a read-only audit.
- Report findings with file path and line number where relevant.
- Severity for every finding. Critical, high, medium, low.
- If you can run Playwright or a headless browser via MCP, do it. Test at 375px, 414px, and 768px. If you can't, do this as a careful code review.

## What to check

### Breakpoint strategy

- Open Tailwind config (or check default Tailwind breakpoints if there's no custom config).
- List the breakpoints actually used across the codebase.
- Identify any components that have zero responsive classes (no sm:, md:, lg:). These are suspects.

### Layout issues

For each component in `src/components/` and each page in `src/app/[lang]/`, check:

- No horizontal scroll at 375px width.
- Containers respect viewport. No `w-[1200px]` style absolutes.
- Padding scales down. `px-4 md:px-8` pattern, not `px-16` everywhere.
- Flex and grid layouts collapse properly. `flex-col md:flex-row`, `grid-cols-1 md:grid-cols-3`.
- Fixed heights don't break when content reflows.

### Typography on mobile

- Body text minimum 16px on mobile. Smaller is hard to read.
- Heading sizes scale down. An h1 at 64px on a 375px screen is too big.
- Line height adjusted on mobile for readability.
- No text truncation or overflow.

### Touch targets

- Buttons and links at least 44x44px (Apple HIG minimum).
- Adequate spacing between tappable items. Minimum 8px.
- Nav links big enough for thumb tapping.
- Form inputs full-width on mobile, easy to tap.

### Specific components to inspect carefully

These are the highest-risk ones. Check each one specifically:

- `Hero.tsx`. Big text and CTAs. Does it stack right? Is the headline readable at 375px?
- `Nav.tsx`. Mobile menu. Does hamburger work? Does it close cleanly?
- `LogoScroll.tsx` and `Ticker.tsx`. Animations on narrow screens. Do they cause horizontal scroll?
- `ProblemStats.tsx`. Stat cards. Single column on mobile?
- `Services.tsx`. Multi-column collapses to single?
- `TrackRecord.tsx`. Case study cards. How do they stack?
- `HowIWork.tsx`. Process steps. Do they wrap or scroll?
- `WhatIBelieve.tsx`. Long text blocks. Do they read well?
- `AICapabilities.tsx`. Capability cards. Layout on mobile?
- `Tools.tsx`. Tool cards. Image plus text. Does it work?
- `Testimonials.tsx`. Quote cards. Long text on narrow screens.
- `Credentials.tsx`. Logo and text combinations.
- `YouTubeSection.tsx`. Video embed. Aspect ratio preserved?
- `CTABanner.tsx`. CTA visible and tappable on mobile?
- `Footer.tsx`. Multiple link columns. How do they stack?
- `PostPage.tsx`. Blog post layout. Reading width. Typography.
- `CategoryPage.tsx`. Post listings.
- `BrandWordmark.tsx`. Does it render at all sizes?

### Images and media

- All images use next/image with sizes prop or responsive w-full h-auto.
- No fixed aspect ratios that break on mobile.
- YouTube embeds wrapped in aspect-ratio container.
- Background images that need to crop properly on mobile.

### Tables

- Find any HTML tables in the codebase.
- Confirm each has a mobile strategy. Horizontal scroll or stacked rows.
- Tables that overflow without scroll are a common failure.

### Forms

- Check the contact form (`contact-noel-erp-support` route).
- Input fields full-width on mobile.
- Labels above inputs, not beside.
- Inputs use correct type attributes (`type="email"`, `type="tel"`).
- Submit buttons full-width on mobile.

## Output format

Save findings to `_docs/audits/mobile-audit-YYYY-MM-DD.md`.

Group findings by severity. Critical first.

For each finding include:

- Component name and file path.
- Line number where relevant.
- Breakpoint at which it breaks. Or "all breakpoints" if it's a base issue.
- What breaks. One sentence.
- Suggested fix. One line.

At the end:

- Total counts by severity.
- Top 5 fixes ranked by impact.
- Anything you couldn't check without running the browser.

Don't fix anything in this pass. Report only.
