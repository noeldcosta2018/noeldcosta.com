# H-12 — YouTube section brief

A live block that pulls Noel's latest videos from the YouTube RSS feed and displays them in a horizontal carousel. Ends with a "Subscribe on YouTube" button.

---

## Purpose

- Show that the brand is active, not dormant. New videos every few weeks.
- Let the buyer (and the consultant audience) watch one without leaving the page.
- Use the YouTube channel as social proof — the carousel format implies "there are more than fit."
- Direct subscribers to the channel for the long tail.

---

## Buyer alignment

Per BUYER-CEO.md, YouTube content is "consumed after they decide to engage" — not a first-visit priority. So this section lives lower on the page, not in the scan band. Its job is to keep the buyer warm if they want to validate the voice before booking.

For the consultant audience the section is more central — many of them came from YouTube originally. The carousel format gives them a quick way to find another video.

---

## Acceptance criteria

- [ ] Eyebrow reads "[ 05 · Watch & learn ]".
- [ ] Headline reads "Videos from the field. Not theory. Real projects." with the second sentence in `cc-emphasis-italic`.
- [ ] Sub reads "I share what I've learned from 25 years of ERP and AI implementations. The stuff nobody tells you."
- [ ] Pulls up to 15 videos via `getYouTubeVideos(15)` from `src/lib/youtube.ts` (RSS feed).
- [ ] Renders `VideoCarousel` with the fetched array.
- [ ] CTA button reads "Subscribe on YouTube" with the inline YouTube glyph.
- [ ] CTA links to `https://www.youtube.com/@NoelDCostaERPAI`, opens in new tab.
- [ ] Section is an async server component (`export default async function`). Data fetched at build / request time.
- [ ] If the RSS feed fails or returns zero items, the carousel still renders without errors (handled inside `VideoCarousel`).

---

## Copy specification

### Eyebrow

```
[ 05 · Watch & learn ]
```

### Headline

```
Videos from the field. Not theory. Real projects.
```

Split: `Videos from the field.` normal, `Not theory. Real projects.` in `cc-emphasis-italic`.

### Sub

```
I share what I've learned from 25 years of ERP and AI implementations. The stuff nobody tells you.
```

### CTA

```
Subscribe on YouTube
```

YouTube glyph (inline SVG) sits to the left of the label.
Href: `https://www.youtube.com/@NoelDCostaERPAI`
`target="_blank" rel="noopener noreferrer"`

---

## Layout

### Desktop / tablet / mobile

Single content column inside `max-w-[1200px]`. Eyebrow, headline, sub, then the carousel, then the CTA row. The carousel handles its own internal horizontal scroll on smaller widths. Section padding is the standard `clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)`.

---

## Design tokens used

| Element | Token / class |
|---|---|
| Section background | `bg-cream` |
| Eyebrow | `text-papaya`, `font-mono` |
| Headline | `text-corbeau` |
| Headline emphasis | `cc-emphasis-italic` |
| Sub body | `text-night` |
| CTA bg | `bg-corbeau`, hover `bg-[#1a1c30]` |
| CTA text | `text-bone` |
| CTA hover lift | `hover:-translate-y-px` |

---

## Out of scope

- An embedded player on the page. Each card links out to YouTube (handled by `VideoCarousel`).
- A search or filter UI for the channel.
- A "latest blog post" combined feed.
- A newsletter signup beside the YouTube CTA. Newsletter is deferred — see PRD Out of scope.
- Pagination beyond the first 15 videos.

---

## Component reference

File: `src/components/YouTubeSection.tsx`

Companion files:
- `src/lib/youtube.ts` — `getYouTubeVideos(n)` fetches and parses the channel RSS
- `src/components/VideoCarousel.tsx` — renders the horizontal scroll carousel

Key bits:
- Async server component
- `getYouTubeVideos(15)` returns up to 15 videos
- CTA button uses raw inline SVG for the YouTube glyph (no lucide dependency)
