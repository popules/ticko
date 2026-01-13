import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { APP_CONFIG } from "@/config/app";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchProvider } from "@/providers/SearchProvider";
import { WelcomeToast } from "@/components/onboarding/WelcomeToast";
import { CookieConsent } from "@/components/ui/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <SearchProvider>
              {children}
              <MobileNav />
              <WelcomeToast />
              <CookieConsent />
            </SearchProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
