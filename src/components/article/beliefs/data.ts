/**
 * The five opinions Noel defends in print. Source: BRAND.md
 * ("What I believe" section). Body copy preserved verbatim so the
 * voice stays unchanged.
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
      "Most ERP failures begin in the wrong order. Buy the system, then try to fit your business into it. The conversation should run the other way. Map your processes first. Decide what's broken, what's worth keeping, what needs to change. Then talk about systems. Every greenfield-versus-brownfield debate I've watched go sideways started without this step.",
  },
  {
    num: "02",
    title: "Your SI shouldn't be the one writing your business case.",
    body:
      "You need an expert who isn't selling the implementation to write the case for it. That's how $40M programmes become $90M without anyone noticing. The SI's incentive is to start. Yours is to finish. Different jobs.",
  },
  {
    num: "03",
    title: "AI on ERP is real now, and it's moving fast.",
    body:
      "Joule is growing by the day. Agentic use cases on BTP are no longer slideware. If your last look at AI-on-SAP was 12 months ago, look again. The board-deck version is over. The shipping version is here. Ignore it and you're on the wrong side of the next two years.",
  },
  {
    num: "04",
    title: "The cheapest consultant is the most expensive one.",
    body:
      "Day rate is the smallest variable in total programme cost. A senior advisor at $2,500/day who saves you a six-month overrun is cheaper than a $900/day team that doesn't. Most CFOs work this out only after the second post-mortem.",
  },
  {
    num: "05",
    title: "Walk if a vendor proposes a three-year roadmap before understanding your close.",
    body:
      "The finance close is where the real complexity lives. Vendors who skip it are selling a roadmap, not solving a problem. Anyone serious wants to see your close cycle, your reconciliations, and your manual workarounds before they propose anything.",
  },
];
