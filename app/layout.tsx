import type { Metadata } from "next";
import { Sen } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/context/LanguageContext";

const sen = Sen({
  variable: "--font-sen",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MediQueue",
  description: "Skip the physical line — take your queue ticket digitally and track your position in real-time.",
  manifest: "/manifest.json",
  themeColor: "#769382",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
                    function(registration) {
                      console.log('MediQueue SW Active:', registration.scope);
                      // Force update if needed
                      registration.update();
                    },
                    function(err) {
                      console.error('MediQueue SW Failed:', err);
                    }
                  );
                });
              }
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPWAPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: '#F3EFE3',
              border: '2px solid #769382',
              color: '#2C3639',
              fontFamily: 'var(--font-sen)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 10px 25px -5px rgba(118, 147, 130, 0.2)',
            },
            className: 'premium-toast',
          }}
        />
        <LanguageProvider>
          {children}
          <OfflineStatus />
        </LanguageProvider>
      </body>
    </html>
  );
}

