import type { Metadata } from "next";
import { getPage } from "@/lib/content";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import ToolShell from "@/components/tools/ToolShell";
import JdClient from "./JdClient";

const SLUG = "sap-job-description-generator";
const LABEL = "SAP Job Description Generator";
const DESCRIPTION =
  "Role-accurate SAP job descriptions with real compensation bands and interview focus areas — calibrated to seniority, region, and the specific SAP role family.";

export async function generateMetadata(): Promise<Metadata> {
  const page = getPage(SLUG, "en");
  if (page) return buildPageMetadata(page);
  return {
    title: LABEL,
    description: DESCRIPTION,
    alternates: { canonical: `${SITE_URL}/${SLUG}/` },
  };
}

export default async function JdPage() {
  return (
    <ToolShell slug={SLUG} label={LABEL} description={DESCRIPTION}>
      <JdClient />
    </ToolShell>
  );
}
