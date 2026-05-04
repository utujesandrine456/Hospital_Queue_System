import type { Metadata } from "next";
import { Sen } from "next/font/google";
import "./globals.css";

const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hospital Smart Queue System",
  description: "Offline-first professional patient management and queue tracking system.",
  manifest: "/manifest.json",
  themeColor: "#769382",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
