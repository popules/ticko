import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { APP_CONFIG } from "@/config/app";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchProvider } from "@/providers/SearchProvider";
import { CookieConsent } from "@/components/ui/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.title,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  metadataBase: new URL(APP_CONFIG.baseUrl),
  openGraph: {
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
    url: APP_CONFIG.baseUrl,
    siteName: APP_CONFIG.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_CONFIG.title,
    description: APP_CONFIG.description,
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_CONFIG.name,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <SearchProvider>
              {children}
              <MobileNav />
              <CookieConsent />
            </SearchProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
