/**
 * The two interface words every explainer figure shows ("Source", "Replay"),
 * per page language. MdxBody passes them as source-label / replay-label, so a
 * translated article never shows English chrome; an attribute written in the
 * MDX itself still wins.
 */
const LABELS: Record<string, { source: string; replay: string; table: string; play: string }> = {
  ar: { source: "المصدر", replay: "إعادة التشغيل", table: "جدول", play: "تشغيل الفيديو" },
  el: { source: "Πηγή", replay: "Επανάληψη", table: "Πίνακας", play: "Αναπαραγωγή βίντεο" },
  hr: { source: "Izvor", replay: "Ponovi", table: "Tablica", play: "Pokreni video" },
  zh: { source: "来源", replay: "重新播放", table: "表格", play: "播放视频" },
  "zh-TW": { source: "來源", replay: "重新播放", table: "表格", play: "播放影片" },
  de: { source: "Quelle", replay: "Wiederholen", table: "Tabelle", play: "Video abspielen" },
  es: { source: "Fuente", replay: "Repetir", table: "Tabla", play: "Reproducir vídeo" },
  fr: { source: "Source", replay: "Rejouer", table: "Tableau", play: "Lire la vidéo" },
  hi: { source: "स्रोत", replay: "फिर से चलाएँ", table: "तालिका", play: "वीडियो चलाएँ" },
  it: { source: "Fonte", replay: "Riproduci", table: "Tabella", play: "Riproduci il video" },
  ja: { source: "出典", replay: "もう一度再生", table: "表", play: "動画を再生" },
  ko: { source: "출처", replay: "다시 보기", table: "표", play: "동영상 재생" },
  nl: { source: "Bron", replay: "Opnieuw afspelen", table: "Tabel", play: "Video afspelen" },
  pt: { source: "Fonte", replay: "Repetir", table: "Tabela", play: "Reproduzir vídeo" },
  ru: { source: "Источник", replay: "Повторить", table: "Таблица", play: "Смотреть видео" },
  tr: { source: "Kaynak", replay: "Tekrar oynat", table: "Tablo", play: "Videoyu oynat" },
};

export function explainerLabels(locale: string | undefined): Record<string, string> {
  const l = locale ? LABELS[locale] : undefined;
  return l ? { "source-label": l.source, "replay-label": l.replay } : {};
}

/** Accessible name of a wide table's scroll frame (it takes keyboard focus). */
export function tableLabel(locale: string | undefined): string {
  return (locale && LABELS[locale]?.table) || "Table";
}

/** Accessible "Play video" label for the YouTube poster button. */
export function playLabel(locale: string | undefined): Record<string, string> {
  const l = locale ? LABELS[locale] : undefined;
  return l ? { "play-label": l.play } : {};
}
