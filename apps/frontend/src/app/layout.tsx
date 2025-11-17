import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import "../index.css";
import "../styles/product-tour.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: {
    default: "Taman Kehati - Keanekaragaman Hayati Indonesia",
    template: "%s | Taman Kehati",
  },
  description: "Taman Kehati - Portal keanekaragaman hayati Indonesia. Jelajahi taman keanekaragaman hayati, data flora, fauna, dan informasi konservasi terpadu di seluruh Nusantara.",
  keywords: [
    "taman kehati",
    "taman keanekaragaman hayati",
    "konservasi keanekaragaman hayati indonesia",
    "flora fauna indonesia",
    "konservasi alam",
    "keanekaragaman hayati",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "https://tamankehati-8x6q.vercel.app"),
  icons: {
    icon: "/logo/logo_klh.ico",
    shortcut: "/logo/logo_klh.ico",
    apple: "/logo/logo_klh.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Taman Kehati",
    title: "Taman Kehati - Keanekaragaman Hayati Indonesia",
    description: "Portal keanekaragaman hayati Indonesia. Jelajahi taman keanekaragaman hayati, data flora, fauna, dan informasi konservasi terpadu.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taman Kehati - Keanekaragaman Hayati Indonesia",
    description: "Portal keanekaragaman hayati Indonesia. Jelajahi taman keanekaragaman hayati, data flora, fauna, dan informasi konservasi terpadu.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Dancing+Script:wght@400;500;600;700&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
