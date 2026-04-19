import type { Metadata } from "next";
import { Epilogue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noel D'Costa | ERP, Data & AI",
  description:
    "25+ years helping companies migrate ERP, build AI, and get real value from SAP and Oracle systems.",
  openGraph: {
    title: "Noel D'Costa | ERP, Data & AI",
    description:
      "ECC to S/4HANA migrations. AI on top of ERP. Real results.",
    url: "https://noeldcosta.com",
    siteName: "Noel D'Costa",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${epilogue.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
