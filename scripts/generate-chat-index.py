"""Build src/data/chat-index.json: the chatbot's index of English articles and pages.

Run after content changes:  python scripts/generate-chat-index.py
Only titles, URLs, excerpts and tags go in; bodies stay out to keep the
serverless bundle small (content/** is excluded from function traces).
"""
import glob, json, os, re
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECTIONS = json.load(open(os.path.join(ROOT, "src/data/page-sections.json"), encoding="utf-8"))

def front(path):
    text = open(path, encoding="utf-8-sig").read()
    if not text.startswith("---"):
        return {}
    return yaml.safe_load(text.split("---", 2)[1]) or {}

def url_for(fm, slug):
    original = fm.get("originalUrl") or ""
    m = re.match(r"https?://[^/]+(/.*)$", original)
    path = m.group(1) if m else f"/{slug}/"
    return path if path.endswith("/") else path + "/"

items = []
for kind in ("posts", "pages"):
    for path in sorted(glob.glob(os.path.join(ROOT, "content", kind, "*", "en.mdx"))):
        slug = os.path.basename(os.path.dirname(path))
        fm = front(path)
        if fm.get("noindex") or not fm.get("title"):
            continue
        url = url_for(fm, slug) if kind == "pages" else f"/{slug}/"
        # /about/ redirects to the My story page, which is indexed on its own.
        if slug in ("https-noeldcosta-com-sap-implementation-expert", "about"):
            continue
        section = SECTIONS.get(url, {})
        items.append({
            "title": str(fm.get("h1") or fm.get("title")).strip(),
            "url": url,
            "kind": "article" if kind == "posts" else "page",
            "section": section.get("section"),
            "group": section.get("group"),
            "excerpt": re.sub(r"\s+", " ", str(fm.get("metaDescription") or fm.get("excerpt") or ""))[:300],
            "tags": [str(t) for t in (fm.get("tags") or [])][:8],
        })

out = os.path.join(ROOT, "src/data/chat-index.json")
json.dump(items, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print(f"{len(items)} items -> {out} ({os.path.getsize(out)//1024} KB)")
