import type { Locale } from "./locales";

interface ArticleMessages {
  home: string;
  category: string;
  contents: string;
  desktopContents: string;
  dateLocale: string;
  updatedPrefix: string;
  reviewedPrefix: string;
  readingTimeSuffix: string;
  englishDestinationTitle: string | undefined;
  englishDestinationNotice: string | null;
  showEnglishArticleModules: boolean;
}

const ENGLISH_ARTICLE_MESSAGES: ArticleMessages = {
  home: "Home",
  category: "SAP Modules",
  contents: "Contents",
  desktopContents: "Table of contents",
  dateLocale: "en-US",
  updatedPrefix: "Updated ",
  reviewedPrefix: "Reviewed ",
  readingTimeSuffix: "min read",
  englishDestinationTitle: undefined,
  englishDestinationNotice: null,
  showEnglishArticleModules: true,
};

const JAPANESE_ARTICLE_MESSAGES: ArticleMessages = {
  home: "ホーム",
  category: "記事",
  contents: "目次",
  desktopContents: "目次",
  dateLocale: "ja-JP",
  updatedPrefix: "更新日 ",
  reviewedPrefix: "確認日 ",
  readingTimeSuffix: "分で読めます",
  englishDestinationTitle: "英語ページ",
  englishDestinationNotice:
    "サイト内ナビゲーションのリンク先は英語ページです。",
  showEnglishArticleModules: false,
};

const LOCALIZED_ARTICLE_MESSAGES: Record<
  Exclude<Locale, "en">,
  ArticleMessages
