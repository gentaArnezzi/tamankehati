import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "../globals.css";
import "../index.css";
import "../styles/product-tour.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Taman Kehati",
  description: "Taman Kehati - Sistem Manajemen Taman Keanekaragaman Hayati",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
      "http://103.125.91.16",
  ),
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
