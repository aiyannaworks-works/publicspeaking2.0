import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Confidence & Competence - Master Public Speaking",
  description: "Gamified public speaking trainer. Earn XP, compete with friends, and build confidence through interactive practice.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#1cb0f6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1cb0f6" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
