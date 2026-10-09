import { Caveat } from "next/font/google";

// Handwritten notes on the AI Academy page only. Imported by that page, so it
// is preloaded there and nowhere else.
export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});
