import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CAREER_CALL_URL, CONSULTING_CAL_URL, consultingBookingUrl } from "./call-intake";

// One booking system (Noel, 17 November 2026): every call goes through /book-a-call/, career calls
// are paid on erpcv.com, consulting calls are free on Cal.com, and Calendly is gone from the site.
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|mdx)$/.test(p) ? [p] : [];
  });

describe("call intake", () => {
  it("sends career calls to the paid ERPCV booking and consulting to the free Cal.com event", () => {
    expect(CAREER_CALL_URL).toBe("https://erpcv.com/advisory/request?topic=general");
    expect(CONSULTING_CAL_URL).toBe("https://cal.com/noel-benjamin-dcosta-xay9yo/business-consulting-call");
  });

  it("fills the visitor's name, email and answers into the consulting booking", () => {
    const url = new URL(consultingBookingUrl(CONSULTING_CAL_URL, { name: "Alex Morgan", email: "alex@example.test", intent: "Our S/4HANA cutover slipped twice.", answers: [["Organisation", "Contoso Bank"]] }));
    expect(url.searchParams.get("name")).toBe("Alex Morgan");
    expect(url.searchParams.get("email")).toBe("alex@example.test");
    expect(url.searchParams.get("notes")).toBe("Intent: Our S/4HANA cutover slipped twice.\nOrganisation: Contoso Bank");
    expect(url.searchParams.get("embed")).toBe("true");
  });

  it("never books the paid career event from this site, and nothing links to Calendly", () => {
    expect(readFileSync("src/lib/cal.ts", "utf8")).toMatch(/process\.env\.CAL_EVENT_SLUG \|\| "business-consulting-call"/);
    for (const file of [...files("src"), ...files("content/pages")]) {
      expect(readFileSync(file, "utf8"), file).not.toMatch(/calendly\.com\/noeldcosta/);
    }
  });
});
