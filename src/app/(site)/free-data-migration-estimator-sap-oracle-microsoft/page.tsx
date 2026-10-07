import type { Metadata } from "next";
import ToolShell, { toolMetadata } from "@/components/tools/ToolShell";
import MigrationClient from "./MigrationClient";
import { TOOL } from "./tool";

// Page text lives in ./tool (shared with the translated route under
// src/app/(localized)/[locale]/).

export async function generateMetadata(): Promise<Metadata> {
  return toolMetadata(TOOL, "en");
}

export default async function MigrationPage() {
  return (
    <ToolShell slug={TOOL.slug} label={TOOL.label} description={TOOL.description} title={TOOL.title} highlight={TOOL.highlight} group={TOOL.group}>
      <MigrationClient />
    </ToolShell>
  );
}
