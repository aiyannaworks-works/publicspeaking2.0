import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Articulate - Master Public Speaking",
  description: "Gamified public speaking trainer. Earn XP, compete with friends, and master the art of articulate communication.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: "#d97e3a",
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
