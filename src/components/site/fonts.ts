import { Archivo, Outfit, JetBrains_Mono } from "next/font/google";

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

export const fontVariables = `${archivo.variable} ${outfit.variable} ${jetbrainsMono.variable}`;
