"""Point flagged articles at hero stills taken from Noel's own B-roll.

The WordPress heroes for these articles carried claims the articles do not make
("LEAKED: ...", "trimmed $25M"), stock people, third-party logos or
identifiable people. Run from the repo root:  python scripts/swap-heroes.py
Only the English file is changed; translations are regenerated from English.
"""
import re

HEROES = {
    "how-to-create-an-sap-implementation-project-charter": "Noel D'Costa reviewing a printed project document at his desk by the window",
    "erp-implementation-kpis-metrics": "Noel D'Costa working on a laptop in an office overlooking the city at dusk",
    "sap-training-strategies-for-employees-to-drive-adoption": "Noel D'Costa leading a workshop with a project team around a meeting table",
    "2025-the-year-sap-generative-ai-redefines-middle-east-careers": "Noel D'Costa standing in a city business district at dusk",
    "sap-conversational-ai-and-successfactors-for-hr-in-2025": "Noel D'Costa listening during a meeting with a laptop open in front of him",
    "oracle-erp-vs-sap": "Noel D'Costa taking notes at a meeting table with the city skyline behind him",
    "mastering-sap-implementation-a-step-by-step-guide-for-2025": "Noel D'Costa writing notes during a programme meeting at a long boardroom table",
    "sap-ariba-your-2025-guide-to-sourcing-supplier-management": "Noel D'Costa shaking hands with a supplier across a meeting table",
    "best-erp-software-small-business-a-real-world-guide-for-2025": "Noel D'Costa working through a document with a colleague at a shared desk",
    "sap-business-one-price-guide": "Noel D'Costa walking through the lobby of an office building",
    "best-erp-for-manufacturing": "Noel D'Costa talking with a plant engineer on a manufacturing floor",
    "project-planning-and-control-get-sap-projects-back-on-track": "Noel D'Costa reading through printed project papers at his desk",
    "sap-implementation-public-sector-compliance": "Noel D'Costa arriving at a government office building lobby",
    "resource-allocation-planning-for-sap-projects": "Noel D'Costa briefing a project team in a meeting room",
    "erp-modernization-sap-servicenow": "Noel D'Costa typing on a laptop beside a floor-to-ceiling window",
    "my-journey-with-customer-information-solutions-defense": "City skyline at dusk seen from a high vantage point",
    "sap-vs-oracle-which-erp-is-better-for-your-business": "Noel D'Costa on a phone call beside a window overlooking the city",
    "adopt-my-requirements-gathering-template-7-hacks-to-follow": "Noel D'Costa and a colleague going through requirements on paper at a desk",
}

for slug, alt in HEROES.items():
    path = f"content/posts/{slug}/en.mdx"
    text = open(path, encoding="utf-8-sig").read()
    head, sep, body = text.partition("\n---")
    head = re.sub(r'^hero:.*$', f'hero: "/images/heroes/{slug}.webp"', head, count=1, flags=re.M)
    if re.search(r'^heroAlt:', head, flags=re.M):
        head = re.sub(r'^heroAlt:.*$', f'heroAlt: "{alt}"', head, count=1, flags=re.M)
    else:
        head = head.replace(f'hero: "/images/heroes/{slug}.webp"', f'hero: "/images/heroes/{slug}.webp"\nheroAlt: "{alt}"')
    open(path, "w", encoding="utf-8", newline="\n").write(head + sep + body)
    print("updated", slug)
