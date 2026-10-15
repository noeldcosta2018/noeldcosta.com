// Answer options for the contact page's opening questions. Keys travel to
// /api/booking; the English labels are what Noel sees in the invite and the
// admin table. booking-copy.ts translates the labels for the page.

export const NEED_LABELS: Record<string, string> = {
  implementation: "SAP or ERP implementation",
  migration: "S/4HANA migration",
  recovery: "A programme in trouble",
  partner: "Partner selection or contract review",
  data: "Data and AI",
  other: "Something else",
};

export const STAGE_LABELS: Record<string, string> = {
  exploring: "Exploring options",
  choosing: "Choosing a partner or system",
  design: "In design",
  building: "Mid-implementation",
  live: "Live and fixing issues",
};

export const SIZE_LABELS: Record<string, string> = {
  s: "Under 200 staff",
  m: "200 to 1,000 staff",
  l: "1,000 to 10,000 staff",
  xl: "Over 10,000 staff",
};
