import type { Metadata } from "next";
import { Sen } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/context/LanguageContext";
import { OfflineStatus } from "@/components/layout/OfflineStatus";

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
                  // 1. Force Unregister all legacy workers
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });

                  // 2. Register new Resilient SW
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(
                    function(registration) {
                      console.log('MediQueue SW V6 Active:', registration.scope);
                      registration.update();
                    },
                    function(err) {
                      console.error('MediQueue SW V6 Failed:', err);
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
          <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/40 backdrop-blur-xs border border-sage/10 rounded-full text-[9px] font-bold text-sage/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
              DB_READY: ACTIVE_NODE
            </div>
          </div>
          <OfflineStatus />
        </LanguageProvider>
      </body>
    </html>
  );
}

