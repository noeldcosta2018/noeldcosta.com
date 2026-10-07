import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell, {
  localizedToolLocale,
  localizedToolParams,
  toolMetadata,
} from "@/components/tools/ToolShell";
import SolutionClient from "@/app/(site)/sap-solution-builder/SolutionClient";
import { TOOL } from "@/app/(site)/sap-solution-builder/tool";

// Translated sap-solution-builder (/de/sap-solution-builder/ ...),
// only for locales whose interface dictionary is ready. The page around the
// tool is translated; the tool widget itself is English only and marked
// lang="en" (toolInEnglish).

export const dynamicParams = false;

export function generateStaticParams() {
  return localizedToolParams(TOOL.slug);
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = localizedToolLocale(locale, TOOL.slug);
  return content ? toolMetadata(TOOL, content) : {};
}

export default async function LocalizedSolution({ params }: Props) {
  const { locale } = await params;
  const content = localizedToolLocale(locale, TOOL.slug);
  if (!content) notFound();
  return (
    <ToolShell
      slug={TOOL.slug}
      label={TOOL.label}
      description={TOOL.description}
      title={TOOL.title}
      highlight={TOOL.highlight}
      group={TOOL.group}
      locale={content}
      toolInEnglish
    >
      <SolutionClient />
    </ToolShell>
  );
}