> = {
  ar: {
    home: "الرئيسية",
    category: "مقالات",
    contents: "المحتويات",
    desktopContents: "المحتويات",
    dateLocale: "ar-AE",
    updatedPrefix: "تم التحديث ",
    reviewedPrefix: "تمت المراجعة ",
    readingTimeSuffix: "دقيقة للقراءة",
    englishDestinationTitle: "صفحة باللغة الإنجليزية",
    englishDestinationNotice:
      "روابط التنقل في الموقع تؤدي إلى صفحات باللغة الإنجليزية.",
    showEnglishArticleModules: false,
  },
  de: {
    home: "Startseite",
    category: "Artikel",
    contents: "Inhalt",
    desktopContents: "Inhaltsverzeichnis",
    dateLocale: "de-DE",
    updatedPrefix: "Aktualisiert ",
    reviewedPrefix: "Geprüft ",
    readingTimeSuffix: "Min. Lesezeit",
    englishDestinationTitle: "Englische Seite",
    englishDestinationNotice:
      "Die Links in der Seitennavigation führen zu englischsprachigen Seiten.",
    showEnglishArticleModules: false,
  },
  es: {
    home: "Inicio",
    category: "Artículos",
    contents: "Contenido",
    desktopContents: "Tabla de contenido",
    dateLocale: "es-ES",
    updatedPrefix: "Actualizado ",
    reviewedPrefix: "Revisado ",
    readingTimeSuffix: "min de lectura",
    englishDestinationTitle: "Página en inglés",
    englishDestinationNotice:
      "Los enlaces de navegación del sitio llevan a páginas en inglés.",
    showEnglishArticleModules: false,
  },
  fr: {
    home: "Accueil",
    category: "Articles",
    contents: "Sommaire",
    desktopContents: "Table des matières",
    dateLocale: "fr-FR",
    updatedPrefix: "Mis à jour ",
    reviewedPrefix: "Révisé ",
    readingTimeSuffix: "min de lecture",
    englishDestinationTitle: "Page en anglais",
    englishDestinationNotice:
      "Les liens de navigation du site mènent vers des pages en anglais.",
    showEnglishArticleModules: false,
  },
  hi: {
    home: "होम",
    category: "लेख",
    contents: "विषय-सूची",
    desktopContents: "विषय-सूची",
    dateLocale: "hi-IN",
    updatedPrefix: "अपडेट किया गया ",
    reviewedPrefix: "समीक्षा की गई ",
    readingTimeSuffix: "मिनट में पढ़ें",
    englishDestinationTitle: "अंग्रेज़ी पृष्ठ",
    englishDestinationNotice:
      "साइट नेविगेशन के लिंक अंग्रेज़ी पृष्ठों पर जाते हैं।",
    showEnglishArticleModules: false,
  },
  it: {
    home: "Pagina iniziale",
    category: "Articoli",
    contents: "Indice",
    desktopContents: "Indice",
    dateLocale: "it-IT",
    updatedPrefix: "Aggiornato ",
    reviewedPrefix: "Revisionato ",
    readingTimeSuffix: "min di lettura",
    englishDestinationTitle: "Pagina in inglese",
    englishDestinationNotice:
      "I link di navigazione del sito portano a pagine in inglese.",
    showEnglishArticleModules: false,
  },
  ja: JAPANESE_ARTICLE_MESSAGES,
  ko: {
    home: "홈",
    category: "기사",
    contents: "목차",
    desktopContents: "목차",
    dateLocale: "ko-KR",
    updatedPrefix: "업데이트 ",
    reviewedPrefix: "검토 ",
    readingTimeSuffix: "분 읽기",
    englishDestinationTitle: "영어 페이지",
    englishDestinationNotice:
      "사이트 탐색 링크는 영어 페이지로 연결됩니다.",
    showEnglishArticleModules: false,
  },
  nl: {
    home: "Startpagina",
    category: "Artikelen",
    contents: "Inhoud",
    desktopContents: "Inhoudsopgave",
    dateLocale: "nl-NL",
    updatedPrefix: "Bijgewerkt ",
    reviewedPrefix: "Beoordeeld ",
    readingTimeSuffix: "min leestijd",
    englishDestinationTitle: "Engelstalige pagina",
    englishDestinationNotice:
      "De navigatielinks op de site leiden naar Engelstalige pagina's.",
    showEnglishArticleModules: false,
  },
  pt: {
    home: "Início",
    category: "Artigos",
    contents: "Índice",
    desktopContents: "Índice",
    dateLocale: "pt-PT",
    updatedPrefix: "Atualizado ",
    reviewedPrefix: "Revisto ",
    readingTimeSuffix: "min de leitura",
    englishDestinationTitle: "Página em inglês",
    englishDestinationNotice:
      "Os links de navegação do site levam a páginas em inglês.",
    showEnglishArticleModules: false,
  },
  ru: {
    home: "Главная",
    category: "Статьи",
    contents: "Содержание",
    desktopContents: "Содержание",
    dateLocale: "ru-RU",
    updatedPrefix: "Обновлено ",
    reviewedPrefix: "Проверено ",
    readingTimeSuffix: "мин чтения",
    englishDestinationTitle: "Страница на английском",
    englishDestinationNotice:
      "Ссылки навигации по сайту ведут на страницы на английском языке.",
    showEnglishArticleModules: false,
  },
  tr: {
    home: "Ana sayfa",
    category: "Makaleler",
    contents: "İçindekiler",
    desktopContents: "İçindekiler",
    dateLocale: "tr-TR",
    updatedPrefix: "Güncellendi ",
    reviewedPrefix: "İncelendi ",
    readingTimeSuffix: "dk okuma",
    englishDestinationTitle: "İngilizce sayfa",
    englishDestinationNotice:
      "Site gezinme bağlantıları İngilizce sayfalara yönlendirir.",
    showEnglishArticleModules: false,
  },
  el: {
    home: "Αρχική",
    category: "Άρθρα",
    contents: "Περιεχόμενα",
    desktopContents: "Περιεχόμενα",
    dateLocale: "el-GR",
    updatedPrefix: "Ενημερώθηκε ",
    reviewedPrefix: "Ελέγχθηκε ",
    readingTimeSuffix: "λεπτά ανάγνωσης",
    englishDestinationTitle: "Αγγλική σελίδα",
    englishDestinationNotice: "Οι σύνδεσμοι πλοήγησης του ιστότοπου οδηγούν σε αγγλικές σελίδες.",
    showEnglishArticleModules: false,
  },
  hr: {
    home: "Početna",
    category: "Članci",
    contents: "Sadržaj",
    desktopContents: "Sadržaj",
    dateLocale: "hr-HR",
    updatedPrefix: "Ažurirano ",
    reviewedPrefix: "Pregledano ",
    readingTimeSuffix: "min čitanja",
    englishDestinationTitle: "Stranica na engleskom",
    englishDestinationNotice: "Navigacijske poveznice vode na stranice na engleskom.",
    showEnglishArticleModules: false,
  },
  "zh-TW": {
    home: "首頁",
    category: "文章",
    contents: "目錄",
    desktopContents: "目錄",
    dateLocale: "zh-TW",
    updatedPrefix: "更新日期 ",
    reviewedPrefix: "審核日期 ",
    readingTimeSuffix: "分鐘閱讀",
    englishDestinationTitle: "英文頁面",
    englishDestinationNotice: "網站導覽連結指向英文頁面。",
    showEnglishArticleModules: false,
  },
  zh: {
    home: "首页",
    category: "文章",
    contents: "目录",
    desktopContents: "目录",
    dateLocale: "zh-CN",
    updatedPrefix: "更新日期 ",
    reviewedPrefix: "审核日期 ",
    readingTimeSuffix: "分钟阅读",
    englishDestinationTitle: "英文页面",
    englishDestinationNotice: "网站导航链接指向英文页面。",
    showEnglishArticleModules: false,
  },
};

export function getArticleMessages(locale: Locale): ArticleMessages {
  return locale === "en"
    ? ENGLISH_ARTICLE_MESSAGES
    : LOCALIZED_ARTICLE_MESSAGES[locale];
}

export function getArticleCategoryLabel(
  locale: Locale,
  defaultLabel: string,
  localizedLabel?: string,
): string {
  if (locale === "en") return defaultLabel;
  return localizedLabel || LOCALIZED_ARTICLE_MESSAGES[locale].category;
}
