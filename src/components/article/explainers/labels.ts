/**
 * The two interface words every explainer figure shows ("Source", "Replay"),
 * per page language. MdxBody passes them as source-label / replay-label, so a
 * translated article never shows English chrome; an attribute written in the
 * MDX itself still wins.
 */
const LABELS: Record<string, { source: string; replay: string; table: string }> = {
  ar: { source: "المصدر", replay: "إعادة التشغيل", table: "جدول" },
  el: { source: "Πηγή", replay: "Επανάληψη", table: "Πίνακας" },
  hr: { source: "Izvor", replay: "Ponovi", table: "Tablica" },
  zh: { source: "来源", replay: "重新播放", table: "表格" },
  "zh-TW": { source: "來源", replay: "重新播放", table: "表格" },
  de: { source: "Quelle", replay: "Wiederholen", table: "Tabelle" },
  es: { source: "Fuente", replay: "Repetir", table: "Tabla" },
  fr: { source: "Source", replay: "Rejouer", table: "Tableau" },
  hi: { source: "स्रोत", replay: "फिर से चलाएँ", table: "तालिका" },
  it: { source: "Fonte", replay: "Riproduci", table: "Tabella" },
  ja: { source: "出典", replay: "もう一度再生", table: "表" },
  ko: { source: "출처", replay: "다시 보기", table: "표" },
  nl: { source: "Bron", replay: "Opnieuw afspelen", table: "Tabel" },
  pt: { source: "Fonte", replay: "Repetir", table: "Tabela" },
  ru: { source: "Источник", replay: "Повторить", table: "Таблица" },
  tr: { source: "Kaynak", replay: "Tekrar oynat", table: "Tablo" },
};

export function explainerLabels(locale: string | undefined): Record<string, string> {
  const l = locale ? LABELS[locale] : undefined;
  return l ? { "source-label": l.source, "replay-label": l.replay } : {};
}

/** Accessible name of a wide table's scroll frame (it takes keyboard focus). */
export function tableLabel(locale: string | undefined): string {
  return (locale && LABELS[locale]?.table) || "Table";
}
