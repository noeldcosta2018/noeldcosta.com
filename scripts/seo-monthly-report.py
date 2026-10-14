"""Monthly SEO report for noeldcosta.com (Phase 5 of docs/claude/seo-ranking-plan.md).

Pulls Google Search Console data and writes docs/claude/seo-reports/<YYYY-MM-DD>.md with:
  1. Target queries: position now against the plan's starting point and target.
  2. Clusters: average position and top-3 / top-10 counts for the S/4HANA migration
     and Data & analytics clusters.
  3. Decay: pages that lost more than 30% of clicks, last 90 days against the 90 before.
  4. AI-answer suspects: pages whose position held but whose click-through rate fell.
  5. New pages: whether the cluster pages earn impressions yet, in English and translations.
  6. Data & analytics ideas: Databricks, Snowflake and Fabric searches with no strong page.

Read-only: it only queries Search Console. Run with the gsc virtual environment:
  python -I -X utf8 scripts/seo-monthly-report.py [--end YYYY-MM-DD]
Credentials: %LOCALAPPDATA%/mcp-gsc/mcp-gsc/token.json (never printed).
"""
import argparse
import collections
import datetime as dt
import os
import re

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SITE = "https://noeldcosta.com/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALE_PREFIX = re.compile(r"^/(ar|de|el|es|fr|hi|hr|it|ja|ko|nl|pt|ru|tr|zh-CN|zh-TW)/")

# From the plan's "Where we start" table (12 October 2026).
TARGETS = [
    ("sap vs oracle", r"^(sap vs oracle|oracle vs sap)$", "20", "1 to 3"),
    ("sap implementation cost", r"^sap implementation costs?$", "29", "1 to 3"),
    ("sap clean core", r"^(sap )?clean core$", "17 / 57", "top 5"),
    ("sap ecc to s/4hana migration", r"^(sap )?ecc to s/?4 ?hana migration$", "37 to 67", "top 10"),
    ("sap implementation project", r"^sap implementation project$", "29", "top 5"),
    ("best erp for manufacturing", r"^best erp for manufacturing$", "66 to 70", "top 10"),
    ("sap business one pricing", r"^sap business one pric(e|ing)$", "50", "top 5"),
    ("sap implementation partner", r"^sap implementation (partners?|services)$", "66 to 90", "top 20"),
    ("sap implementation", r"^sap implementation$", "59", "top 20"),
    ("s-user / universal id", r"(s-?user|universal id)", "6.5", "hold"),
]

CLUSTERS = {
    "S/4HANA migration": [
        "ecc-to-s4hana-migration", "s4hana-migration-timeline-project-plan", "s4hana-migration-cost",
        "rise-with-sap-public-vs-private-cloud", "rise-with-sap-contract-pricing",
        "choose-s4hana-migration-partner", "s4hana-migration-cockpit-step-by-step",
        "sap-readiness-check-migration-assessment", "sap-programme-recovery",
    ],
    "Data & analytics": [
        "what-is-databricks-used-for", "databricks-vs-microsoft-fabric", "databricks-pricing-explained",
        "databricks-unity-catalog-data-governance", "databricks-genie-agent-bricks",
        "snowflake-vs-databricks", "snowflake-pricing-credits-explained", "erp-data-into-snowflake",
        "snowflake-cortex-ai-snowflake-intelligence", "snowflake-architecture-explained",
    ],
    "SAP testing": [
        "sap-testing-explained", "sap-testing-validation-tools-comparison", "sap-performance-testing-it-leaders",
        "sap-test-automation-guide", "sap-regression-testing", "s4hana-testing-strategy",
        "sap-user-acceptance-testing", "sap-test-data-management",
    ],
}


def client():
    token = os.path.join(os.environ["LOCALAPPDATA"], "mcp-gsc", "mcp-gsc", "token.json")
    return build("searchconsole", "v1", credentials=Credentials.from_authorized_user_file(token), cache_discovery=False)


def pull(svc, start, end, dims):
    rows, offset = [], 0
    while True:
        body = {"startDate": start, "endDate": end, "dimensions": dims, "rowLimit": 25000,
                "startRow": offset, "dataState": "all", "type": "web"}
        batch = svc.searchanalytics().query(siteUrl=SITE, body=body).execute().get("rows", [])
        rows += batch
        if len(batch) < 25000:
            return rows
        offset += 25000


