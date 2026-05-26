/**
 * The five opinions Noel defends in print. Single canonical source for
 * the homepage WhatIBelieve.tsx section AND the about-page MDX
 * <beliefs-grid /> include (rendered by BeliefsGrid.tsx). Block 6b
 * consolidated the two previously-divergent copies onto this file.
 *
 * Voice: formal, no contractions. Matches BRAND.md ("What I believe"
 * section) and VOICE.md ("First person. Direct. Short sentences.").
 * Specifically: "what is broken" not "what's broken"; "should not" not
 * "shouldn't"; "per day" not "/day"; "3-year roadmap" with numerals;
 * "finance close" in the headline of belief 05.
 *
 * Used by BeliefsGrid to render a 5-card layout matching the home
 * page's Credentials/AICapabilities card shell — numbered papaya
 * tile, bold title, body paragraph, hover-lift. No new tokens.
 */

export interface Belief {
  num: string;
  title: string;
  body: string;
}

export const BELIEFS: Belief[] = [
  {
    num: "01",
    title: "Start with processes, not systems.",
    body:
      "Most ERP failures begin in the wrong order. Buy the system, then try to fit your business into it. The conversation should run the other way. Map your processes first. Decide what is broken, what is worth keeping, what needs to change. Then talk about systems. Every greenfield-vs-brownfield debate I have watched go sideways started without this step.",
  },
  {
    num: "02",
    title: "Your SI should not be the one writing your business case.",
    body:
      "You need an expert who is not selling the implementation to write the case for it. That is how $40M programmes become $90M without anyone noticing. The SI incentive is to start. Yours is to finish. Different jobs.",
  },
  {
    num: "03",
    title: "AI on ERP is real now, and it is moving fast.",
    body:
      "Joule is growing by the day. The agentic use cases on BTP are no longer slideware. If your last look at AI-on-SAP was 12 months ago, look again. The board-deck version is over. The shipping version is here. Ignore it and you are on the wrong side of the next two years.",
  },
  {
    num: "04",
    title: "The cheapest consultant is the most expensive one.",
    body:
      "Day rate is the smallest variable in total programme cost. A senior advisor at $2,500 per day who saves you a six-month overrun is cheaper than a $900 per day team that does not. Most CFOs work this out only after the second post-mortem.",
  },
  {
    num: "05",
    title: "Walk if a vendor proposes a 3-year roadmap before understanding your finance close.",
    body:
      "The close is where the real complexity lives. Vendors who skip it are selling a roadmap, not solving a problem. Anyone serious wants to see your close cycle, your reconciliations, and your manual workarounds before they propose anything.",
  },
];
