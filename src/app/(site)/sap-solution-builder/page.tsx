import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import SolutionClient from "./SolutionClient";

const SLUG = "sap-solution-builder";
const LABEL = "SAP Solution Builder";
const DESCRIPTION =
  "Translate a business problem into a phased SAP solution outline — modules, integration architecture, roadmap, and budget envelope. No consultant required.";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage(SLUG, "en");
  if (page) return buildPageMetadata(page);
  return {
    title: LABEL,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/${SLUG}` },
  };
}

export default async function SolutionPage() {
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <SolutionClient />
    </ToolShell>
  );
}
