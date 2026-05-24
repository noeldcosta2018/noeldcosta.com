import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import SapCostClient from "./SapCostClient";

const SLUG = "sap-implementation-cost-calculator";
const LABEL = "SAP Implementation Cost Calculator";
const DESCRIPTION =
  "SAP-specific cost, licence model, and timeline estimate — RISE, GROW, on-premise, or brownfield. Includes Fiori, ABAP, BTP, and migration costs.";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage(SLUG, "en");
  if (page) return buildPageMetadata(page);
  return {
    title: LABEL,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/${SLUG}/` },
  };
}

export default async function SapCostPage() {
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <SapCostClient />
    </ToolShell>
  );
}
