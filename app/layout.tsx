import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WoW Market Tracker - Professional Auction House Price Tracker",
  description: "Real-time World of Warcraft auction house price tracking with professional charts and analytics. Track prices, set alerts, and optimize your gold making.",
  keywords: ["World of Warcraft", "Auction House", "Price Tracker", "WoW Economy", "Gold Making"],
  authors: [{ name: "WoW Market Tracker" }],
  creator: "WoW Market Tracker",
  publisher: "WoW Market Tracker",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wow-market-tracker.vercel.app",
    title: "WoW Market Tracker - Professional Auction House Price Tracker",
    description: "Real-time World of Warcraft auction house price tracking with professional charts and analytics.",
    siteName: "WoW Market Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "WoW Market Tracker - Professional Auction House Price Tracker",
    description: "Real-time World of Warcraft auction house price tracking with professional charts and analytics.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-text-primary`}
      >
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
