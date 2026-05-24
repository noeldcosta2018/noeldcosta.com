import {
  Target,
  Layers,
  Settings,
  RefreshCw,
  AlertCircle,
  Globe,
} from "lucide-react";
import type { ElementType } from "react";

export interface TagInfo {
  label: string;
  description: string;
  icon: ElementType;
}

export const TAG_META: Record<string, TagInfo> = {
  "sap-planning-and-selection": {
    label: "Planning & Selection",
    description: "Vendor shortlisting, readiness, and programme setup.",
    icon: Target,
  },
  "sap-implementation-strategies": {
    label: "Strategy",
    description: "Delivery frameworks, governance, and go-live planning.",
    icon: Layers,
  },
  "sap-technical-decisions": {
    label: "Technical",
    description: "Architecture, integration, and technical risk decisions.",
    icon: Settings,
  },
  "sap-erp-modernization": {
    label: "Modernization & Industry",
    description:
      "Cloud migration, clean core, sector-specific patterns, and ERP transformation.",
    icon: RefreshCw,
  },
  "sap-industry-topics": {
    label: "Modernization & Industry",
    description:
      "Cloud migration, clean core, sector-specific patterns, and ERP transformation.",
    icon: RefreshCw,
  },
  "sap-crisis-management": {
    label: "Crisis & Recovery",
    description: "Programme recovery, risk mitigation, and escalation.",
    icon: AlertCircle,
  },
};

export const TAG_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_META).map(([k, v]) => [k, v.label]),
);

export function tagLabel(tag: string): string {
  return (
    TAG_LABEL[tag] ??
    tag
      .split("-")
      .slice(0, 2)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
      .join(" ")
  );
}

export function tagInfo(tag: string): TagInfo {
  return (
    TAG_META[tag] ?? {
      label: tagLabel(tag),
      description: "",
      icon: Globe,
    }
  );
}

// Tags treated as equivalent for filtering. /tag/sap-erp-modernization/
// and /tag/sap-industry-topics/ both surface the same content because no
// posts use the WordPress-exclusive "sap-erp-modernization" tag string —
// they all use "sap-industry-topics" in frontmatter.
const TAG_ALIASES: Record<string, string[]> = {
  "sap-erp-modernization": ["sap-industry-topics"],
  "sap-industry-topics": ["sap-erp-modernization"],
};

export function tagSynonyms(tag: string): string[] {
  return [tag, ...(TAG_ALIASES[tag] ?? [])];
}

// WordPress publishes these six tag archive URLs in its post_tag-sitemap.xml.
// Keep them in sync with the SEO audit and the route's generateStaticParams.
export const WORDPRESS_TAG_SLUGS = [
  "sap-crisis-management",
  "sap-erp-modernization",
  "sap-implementation-strategies",
  "sap-industry-topics",
  "sap-planning-and-selection",
  "sap-technical-decisions",
] as const;
