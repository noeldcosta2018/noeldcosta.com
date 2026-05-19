/**
 * Six programmes referenced in "Programmes that taught me how this
 * actually goes" on the story page. Sector / region / badge are
 * derived from the existing story prose — no invented client names.
 *
 * Body copy preserved verbatim from the source MDX (per the rule:
 * voice is intentional, do not rewrite body copy).
 */

export interface Programme {
  sectorRegion: string; // mono uppercase tag, e.g. "PUBLIC SECTOR · TELECOM"
  badge: string; // short categorisation, e.g. "RECOVERY"
  badgeType: "p" | "g" | "c"; // matches TrackRecord palette: papaya / green / canyon
  title: string;
  body: string[]; // one or two paragraphs
}

export const PROGRAMMES: Programme[] = [
  {
    sectorRegion: "SUPPLY CHAIN · DUBAI",
    badge: "RECOVERY",
    badgeType: "c",
    title: "The 2am call from Dubai",
    body: [
      "A Supply Chain Manager I'd worked with before phoned me at 2am. I was half asleep. His SAP system had crashed and his warehouse team were writing orders on paper. In 2023.",
      "The consultant before me had set it up wrong. I'm still not sure how they managed it. Two weeks of effectively starting over. The CEO aged five years in that fortnight. The system works now. The lesson was about who you let near your core build, not about SAP.",
    ],
  },
  {
    sectorRegion: "RETAIL · GCC",
    badge: "LEGACY REPLACEMENT",
    badgeType: "p",
    title: "The retail chain restarting every Friday",
    body: [
      "I walked into a retail office last year. Their inventory system was so old they had to restart it every Friday or it would crash on its own by Monday. Not exaggerating. The owner pulled out an Excel sheet where he manually tracked stock across 50 stores. I think I made a face, because he started defending it before I'd said a word.",
      "His competition was running machine-learning forecasts while he was counting boxes. We got him sorted. He waited about three years longer than he should have.",
    ],
  },
  {
    sectorRegion: "PUBLIC SECTOR · TELECOM",
    badge: "S/4HANA BUILD",
    badgeType: "g",
    title: "The S/4HANA telecom programme",
    body: [
      "Public-sector telecom. They needed better financial reporting. Every small decision required a committee meeting. What takes two weeks in private sector took three months here. I complained about it to my wife every night for a quarter.",
      "But when we finished, they had something that worked properly. Not a Band-Aid. A real reporting platform. Government programmes test your patience and pay you back in durability.",
    ],
  },
  {
    sectorRegion: "PUBLIC SECTOR · AVIATION",
    badge: "DATA PLATFORM",
    badgeType: "p",
    title: "The aviation data warehouse",
    body: [
      "Same pattern. Slow start. Heavy governance. Many stakeholders. The final architecture was cleaner than anything I'd have negotiated through in the private sector at the same scale. There's a version of public-sector work where the constraints produce better engineering because nobody can shortcut their way past them.",
    ],
  },
  {
    sectorRegion: "RETAIL · RIYADH",
    badge: "AI ON ERP",
    badgeType: "g",
    title: "The Riyadh retail AI inventory project",
    body: [
      "Retail chain in Riyadh. Their inventory was a mess. We built something that learns from sales patterns and adjusts stock automatically. Still has quirks. Beats having a buyer guess what to reorder every week. This is what I mean about AI on ERP: it earns its keep when the underlying master data is clean enough to trust.",
    ],
  },
  {
    sectorRegion: "GOVERNMENT · CITIZEN SERVICES",
    badge: "AGENTIC AI",
    badgeType: "g",
    title: "The government chatbot that actually helped",
    body: [
      "A government agency drowning in citizen complaints. We built triage that handles the simple cases and routes the complicated ones to real people. The staff loved it. They could solve actual problems instead of answering the same five questions for the hundredth time that morning. The point of AI here wasn't to remove humans. It was to stop wasting their time on work that didn't need a human.",
    ],
  },
];
