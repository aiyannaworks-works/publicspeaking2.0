import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Articulate — Master Public Speaking",
  description:
    "Gamified public speaking trainer. Earn XP, compete with friends, and master the art of confident communication through daily practice.",
  keywords: ["public speaking", "communication", "confidence", "speech training", "presentation skills"],
  authors: [{ name: "Articulate" }],
  applicationName: "Articulate",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Articulate",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E8732A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Bricolage+Grotesque:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