def path(url):
    return url.replace("https://noeldcosta.com", "") or "/"


def slug_of(p):
    return LOCALE_PREFIX.sub("/", p).strip("/")


def weighted_position(rows):
    imp = sum(r["impressions"] for r in rows)
    return (sum(r["position"] * r["impressions"] for r in rows) / imp) if imp else None


def fmt(x, digits=1):
    return "n/a" if x is None else f"{x:.{digits}f}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--end", help="last day of data (default: 3 days ago)")
    args = ap.parse_args()
    end = dt.date.fromisoformat(args.end) if args.end else dt.date.today() - dt.timedelta(days=3)
    d28 = end - dt.timedelta(days=27)
    cur_start, prev_end = end - dt.timedelta(days=89), end - dt.timedelta(days=90)
    prev_start = prev_end - dt.timedelta(days=89)

    svc = client()
    q28 = pull(svc, d28.isoformat(), end.isoformat(), ["query", "page"])
    pages_cur = {path(r["keys"][0]): r for r in pull(svc, cur_start.isoformat(), end.isoformat(), ["page"])}
    pages_prev = {path(r["keys"][0]): r for r in pull(svc, prev_start.isoformat(), prev_end.isoformat(), ["page"])}

    out = [f"# Monthly SEO report ({end.isoformat()})", "",
           f"Search Console data. Queries: last 28 days ({d28} to {end}). Pages: last 90 days ({cur_start} to {end}) "
           f"against the 90 before ({prev_start} to {prev_end}). Positions are impression-weighted averages.", ""]

    # 1. Target queries (English pages only, as in the plan's baseline).
    out += ["## 1. Target queries", "", "| Query | Start (12 Oct 2026) | Now | Clicks (28d) | Target |", "|---|---|---|---|---|"]
    for label, pattern, start, target in TARGETS:
        rx = re.compile(pattern, re.I)
        rows = [r for r in q28 if rx.search(r["keys"][0]) and not LOCALE_PREFIX.match(path(r["keys"][1]))]
        out.append(f"| {label} | {start} | {fmt(weighted_position(rows))} | {sum(r['clicks'] for r in rows):.0f} | {target} |")
    out.append("")

    # 2. Clusters.
    out += ["## 2. Clusters (all languages)", "",
            "| Cluster | Impressions (28d) | Clicks | Avg position | Queries in top 3 | Queries in top 10 |",
            "|---|---|---|---|---|---|"]
    for name, slugs in CLUSTERS.items():
        rows = [r for r in q28 if slug_of(path(r["keys"][1])) in slugs]
        by_query = collections.defaultdict(list)
        for r in rows:
            by_query[r["keys"][0]].append(r)
        pos = {q: weighted_position(rs) for q, rs in by_query.items()}
        out.append(f"| {name} | {sum(r['impressions'] for r in rows):.0f} | {sum(r['clicks'] for r in rows):.0f} | "
                   f"{fmt(weighted_position(rows))} | {sum(1 for p in pos.values() if p and p <= 3)} | "
                   f"{sum(1 for p in pos.values() if p and p <= 10)} |")
    out += ["", "Exit check for the migration cluster (Phase 3): average position under 20 and at least three queries in the top 3.", ""]

    # 3. Decay.
    decayed = []
    for p, prev in pages_prev.items():
        if prev["clicks"] < 20:
            continue
        cur = pages_cur.get(p, {"clicks": 0, "position": None, "impressions": 0})
        change = (cur["clicks"] - prev["clicks"]) / prev["clicks"]
        if change <= -0.30:
            decayed.append((prev["clicks"] - cur["clicks"], p, prev, cur, change))
    decayed.sort(reverse=True)
    out += ["## 3. Decay: pages down more than 30% in clicks", "",
            "Refresh candidates, largest loss first. A page refreshed in the last 60 days is still settling.", ""]
    if decayed:
        out += ["| Page | Clicks before | Clicks now | Change | Position before | Position now |", "|---|---|---|---|---|---|"]
        for _, p, prev, cur, change in decayed[:20]:
            out.append(f"| {p} | {prev['clicks']:.0f} | {cur['clicks']:.0f} | {change:.0%} | "
                       f"{fmt(prev.get('position'))} | {fmt(cur.get('position'))} |")
    else:
        out.append("No page with 20 or more clicks lost more than 30%.")
    out.append("")

    # 4. AI-answer suspects: a page in the top 15 that held its position (within 2 places)
    # but lost 40% or more of its click-through rate.
    suspects = []
    for p, prev in pages_prev.items():
        cur = pages_cur.get(p)
        if not cur or prev["clicks"] < 10 or prev["impressions"] < 500 or cur["impressions"] < 500 or prev["position"] > 15:
            continue
        if abs(cur["position"] - prev["position"]) <= 2 and cur["ctr"] <= prev["ctr"] * 0.6:
            suspects.append((prev["clicks"] - cur["clicks"], p, prev, cur))
    suspects.sort(reverse=True)
    out += ["## 4. Losing clicks to AI answers (position held, click-through fell)", "",
            "These pages still rank but get fewer clicks. Add a quotable two-sentence answer, a step list or a comparison table.", ""]
    if suspects:
        out += ["| Page | Position before / now | CTR before / now | Clicks before / now |", "|---|---|---|---|"]
        for _, p, prev, cur in suspects[:15]:
            out.append(f"| {p} | {prev['position']:.1f} / {cur['position']:.1f} | {prev['ctr']:.1%} / {cur['ctr']:.1%} | "
                       f"{prev['clicks']:.0f} / {cur['clicks']:.0f} |")
    else:
        out.append("None this month.")
    out.append("")

    # 5. New pages: impressions in the last 28 days per cluster page.
    out += ["## 5. New cluster pages: visible in search yet?", "",
            "Impressions in the last 28 days. Zero means Google has not shown the page yet; request indexing for the English page.", "",
            "| Page | English impressions | Translation impressions | Languages with impressions |", "|---|---|---|---|"]
    for slugs in CLUSTERS.values():
        for s in slugs:
            en = sum(r["impressions"] for r in q28 if path(r["keys"][1]) == f"/{s}/")
            tr = [r for r in q28 if slug_of(path(r["keys"][1])) == s and LOCALE_PREFIX.match(path(r["keys"][1]))]
            langs = {LOCALE_PREFIX.match(path(r["keys"][1])).group(1) for r in tr}
            out.append(f"| /{s}/ | {en:.0f} | {sum(r['impressions'] for r in tr):.0f} | {len(langs)} |")
    out.append("")

    # 6. Data & analytics ideas.
    data_rx = re.compile(r"databricks|snowflake|\bfabric\b|unity catalog|lakehouse|data warehouse|datasphere|business data cloud", re.I)
    ideas = collections.defaultdict(lambda: [0, 0.0])
    for r in q28:
        if data_rx.search(r["keys"][0]):
            ideas[r["keys"][0]][0] += r["impressions"]
            ideas[r["keys"][0]][1] += r["position"] * r["impressions"]
    rows = [(imp, q, wp / imp) for q, (imp, wp) in ideas.items() if imp >= 20 and wp / imp > 10]
    rows.sort(reverse=True)
    out += ["## 6. Data & analytics: next article ideas", "",
            "Searches where the site appears but ranks below position 10. Candidates for the next set of articles.", ""]
    if rows:
        out += ["| Query | Impressions (28d) | Position |", "|---|---|---|"]
        out += [f"| {q} | {imp:.0f} | {pos:.1f} |" for imp, q, pos in rows[:20]]
    else:
        out.append("Not enough data yet.")
    out.append("")

    folder = os.path.join(ROOT, "docs", "claude", "seo-reports")
    os.makedirs(folder, exist_ok=True)
    target = os.path.join(folder, f"{end.isoformat()}.md")
    with open(target, "w", encoding="utf-8", newline="\n") as f:
        f.write("\n".join(out))
    print(target)
    print(f"targets {len(TARGETS)}, decayed {len(decayed)}, ai-suspects {len(suspects)}, data ideas {len(rows)}")


if __name__ == "__main__":
    main()
