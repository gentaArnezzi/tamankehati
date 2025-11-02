import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Dancing_Script, Great_Vibes } from "next/font/google";
import "../globals.css";
import "../index.css";
import "../styles/product-tour.css";
import { Providers } from "./providers";

// Optimasi font loading dengan next/font
const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant-garamond",
});

const dancingScript = Dancing_Script({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dancing-script",
});

const greatVibes = Great_Vibes({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-great-vibes",
});

export const metadata: Metadata = {
  title: "Taman Kehati",
  description: "Taman Kehati - Sistem Manajemen Taman Keanekaragaman Hayati",
  metadataBase: new URL("http://localhost:3000"),
  icons: {
    icon: "/logo/logo_klh.ico",
    shortcut: "/logo/logo_klh.ico",
    apple: "/logo/logo_klh.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html 
      lang="id"
      className={`${cormorantGaramond.variable} ${dancingScript.variable} ${greatVibes.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
