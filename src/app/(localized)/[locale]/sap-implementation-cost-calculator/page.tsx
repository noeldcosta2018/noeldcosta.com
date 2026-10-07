import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolShell, {
  localizedToolLocale,
  localizedToolParams,
  toolMetadata,
} from "@/components/tools/ToolShell";
import { toolCopy, translateFields } from "@/components/tools/tool-i18n";
import { translator } from "@/i18n";
import SapCostClient from "@/app/(site)/sap-implementation-cost-calculator/SapCostClient";
import { FIELDS, HEADING, SUBMIT, TOOL } from "@/app/(site)/sap-implementation-cost-calculator/tool";

// Translated sap-implementation-cost-calculator (/de/sap-implementation-cost-calculator/ ...),
// only for locales whose interface dictionary is ready. The form labels are
// translated on the server (from the route's tool.ts via the dictionary);
// field values and the generated result stay English (result lang="en").

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

export default async function LocalizedSapCost({ params }: Props) {
  const { locale } = await params;
  const content = localizedToolLocale(locale, TOOL.slug);
  if (!content) notFound();
  const tr = translator(content);
  return (
    <ToolShell
      slug={TOOL.slug}
      label={TOOL.label}
      description={TOOL.description}
      title={TOOL.title}
      highlight={TOOL.highlight}
      group={TOOL.group}
      locale={content}
    >
      <SapCostClient
        fields={translateFields(FIELDS, content)}
        heading={tr(HEADING)}
        submitLabel={tr(SUBMIT)}
        copy={toolCopy(content)}
      />
    </ToolShell>
  );
}
