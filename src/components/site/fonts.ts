import { Archivo, Caveat, Outfit, JetBrains_Mono, Noto_Kufi_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";

// Display: Archivo with its width axis, set to 125% (Expanded) by .nd-display.
// Free stand-in for the GT Standard Extended face in the MDLBeast reference.
export const archivo = Archivo({
  variable: "--font-archivo",
  // Only Latin is preloaded; latin-ext (Croatian, Turkish and others) still loads on demand.
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

// Body: Outfit, as in the reference.
export const outfit = Outfit({
  variable: "--font-outfit",
  // Only Latin is preloaded; latin-ext (Croatian, Turkish and others) still loads on demand.
  subsets: ["latin"],
  display: "swap",
});

// Code blocks, terminal lines and calculator figures in existing components.
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

// Arabic pages (html[lang="ar"], nd-theme.css): Noto Kufi Arabic for display
// type, IBM Plex Sans Arabic for text. Not preloaded, and only Arabic text uses
// them, so other languages never download these files.
// display "optional": they can't be preloaded for Arabic pages alone, so on slow
// connections they arrived after the first paint and every Arabic heading and
// paragraph re-wrapped (layout shift up to 0.3 on mobile). Now a page keeps the
// font it first painted with: fast connections and later pages get these fonts,
// a slow first visit keeps the system Arabic font instead of jumping.
export const kufiArabic = Noto_Kufi_Arabic({
  variable: "--font-kufi-arabic",
  subsets: ["arabic"],
  display: "optional",
  preload: false,
});

export const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  display: "optional",
  preload: false,
});

// Handwritten notes (HandNote, nd-doodles.css) only. Latin and Cyrillic; other
// scripts fall back to the body font. Not preloaded: the notes are decorative,
// so the file only downloads where a note is on the page.
export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: "700",
  display: "swap",
  preload: false,
});

export const fontVariables = `${archivo.variable} ${outfit.variable} ${jetbrainsMono.variable} ${kufiArabic.variable} ${plexArabic.variable} ${caveat.variable}`;
