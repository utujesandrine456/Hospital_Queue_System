import type { Metadata, Viewport } from "next";
import { Sen } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { OfflineStatus } from "@/components/layout/OfflineStatus";
import { ApiStatusBanner } from "@/components/layout/ApiStatusBanner";
import { ClearLegacyCache } from "@/components/layout/ClearLegacyCache";


const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#769382',
};

export const metadata: Metadata = {
  title: "MediQueue",
  description: "Skip the physical line — take your queue ticket digitally and track your position in real-time.",
  manifest: "/manifest.json",
  icons: {
    icon: '/images/logo-image.png',
    apple: '/images/logo-image.png',
    shortcut: '/images/logo-image.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MediQueue',
  },
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
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <ClearLegacyCache />
          <ApiStatusBanner />
          {children}
          <OfflineStatus />
        </LanguageProvider>
      </body>
    </html>
  );
}

